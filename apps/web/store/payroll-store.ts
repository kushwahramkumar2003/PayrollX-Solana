import { create } from "zustand";

export interface PayrollRun {
  id: string;
  organizationId: string;
  status: "DRAFT" | "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  totalAmount: number;
  currency: "SOL" | "USDC";
  employeeCount: number;
  scheduledDate: string;
  createdAt: string;
  updatedAt: string;
  items?: PayrollItem[];
}

export interface PayrollItem {
  id: string;
  runId: string;
  employeeId: string;
  employeeName: string;
  employeeWallet: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  transactionSignature?: string;
  error?: string;
}

interface PayrollState {
  runs: PayrollRun[];
  currentRun: PayrollRun | null;
  isLoading: boolean;
  setRuns: (runs: PayrollRun[]) => void;
  setCurrentRun: (run: PayrollRun | null) => void;
  updateRunStatus: (id: string, status: PayrollRun["status"]) => void;
  updateItemStatus: (
    runId: string,
    itemId: string,
    status: PayrollItem["status"],
    signature?: string,
    error?: string
  ) => void;
  setLoading: (loading: boolean) => void;
  addRun: (run: PayrollRun) => void;
  removeRun: (id: string) => void;
}

export const usePayrollStore = create<PayrollState>((set) => ({
  runs: [],
  currentRun: null,
  isLoading: false,
  setRuns: (runs) => set({ runs }),
  setCurrentRun: (run) => set({ currentRun: run }),
  updateRunStatus: (id, status) =>
    set((state) => ({
      runs: state.runs.map((r) => (r.id === id ? { ...r, status } : r)),
      currentRun:
        state.currentRun?.id === id
          ? { ...state.currentRun, status }
          : state.currentRun,
    })),
  updateItemStatus: (runId, itemId, status, signature, error) =>
    set((state) => ({
      runs: state.runs.map((run) =>
        run.id === runId
          ? {
              ...run,
              items: run.items?.map((item) =>
                item.id === itemId
                  ? { ...item, status, transactionSignature: signature, error }
                  : item
              ),
            }
          : run
      ),
      currentRun:
        state.currentRun?.id === runId
          ? {
              ...state.currentRun,
              items: state.currentRun.items?.map((item) =>
                item.id === itemId
                  ? { ...item, status, transactionSignature: signature, error }
                  : item
              ),
            }
          : state.currentRun,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  addRun: (run) => set((state) => ({ runs: [...state.runs, run] })),
  removeRun: (id) =>
    set((state) => ({ runs: state.runs.filter((r) => r.id !== id) })),
}));

