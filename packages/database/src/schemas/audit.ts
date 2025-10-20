// Audit schema types and interfaces
export interface AuditLog {
  id: string;
  organizationId?: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface CreateAuditLogDto {
  organizationId?: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditSnapshot {
  id: string;
  organizationId: string;
  resourceType: string;
  resourceId: string;
  snapshot: Record<string, any>;
  version: number;
  createdAt: Date;
}

export interface CreateAuditSnapshotDto {
  organizationId: string;
  resourceType: string;
  resourceId: string;
  snapshot: Record<string, any>;
  version: number;
}
