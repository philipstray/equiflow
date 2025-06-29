/**
 * Utility functions for creating branded types
 * Following UUID strategy from guidelines
 */

import { 
  ContactId, 
  TenantId, 
  Email, 
  PhoneNumber, 
  CompanyId, 
  ContactTag,
  CompanyTag,
  DealId,
  ProductId,
  OrderId,
  MeetingId,
  TransactionId,
  ActivityId,
  LocationId,
  UserId,
  AuditLogId,
  FileId
} from './types';

// UUID generators (V4 for business entities, V7 for temporal data)
function generateUUIDv4(): string {
  return crypto.randomUUID();
}

function generateUUIDv7(): string {
  // Simplified V7 implementation - in production, use proper UUID v7 library
  const timestamp = Date.now();
  const timestampHex = timestamp.toString(16).padStart(12, '0');
  const randomHex = crypto.randomUUID().replace(/-/g, '').substring(12);
  return `${timestampHex.substring(0, 8)}-${timestampHex.substring(8, 12)}-7${randomHex.substring(0, 3)}-${randomHex.substring(3, 7)}-${randomHex.substring(7, 19)}`;
}

// Business entity ID creators (UUID V4)
export const createContactId = (): ContactId => generateUUIDv4() as ContactId;
export const createTenantId = (): TenantId => generateUUIDv4() as TenantId;
export const createCompanyId = (): CompanyId => generateUUIDv4() as CompanyId;
export const createDealId = (): DealId => generateUUIDv4() as DealId;
export const createProductId = (): ProductId => generateUUIDv4() as ProductId;
export const createOrderId = (): OrderId => generateUUIDv4() as OrderId;
export const createLocationId = (): LocationId => generateUUIDv4() as LocationId;
export const createUserId = (): UserId => generateUUIDv4() as UserId;

// Temporal data ID creators (UUID V7)
export const createMeetingId = (): MeetingId => generateUUIDv7() as MeetingId;
export const createTransactionId = (): TransactionId => generateUUIDv7() as TransactionId;
export const createActivityId = (): ActivityId => generateUUIDv7() as ActivityId;
export const createAuditLogId = (): AuditLogId => generateUUIDv7() as AuditLogId;
export const createFileId = (): FileId => generateUUIDv7() as FileId;

// Value object creators
export const createEmail = (email: string): Email => {
  // Basic validation
  if (!email.includes('@')) {
    throw new Error('Invalid email format');
  }
  return email as Email;
};

export const createPhoneNumber = (phone: string): PhoneNumber => {
  // Basic validation - remove all non-digits and check length
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) {
    throw new Error('Invalid phone number format');
  }
  return phone as PhoneNumber;
};

export const createContactTag = (tag: string): ContactTag => {
  if (tag.length === 0 || tag.length > 50) {
    throw new Error('Contact tag must be between 1 and 50 characters');
  }
  return tag.toLowerCase().trim() as ContactTag;
};

export const createCompanyTag = (tag: string): CompanyTag => {
  if (tag.length === 0 || tag.length > 50) {
    throw new Error('Company tag must be between 1 and 50 characters');
  }
  return tag.toLowerCase().trim() as CompanyTag;
};

// Type casting helpers for mock data (use sparingly)
export const mockContactId = (id: string): ContactId => id as ContactId;
export const mockTenantId = (id: string): TenantId => id as TenantId;
export const mockCompanyId = (id: string): CompanyId => id as CompanyId;
export const mockEmail = (email: string): Email => email as Email;
export const mockPhoneNumber = (phone: string): PhoneNumber => phone as PhoneNumber;
export const mockContactTag = (tag: string): ContactTag => tag as ContactTag;
export const mockCompanyTag = (tag: string): CompanyTag => tag as CompanyTag;

// Array helpers
export const mockContactTags = (tags: string[]): ContactTag[] => 
  tags.map(tag => mockContactTag(tag));

export const mockCompanyTags = (tags: string[]): CompanyTag[] => 
  tags.map(tag => mockCompanyTag(tag));

// Validation helpers
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
