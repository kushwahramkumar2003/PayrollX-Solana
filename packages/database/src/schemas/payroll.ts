// Payroll schema types and interfaces
export interface PayrollRun {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  payDate: Date;
  status: 'draft' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  totalAmount: number;
  currency: string;
  employeeCount: number;
  blockchainTxId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollItem {
  id: string;
  payrollRunId: string;
  employeeId: string;
  baseSalary: number;
  overtime?: number;
  bonuses?: number;
  deductions?: number;
  netAmount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  blockchainTxId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePayrollRunDto {
  organizationId: string;
  name: string;
  description?: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  payDate: Date;
  currency: string;
}

export interface UpdatePayrollRunDto extends Partial<CreatePayrollRunDto> {
  status?: 'draft' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  totalAmount?: number;
  employeeCount?: number;
  blockchainTxId?: string;
}
