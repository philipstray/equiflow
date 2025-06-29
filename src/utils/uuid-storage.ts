/**
 * UUID Utils for Equiflow CRM
 * Production-ready UUID storage optimization for D1
 */

export class EquiflowUUIDUtils {
  /**
   * Convert UUID string to BLOB for D1 storage
   */
  static toBlob(uuid: string): Uint8Array {
    const hex = uuid.replace(/-/g, '');
    const bytes = new Uint8Array(16);
    
    for (let i = 0; i < 16; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    
    return bytes;
  }

  /**
   * Convert BLOB back to UUID string for application use
   */
  static fromBlob(bytes: Uint8Array): string {
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
   * Create contact ID (V4 UUID as BLOB)
   */
  static createContactId(): Uint8Array {
    return this.toBlob(crypto.randomUUID());
  }

  /**
   * Create activity ID (V7 UUID as BLOB)
   */
  static createActivityId(): Uint8Array {
    // V7 UUID implementation
    const timestamp = BigInt(Date.now());
    const timestampHex = timestamp.toString(16).padStart(12, '0');
    const randomPart = crypto.randomUUID().replace(/-/g, '').substring(12);
    
    const v7UUID = [
      timestampHex.substring(0, 8),
      timestampHex.substring(8, 12),
      '7' + timestampHex.substring(12, 15),
      randomPart.substring(0, 4),
      randomPart.substring(4, 16)
    ].join('-');
    
    return this.toBlob(v7UUID);
  }
}

// D1 Schema with BLOB UUIDs
export const d1Schema = `
  CREATE TABLE contacts (
    id BLOB(16) PRIMARY KEY,
    tenant_id BLOB(16) NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME
  );

  CREATE INDEX idx_contacts_tenant ON contacts(tenant_id);
  CREATE INDEX idx_contacts_email ON contacts(tenant_id, email);

  CREATE TABLE activities (
    id BLOB(16) PRIMARY KEY,
    contact_id BLOB(16) NOT NULL,
    tenant_id BLOB(16) NOT NULL,
    type TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT,
    occurred_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_activities_contact_time ON activities(contact_id, occurred_at);
  CREATE INDEX idx_activities_tenant_time ON activities(tenant_id, occurred_at);
`;
