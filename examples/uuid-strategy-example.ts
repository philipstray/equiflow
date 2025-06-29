/**
 * UUID Strategy Implementation Example for CRM
 * Demonstrates V4 vs V7 usage patterns
 */

import { randomUUID } from 'crypto';

// Import drizzle types (these would be actual imports in your project)
type DrizzleDB = any;
type AndFn = (...args: any[]) => any;
type EqFn = (column: any, value: any) => any;
type GteFn = (column: any, value: any) => any;
type LteFn = (column: any, value: any) => any;
type IsNullFn = (column: any) => any;
type DescFn = (column: any) => any;

// Mock drizzle functions for this example
const and: AndFn = (...args) => args;
const eq: EqFn = (column, value) => ({ column, value, op: 'eq' });
const gte: GteFn = (column, value) => ({ column, value, op: 'gte' });
const lte: LteFn = (column, value) => ({ column, value, op: 'lte' });
const isNull: IsNullFn = (column) => ({ column, op: 'isNull' });
const desc: DescFn = (column) => ({ column, order: 'desc' });

// UUID V7 implementation (time-ordered)
function generateUUIDv7(): string {
  const timestamp = BigInt(Date.now());
  const timestampHex = timestamp.toString(16).padStart(12, '0');
  const randomPart = randomUUID().replace(/-/g, '').substring(12);
  
  return [
    timestampHex.substring(0, 8),
    timestampHex.substring(8, 12),
    '7' + timestampHex.substring(12, 15),
    randomPart.substring(0, 4),
    randomPart.substring(4, 16)
  ].join('-');
}

// Branded types for different UUID strategies
type ContactId = string & { __brand: 'ContactId'; __type: 'UUIDv4' };
type CompanyId = string & { __brand: 'CompanyId'; __type: 'UUIDv4' };
type DealId = string & { __brand: 'DealId'; __type: 'UUIDv4' };
type UserId = string & { __brand: 'UserId'; __type: 'UUIDv4' };

type ActivityId = string & { __brand: 'ActivityId'; __type: 'UUIDv7' };
type AuditLogId = string & { __brand: 'AuditLogId'; __type: 'UUIDv7' };
type EventId = string & { __brand: 'EventId'; __type: 'UUIDv7' };
type FileId = string & { __brand: 'FileId'; __type: 'UUIDv7' };

// UUID generators with proper typing
export const createContactId = (): ContactId => randomUUID() as ContactId;
export const createCompanyId = (): CompanyId => randomUUID() as CompanyId;
export const createDealId = (): DealId => randomUUID() as DealId;
export const createUserId = (): UserId => randomUUID() as UserId;

export const createActivityId = (): ActivityId => generateUUIDv7() as ActivityId;
export const createAuditLogId = (): AuditLogId => generateUUIDv7() as AuditLogId;
export const createEventId = (): EventId => generateUUIDv7() as EventId;
export const createFileId = (): FileId => generateUUIDv7() as FileId;

// Example table schemas with appropriate UUID types
export interface Contact {
  id: ContactId;           // V4 - core business entity
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Activity {
  id: ActivityId;          // V7 - temporal data
  contactId: ContactId;    // V4 - reference to core entity
  tenantId: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  subject: string;
  content: string;
  occurredAt: Date;        // When the activity happened
  createdAt: Date;         // When it was recorded
  updatedAt: Date;
}

export interface AuditLog {
  id: AuditLogId;          // V7 - always chronological
  tenantId: string;
  userId: UserId;          // V4 - reference to user
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  changes: Record<string, any>;
  createdAt: Date;
}

export interface FileUpload {
  id: FileId;              // V7 - often queried by upload time
  tenantId: string;
  userId: UserId;          // V4 - reference to user
  filename: string;
  contentType: string;
  size: number;
  r2Key: string;
  uploadedAt: Date;
  createdAt: Date;
}

// Database query examples showing the benefits
export class CRMRepository {
  constructor(private db: DrizzleDB) {}

  // V4 queries - typical CRUD operations
  async findContactById(id: ContactId, tenantId: string) {
    // Example query structure (using actual drizzle syntax in real implementation)
    return this.db.query(`
      SELECT * FROM contacts 
      WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL
    `, [id, tenantId]);
  }

  // V7 queries - time-based operations are efficient
  async getRecentActivities(contactId: ContactId, tenantId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // V7 UUIDs make this query very efficient due to temporal ordering
    // The database can use the time-ordered nature of V7 UUIDs for optimization
    return this.db.query(`
      SELECT * FROM activities 
      WHERE contact_id = ? AND tenant_id = ? AND occurred_at >= ?
      ORDER BY occurred_at DESC
    `, [contactId, tenantId, since]);
  }

