// Employee schema types and interfaces
export interface Employee {
  id: string;
  organizationId: string;
  userId: string;
  employeeId: string; // Company employee ID
  department?: string;
  position?: string;
  hireDate: Date;
  salary?: number;
  currency?: string;
  isActive: boolean;
  kycStatus: 'pending' | 'verified' | 'rejected';
  walletAddress?: string;
  bankAccount?: BankAccount;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankAccount {
  id: string;
  employeeId: string;
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  accountType: 'checking' | 'savings';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeDto {
  organizationId: string;
  userId: string;
  employeeId: string;
  department?: string;
  position?: string;
  hireDate: Date;
  salary?: number;
  currency?: string;
  walletAddress?: string;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {
  isActive?: boolean;
  kycStatus?: 'pending' | 'verified' | 'rejected';
}
