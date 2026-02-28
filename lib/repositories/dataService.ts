import { supabase } from "@/lib/subabase";

// Generic DataService base for any table
class DataService<T extends Record<string, any>, K extends keyof T = keyof T> {
  constructor(
    private table: string,
    private idField: K, // e.g. "programNo", "id"
  ) {}

  async get() {
    const result = await supabase.from(this.table).select("*");
    if (result.error) throw new Error(result.error.message);
    return result;
  }

  async getRow(id: T[K]) {
    const { data, error } = await supabase
      .from(this.table)
      .select("*")
      .eq(this.idField as string, id)
      .limit(1)
      .single();
    return { data, error };
  }

  async create(payload: Omit<T, K>) {
    const result = await supabase.from(this.table).insert([payload]);
    if (result.error) throw new Error(result.error.message);
    return result;
  }

  async createMany(payloads: Partial<T>[]) {
    if (payloads.length === 0) {
      return { data: [], error: null };
    }
    const result = await supabase.from(this.table).insert(payloads);
    if (result.error) throw new Error(result.error.message);
    return result;
  }

  async update(id: T[K], payload: Partial<T>) {
    const result = await supabase
      .from(this.table)
      .update(payload)
      .eq(this.idField as string, id);
    if (result.error) throw new Error(result.error.message);
    return result;
  }

  async destroy(id: T[K]) {
    const result = await supabase
      .from(this.table)
      .delete()
      .eq(this.idField as string, id)
      .select(String(this.idField));

    if (result.error) {
      throw new Error(
        `Delete failed in ${this.table} where ${String(this.idField)}=${String(id)}: ${result.error.message}`,
      );
    }
    if (!result.data || result.data.length === 0) {
      throw new Error(
        `Delete matched 0 rows in ${this.table} where ${String(this.idField)}=${String(id)}. Check RLS/policies or row visibility.`,
      );
    }
    return result;
  }
}

export { DataService };