  // Audit log queries benefit greatly from V7 ordering
  async getAuditTrail(entityId: string, tenantId: string, timeRange: { start: Date; end: Date }) {
    // V7 UUIDs + temporal queries = excellent performance
    return this.db.query(`
      SELECT * FROM audit_logs 
      WHERE entity_id = ? AND tenant_id = ? 
      AND created_at BETWEEN ? AND ?
      ORDER BY created_at DESC
    `, [entityId, tenantId, timeRange.start, timeRange.end]);
  }

  // File queries often need temporal ordering
  async getRecentUploads(tenantId: string, limit = 50) {
    // V7 UUIDs make pagination efficient without complex cursors
    return this.db.query(`
      SELECT * FROM file_uploads 
      WHERE tenant_id = ? 
      ORDER BY uploaded_at DESC 
      LIMIT ?
    `, [tenantId, limit]);
  }
}

// Mock Drizzle schema examples (would use actual drizzle-orm imports in real project)
type TableColumn = { name: string; type: string };
type TableDefinition = { columns: Record<string, TableColumn> };

const mockTable = (name: string, columns: Record<string, TableColumn>): TableDefinition => ({
  columns
});

export const contacts = mockTable('contacts', {
  id: { name: 'id', type: 'varchar(36)' }, // V4 UUID
  tenantId: { name: 'tenant_id', type: 'varchar(36)' },
  firstName: { name: 'first_name', type: 'varchar(100)' },
  lastName: { name: 'last_name', type: 'varchar(100)' },
  email: { name: 'email', type: 'varchar(255)' },
  createdAt: { name: 'created_at', type: 'timestamp' },
  updatedAt: { name: 'updated_at', type: 'timestamp' },
  deletedAt: { name: 'deleted_at', type: 'timestamp' },
});

export const activities = mockTable('activities', {
  id: { name: 'id', type: 'varchar(36)' }, // V7 UUID
  contactId: { name: 'contact_id', type: 'varchar(36)' },
  tenantId: { name: 'tenant_id', type: 'varchar(36)' },
  type: { name: 'type', type: 'varchar(20)' },
  subject: { name: 'subject', type: 'varchar(255)' },
  content: { name: 'content', type: 'varchar(5000)' },
  occurredAt: { name: 'occurred_at', type: 'timestamp' },
  createdAt: { name: 'created_at', type: 'timestamp' },
  updatedAt: { name: 'updated_at', type: 'timestamp' },
});

export const auditLogs = mockTable('audit_logs', {
  id: { name: 'id', type: 'varchar(36)' }, // V7 UUID
  tenantId: { name: 'tenant_id', type: 'varchar(36)' },
  userId: { name: 'user_id', type: 'varchar(36)' },
  entityType: { name: 'entity_type', type: 'varchar(50)' },
  entityId: { name: 'entity_id', type: 'varchar(36)' },
  action: { name: 'action', type: 'varchar(20)' },
  changes: { name: 'changes', type: 'json' },
  createdAt: { name: 'created_at', type: 'timestamp' },
});

// Index strategies for different UUID types
export const indexStrategies = {
  // V4 UUIDs - standard indexes
  contacts: [
    'CREATE INDEX contacts_tenant_id_idx ON contacts(tenant_id)',
    'CREATE INDEX contacts_email_idx ON contacts(email)',
  ],
  
  // V7 UUIDs - temporal indexes are very efficient
  activities: [
    'CREATE INDEX activities_occurred_at_idx ON activities(occurred_at)',
    'CREATE INDEX activities_contact_time_idx ON activities(contact_id, occurred_at)',
  ],
  
  auditLogs: [
    'CREATE INDEX audit_logs_created_at_idx ON audit_logs(created_at)',
    'CREATE INDEX audit_logs_entity_time_idx ON audit_logs(entity_type, entity_id, created_at)',
  ],
};

/**
 * Performance Benefits Summary:
 * 
 * V4 UUIDs (Random):
 * - Good for security and preventing enumeration
 * - Random distribution reduces hot spots
 * - Better for entities that don't need temporal ordering
 * 
 * V7 UUIDs (Time-ordered):
 * - ~40% better insert performance due to sequential ordering
 * - More efficient range queries on time-based data
 * - Better cache locality for recent data
 * - Reduced index fragmentation over time
 * - Natural pagination ordering
 * 
 * Trade-offs:
 * - V7 reveals creation time (may be a security consideration)
 * - V4 causes more B-tree page splits on heavy insert workloads
 * - V7 can create hot spots if all inserts happen on same node
 */
