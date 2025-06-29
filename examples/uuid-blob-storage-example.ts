/**
 * Efficient UUID Storage for SQLite/D1
 * Demonstrates BLOB vs STRING storage strategies
 */

import { randomUUID } from 'crypto';

// UUID V7 implementation with BLOB support
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

// UUID conversion utilities
export class UUIDUtils {
  /**
   * Convert UUID string to binary (16 bytes)
   * Example: "550e8400-e29b-41d4-a716-446655440000" -> Uint8Array(16)
   */
  static stringToBytes(uuid: string): Uint8Array {
    const hex = uuid.replace(/-/g, '');
    const bytes = new Uint8Array(16);
    
    for (let i = 0; i < 16; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    
    return bytes;
  }

  /**
   * Convert binary UUID back to string
   * Example: Uint8Array(16) -> "550e8400-e29b-41d4-a716-446655440000"
   */
  static bytesToString(bytes: Uint8Array): string {
    const hex = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return [
      hex.substring(0, 8),
      hex.substring(8, 12),
      hex.substring(12, 16),
      hex.substring(16, 20),
      hex.substring(20, 32)
    ].join('-');
  }

  /**
   * Convert UUID string to compact string (no hyphens)
   * Example: "550e8400-e29b-41d4-a716-446655440000" -> "550e8400e29b41d4a716446655440000"
   */
  static stringToCompact(uuid: string): string {
    return uuid.replace(/-/g, '');
  }

  /**
   * Convert compact string back to standard UUID format
   * Example: "550e8400e29b41d4a716446655440000" -> "550e8400-e29b-41d4-a716-446655440000"
   */
  static compactToString(compact: string): string {
    return [
      compact.substring(0, 8),
      compact.substring(8, 12),
      compact.substring(12, 16),
      compact.substring(16, 20),
      compact.substring(20, 32)
    ].join('-');
  }

  /**
   * Extract timestamp from UUID V7 (works with both string and bytes)
   */
  static extractTimestamp(uuid: string | Uint8Array): Date {
    const hex = typeof uuid === 'string' 
      ? uuid.replace(/-/g, '').substring(0, 12)
      : Array.from(uuid.slice(0, 6)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    const timestamp = parseInt(hex, 16);
    return new Date(timestamp);
  }
}

// Storage strategy enum
export enum UUIDStorageStrategy {
  BLOB = 'blob',           // 16 bytes - most efficient
  COMPACT_STRING = 'compact', // 32 bytes - good compromise
  FULL_STRING = 'string'   // 36 bytes - human readable
}

// Updated branded types with storage strategy
type ContactId = string & { __brand: 'ContactId'; __type: 'UUIDv4'; __storage: UUIDStorageStrategy };
type ActivityId = string & { __brand: 'ActivityId'; __type: 'UUIDv7'; __storage: UUIDStorageStrategy };

// Repository with storage strategy support
export class OptimizedCRMRepository {
  constructor(
    private db: any, 
    private storageStrategy: UUIDStorageStrategy = UUIDStorageStrategy.BLOB
  ) {}

  // Insert contact with optimized UUID storage
  async createContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = randomUUID();
    const now = new Date();

    let storedId: string | Uint8Array;
    let storedTenantId: string | Uint8Array;

    switch (this.storageStrategy) {
      case UUIDStorageStrategy.BLOB:
        storedId = UUIDUtils.stringToBytes(id);
        storedTenantId = UUIDUtils.stringToBytes(contact.tenantId);
        break;
      case UUIDStorageStrategy.COMPACT_STRING:
        storedId = UUIDUtils.stringToCompact(id);
        storedTenantId = UUIDUtils.stringToCompact(contact.tenantId);
        break;
      case UUIDStorageStrategy.FULL_STRING:
      default:
        storedId = id;
        storedTenantId = contact.tenantId;
        break;
    }

    await this.db.run(`
      INSERT INTO contacts (id, tenant_id, first_name, last_name, email, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [storedId, storedTenantId, contact.firstName, contact.lastName, contact.email, now, now]);

    return { ...contact, id: id as ContactId, createdAt: now, updatedAt: now };
  }

  // Query with proper ID conversion
  async findContactById(id: ContactId, tenantId: string): Promise<Contact | null> {
    let queryId: string | Uint8Array;
    let queryTenantId: string | Uint8Array;

    // Convert IDs based on storage strategy
    switch (this.storageStrategy) {
      case UUIDStorageStrategy.BLOB:
        queryId = UUIDUtils.stringToBytes(id);
        queryTenantId = UUIDUtils.stringToBytes(tenantId);
        break;
      case UUIDStorageStrategy.COMPACT_STRING:
        queryId = UUIDUtils.stringToCompact(id);
        queryTenantId = UUIDUtils.stringToCompact(tenantId);
        break;
      default:
        queryId = id;
        queryTenantId = tenantId;
        break;
    }

    const result = await this.db.get(`
      SELECT * FROM contacts 
      WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL
    `, [queryId, queryTenantId]);

    if (!result) return null;

    // Convert stored IDs back to string format for application use
    return {
      ...result,
      id: this.convertStoredIdToString(result.id) as ContactId,
      tenantId: this.convertStoredIdToString(result.tenant_id),
    };
  }

  // Create activity with V7 UUID and optimized storage
  async createActivity(activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = generateUUIDv7();
    const now = new Date();

    let storedId: string | Uint8Array;
    let storedContactId: string | Uint8Array;
    let storedTenantId: string | Uint8Array;

    switch (this.storageStrategy) {
      case UUIDStorageStrategy.BLOB:
        storedId = UUIDUtils.stringToBytes(id);
        storedContactId = UUIDUtils.stringToBytes(activity.contactId);
        storedTenantId = UUIDUtils.stringToBytes(activity.tenantId);
        break;
      case UUIDStorageStrategy.COMPACT_STRING:
        storedId = UUIDUtils.stringToCompact(id);
        storedContactId = UUIDUtils.stringToCompact(activity.contactId);
        storedTenantId = UUIDUtils.stringToCompact(activity.tenantId);
        break;
      default:
        storedId = id;
        storedContactId = activity.contactId;
        storedTenantId = activity.tenantId;
        break;
    }

    await this.db.run(`
      INSERT INTO activities (id, contact_id, tenant_id, type, subject, content, occurred_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [storedId, storedContactId, storedTenantId, activity.type, activity.subject, 
        activity.content, activity.occurredAt, now, now]);

    return { ...activity, id: id as ActivityId, createdAt: now, updatedAt: now };
  }

  // Get recent activities with time-range optimization (V7 benefit)
  async getRecentActivities(contactId: ContactId, tenantId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    let queryContactId: string | Uint8Array;
    let queryTenantId: string | Uint8Array;

    switch (this.storageStrategy) {
      case UUIDStorageStrategy.BLOB:
        queryContactId = UUIDUtils.stringToBytes(contactId);
        queryTenantId = UUIDUtils.stringToBytes(tenantId);
        break;
      case UUIDStorageStrategy.COMPACT_STRING:
        queryContactId = UUIDUtils.stringToCompact(contactId);
        queryTenantId = UUIDUtils.stringToCompact(tenantId);
        break;
      default:
        queryContactId = contactId;
        queryTenantId = tenantId;
        break;
    }

    const results = await this.db.all(`
      SELECT * FROM activities 
      WHERE contact_id = ? AND tenant_id = ? AND occurred_at >= ?
      ORDER BY occurred_at DESC
    `, [queryContactId, queryTenantId, since]);

    // Convert stored IDs back to strings
    return results.map((row: any) => ({
      ...row,
      id: this.convertStoredIdToString(row.id) as ActivityId,
      contactId: this.convertStoredIdToString(row.contact_id) as ContactId,
      tenantId: this.convertStoredIdToString(row.tenant_id),
    }));
  }

  private convertStoredIdToString(storedId: any): string {
    switch (this.storageStrategy) {
      case UUIDStorageStrategy.BLOB:
        return UUIDUtils.bytesToString(new Uint8Array(storedId));
      case UUIDStorageStrategy.COMPACT_STRING:
        return UUIDUtils.compactToString(storedId);
      default:
        return storedId;
    }
  }
}

// Schema definitions for different storage strategies
export const schemaDefinitions = {
  // Most efficient - BLOB storage (16 bytes per UUID)
  blob: {
    contacts: `
      CREATE TABLE contacts (
        id BLOB(16) PRIMARY KEY,
        tenant_id BLOB(16) NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME,
        UNIQUE(tenant_id, email)
      );
      CREATE INDEX idx_contacts_tenant ON contacts(tenant_id);
      CREATE INDEX idx_contacts_email ON contacts(email);
    `,
    
    activities: `
      CREATE TABLE activities (
        id BLOB(16) PRIMARY KEY,
        contact_id BLOB(16) NOT NULL,
        tenant_id BLOB(16) NOT NULL,
        type TEXT NOT NULL,
        subject TEXT NOT NULL,
        content TEXT,
        occurred_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts (id)
      );
      CREATE INDEX idx_activities_contact_time ON activities(contact_id, occurred_at);
      CREATE INDEX idx_activities_tenant ON activities(tenant_id);
    `
  },

  // Good compromise - compact string storage (32 bytes per UUID)
  compact: {
    contacts: `
      CREATE TABLE contacts (
        id TEXT(32) PRIMARY KEY,
        tenant_id TEXT(32) NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME,
        UNIQUE(tenant_id, email)
      );
    `,
    
    activities: `
      CREATE TABLE activities (
        id TEXT(32) PRIMARY KEY,
        contact_id TEXT(32) NOT NULL,
        tenant_id TEXT(32) NOT NULL,
        type TEXT NOT NULL,
        subject TEXT NOT NULL,
        content TEXT,
        occurred_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `
  },

  // Human readable - full string storage (36 bytes per UUID)
  full: {
    contacts: `
      CREATE TABLE contacts (
        id TEXT(36) PRIMARY KEY,
        tenant_id TEXT(36) NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME,
        UNIQUE(tenant_id, email)
      );
    `
  }
};

// Performance comparison
export const storageComparison = {
  blob: {
    size: '16 bytes per UUID',
    pros: [
      'Most space efficient',
      'Fastest comparisons',
      'Best for large datasets',
      'Native binary operations'
    ],
    cons: [
      'Not human readable',
      'Requires conversion logic',
      'Debugging complexity'
    ],
    recommendation: 'Production with large scale'
  },
  
  compact: {
    size: '32 bytes per UUID (56% reduction vs full)',
    pros: [
      'Good space savings',
      'Simpler than BLOB',
      'Still relatively fast',
      'Easier debugging than BLOB'
    ],
    cons: [
      'Not as efficient as BLOB',
      'Still requires some conversion',
      'Not standard UUID format'
    ],
    recommendation: 'Good balance for most applications'
  },
  
  full: {
    size: '36 bytes per UUID',
    pros: [
      'Human readable',
      'Standard format',
      'No conversion needed',
      'Easy debugging'
    ],
    cons: [
      'Largest storage footprint',
      'Slower string operations',
      'More network bandwidth'
    ],
    recommendation: 'Development and small datasets'
  }
};

// Usage examples
export async function demonstrateStorageStrategies() {
  // Example with BLOB storage (most efficient)
  const blobRepo = new OptimizedCRMRepository(db, UUIDStorageStrategy.BLOB);
  
  // Example with compact string storage (good balance)
  const compactRepo = new OptimizedCRMRepository(db, UUIDStorageStrategy.COMPACT_STRING);
  
  // Example with full string storage (human readable)
  const stringRepo = new OptimizedCRMRepository(db, UUIDStorageStrategy.FULL_STRING);
  
  // All methods work the same way regardless of storage strategy
  const contact = await blobRepo.createContact({
    tenantId: 'tenant-uuid-here',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
  });
  
  // IDs are always returned as standard UUID strings for application use
  console.log(contact.id); // "550e8400-e29b-41d4-a716-446655440000"
}

/**
 * Recommendation for your CRM:
 * 
 * For Production:
 * - Use BLOB storage for maximum efficiency
 * - Implement conversion utilities (shown above)
 * - 56% storage savings vs full strings
 * - Faster queries and comparisons
 * 
 * For Development:
 * - Use full string storage for easier debugging
 * - Convert to BLOB when moving to production
 * 
 * Middle Ground:
 * - Use compact strings (32 bytes vs 36)
 * - Still readable in database tools
 * - Good performance improvement
 */
