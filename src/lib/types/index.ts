/**
 * Core CRM Entity Types
 * Branded types for type safety across the application
 */

// Core ID types using UUID strategy
export type TenantId = string & { __brand: 'TenantId'; __type: 'UUIDv4' };
export type UserId = string & { __brand: 'UserId'; __type: 'UUIDv4' };

// Business entity IDs (UUID V4)
export type ContactId = string & { __brand: 'ContactId'; __type: 'UUIDv4' };
export type CompanyId = string & { __brand: 'CompanyId'; __type: 'UUIDv4' };
export type DealId = string & { __brand: 'DealId'; __type: 'UUIDv4' };
export type ProductId = string & { __brand: 'ProductId'; __type: 'UUIDv4' };
export type LocationId = string & { __brand: 'LocationId'; __type: 'UUIDv4' };
export type OrderId = string & { __brand: 'OrderId'; __type: 'UUIDv4' };

// Temporal data IDs (UUID V7)
export type ActivityId = string & { __brand: 'ActivityId'; __type: 'UUIDv7' };
export type MeetingId = string & { __brand: 'MeetingId'; __type: 'UUIDv7' };
export type TransactionId = string & { __brand: 'TransactionId'; __type: 'UUIDv7' };
export type AuditLogId = string & { __brand: 'AuditLogId'; __type: 'UUIDv7' };
export type FileId = string & { __brand: 'FileId'; __type: 'UUIDv7' };

// Value object types
export type Email = string & { __brand: 'Email' };
export type PhoneNumber = string & { __brand: 'PhoneNumber' };
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
export type ContactTag = string & { __brand: 'ContactTag' };
export type CompanyTag = string & { __brand: 'CompanyTag' };

// Core entities
export interface Contact {
  id: ContactId;
  tenantId: TenantId;
  firstName: string;
  lastName: string;
  email: Email;
  phone?: PhoneNumber;
  title?: string;
  companyId?: CompanyId;
  tags: ContactTag[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Company {
  id: CompanyId;
  tenantId: TenantId;
  name: string;
  domain?: string;
  industry?: string;
  size?: CompanySize;
  website?: string;
  description?: string;
  tags: CompanyTag[];
  locationId?: LocationId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Location {
  id: LocationId;
  tenantId: TenantId;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Deal {
  id: DealId;
  tenantId: TenantId;
  title: string;
  description?: string;
  value: number;
  currency: Currency;
  stage: DealStage;
  probability: number; // 0-100
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  contactId?: ContactId;
  companyId?: CompanyId;
  assignedTo?: UserId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Product {
  id: ProductId;
  tenantId: TenantId;
  name: string;
  description?: string;
  sku: string;
  price: number;
  currency: Currency;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Order {
  id: OrderId;
  tenantId: TenantId;
  orderNumber: string;
  contactId?: ContactId;
  companyId?: CompanyId;
  status: OrderStatus;
  totalAmount: number;
  currency: Currency;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface OrderItem {
  productId: ProductId;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Meeting {
  id: MeetingId;
  tenantId: TenantId;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  meetingType: MeetingType;
  status: MeetingStatus;
  attendees: MeetingAttendee[];
  createdBy: UserId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface MeetingAttendee {
  contactId?: ContactId;
  userId?: UserId;
  email: Email;
  name: string;
  status: AttendeeStatus;
}

export interface Transaction {
  id: TransactionId;
  tenantId: TenantId;
  type: TransactionType;
  amount: number;
  currency: Currency;
  description: string;
  contactId?: ContactId;
  companyId?: CompanyId;
  orderId?: OrderId;
  dealId?: DealId;
  transactionDate: Date;
  status: TransactionStatus;
  referenceNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: ActivityId;
  tenantId: TenantId;
  type: ActivityType;
  title: string;
  description?: string;
  contactId?: ContactId;
  companyId?: CompanyId;
  dealId?: DealId;
  meetingId?: MeetingId;
  createdBy: UserId;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Enums and constants
export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';

export type DealStage = 
  | 'lead'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'closed-won'
  | 'closed-lost';

export type OrderStatus = 
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type MeetingType = 
  | 'call'
  | 'video'
  | 'in-person'
  | 'demo'
  | 'follow-up';

export type MeetingStatus = 
  | 'scheduled'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export type AttendeeStatus = 
  | 'invited'
  | 'accepted'
  | 'declined'
  | 'tentative'
  | 'attended'
  | 'no-show';

export type TransactionType = 
  | 'payment'
  | 'refund'
  | 'invoice'
  | 'credit'
  | 'debit';

export type TransactionStatus = 
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type ActivityType = 
  | 'email'
  | 'call'
  | 'meeting'
  | 'note'
  | 'task'
  | 'deal-created'
  | 'deal-updated'
  | 'order-placed'
  | 'order-updated'
  | 'payment-received';

// Error types for each domain
export type ContactError = 
  | { type: 'CONTACT_NOT_FOUND'; contactId: ContactId }
  | { type: 'DUPLICATE_EMAIL'; email: Email }
  | { type: 'INVALID_TENANT'; tenantId: TenantId }
  | { type: 'VALIDATION_ERROR'; field: string; message: string }
  | { type: 'DATABASE_ERROR'; cause: string };

export type CompanyError = 
  | { type: 'COMPANY_NOT_FOUND'; companyId: CompanyId }
  | { type: 'DUPLICATE_DOMAIN'; domain: string }
  | { type: 'INVALID_TENANT'; tenantId: TenantId }
  | { type: 'VALIDATION_ERROR'; field: string; message: string }
  | { type: 'DATABASE_ERROR'; cause: string };

export type DealError = 
  | { type: 'DEAL_NOT_FOUND'; dealId: DealId }
  | { type: 'INVALID_STAGE_TRANSITION'; from: DealStage; to: DealStage }
  | { type: 'INVALID_TENANT'; tenantId: TenantId }
  | { type: 'VALIDATION_ERROR'; field: string; message: string }
  | { type: 'DATABASE_ERROR'; cause: string };

// Common list response type
export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Common query parameters
export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
}
