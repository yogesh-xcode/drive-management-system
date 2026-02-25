import { supabase } from "@/lib/subabase";

// Generic DataService base for any table
class DataService<T extends Record<string, any>, K extends keyof T = keyof T> {
  constructor(
    private table: string,
    private idField: K // e.g. "programNo", "id"
  ) {}

  async get() {
    return await supabase.from(this.table).select("*");
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
    // For auto IDs: You can relax Omit<T, K> to T if needed
    return await supabase.from(this.table).insert([payload]);
  }

  async update(id: T[K], payload: Partial<T>) {
    return await supabase
      .from(this.table)
      .update(payload)
      .eq(this.idField as string, id);
  }

  async destroy(id: T[K]) {
    return await supabase
      .from(this.table)
      .delete()
      .eq(this.idField as string, id);
  }
}

export { DataService };
