import { create } from "zustand";

export interface Employee {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  email: string;
  walletAddress?: string;
  salary: number;
  paymentToken: "SOL" | "USDC";
  kycStatus: "PENDING" | "VERIFIED" | "APPROVED" | "REJECTED";
  kycDocuments: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmployeeState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  isLoading: boolean;
  setEmployees: (employees: Employee[]) => void;
  setSelectedEmployee: (employee: Employee | null) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  setLoading: (loading: boolean) => void;
  addEmployee: (employee: Employee) => void;
  removeEmployee: (id: string) => void;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employees: [],
  selectedEmployee: null,
  isLoading: false,
  setEmployees: (employees) => set({ employees }),
  setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),
  updateEmployee: (id, updates) =>
    set((state) => ({
      employees: state.employees.map((emp) =>
        emp.id === id ? { ...emp, ...updates } : emp
      ),
      selectedEmployee:
        state.selectedEmployee?.id === id
          ? { ...state.selectedEmployee, ...updates }
          : state.selectedEmployee,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  addEmployee: (employee) =>
    set((state) => ({ employees: [...state.employees, employee] })),
  removeEmployee: (id) =>
    set((state) => ({
      employees: state.employees.filter((emp) => emp.id !== id),
      selectedEmployee:
        state.selectedEmployee?.id === id ? null : state.selectedEmployee,
    })),
}));

