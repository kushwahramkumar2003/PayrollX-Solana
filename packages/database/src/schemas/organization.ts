// Organization schema types and interfaces
export interface Organization {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
  taxId?: string;
  registrationNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSigner {
  id: string;
  organizationId: string;
  userId: string;
  role: 'admin' | 'hr_manager' | 'finance_manager';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationDto {
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
  taxId?: string;
  registrationNumber?: string;
}

export interface UpdateOrganizationDto extends Partial<CreateOrganizationDto> {
  isActive?: boolean;
}
