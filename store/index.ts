import { create } from "zustand";

// You can type `record` for your use case; here kept generic (any object)
type SidePeakStore = {
  open: boolean;
  record: Record<string, any> | null;
  // ACTIONS
  openWith: (record: Record<string, any>) => void;
  close: () => void;
};

export const useSidePeakStore = create<SidePeakStore>((set) => ({
  open: false,
  record: null,
  openWith: (record) => set({ open: true, record }),
  close: () => set({ open: false, record: null }),
}));
