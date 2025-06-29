/**
 * Zod Validation Schemas for CRM Entities
 * Following best practices from .data-and-user.instructions.md
 */

import { z } from 'zod';

// Base validation helpers
const uuidSchema = z.string().uuid();
const emailSchema = z.string().email().min(1).max(255);
const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/).min(10).max(20);
const currencySchema = z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']);

// Contact schemas
export const CreateContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: emailSchema,
  phone: phoneSchema.optional(),
  title: z.string().max(100).optional(),
  companyId: uuidSchema.optional(),
  tags: z.array(z.string().max(50)).default([]),
  notes: z.string().max(2000).optional(),
});

export const UpdateContactSchema = CreateContactSchema.partial().extend({
  id: uuidSchema,
});

export const ContactQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(25),
  search: z.string().optional(),
  sortBy: z.enum(['firstName', 'lastName', 'email', 'createdAt', 'updatedAt']).default('lastName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  status: z.enum(['active', 'archived', 'all']).default('active'),
  companyId: uuidSchema.optional(),
  tags: z.array(z.string()).optional(),
});

// Company schemas
export const CreateCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100),
  domain: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/).optional(),
  industry: z.string().max(100).optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  website: z.string().url().optional(),
  description: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).default([]),
  locationId: uuidSchema.optional(),
});

export const UpdateCompanySchema = CreateCompanySchema.partial().extend({
  id: uuidSchema,
});

export const CompanyQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(25),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'industry', 'size', 'createdAt', 'updatedAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  status: z.enum(['active', 'archived', 'all']).default('active'),
  industry: z.string().optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
});

// Location schemas
export const CreateLocationSchema = z.object({
  name: z.string().min(1, 'Location name is required').max(100),
  addressLine1: z.string().min(1, 'Address is required').max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().min(1, 'Country is required').max(100),
  isPrimary: z.boolean().default(false),
});

export const UpdateLocationSchema = CreateLocationSchema.partial().extend({
  id: uuidSchema,
});

// Deal schemas
export const CreateDealSchema = z.object({
  title: z.string().min(1, 'Deal title is required').max(200),
  description: z.string().max(2000).optional(),
  value: z.number().min(0, 'Deal value must be positive'),
  currency: currencySchema,
  stage: z.enum(['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost']).default('lead'),
  probability: z.number().min(0).max(100).default(50),
  expectedCloseDate: z.string().datetime().optional(),
  contactId: uuidSchema.optional(),
  companyId: uuidSchema.optional(),
  assignedTo: uuidSchema.optional(),
});

export const UpdateDealSchema = CreateDealSchema.partial().extend({
  id: uuidSchema,
  actualCloseDate: z.string().datetime().optional(),
});

export const DealQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(25),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'value', 'stage', 'probability', 'expectedCloseDate', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  stage: z.enum(['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost', 'all']).default('all'),
  assignedTo: uuidSchema.optional(),
  companyId: uuidSchema.optional(),
  minValue: z.number().min(0).optional(),
  maxValue: z.number().min(0).optional(),
});

// Product schemas
export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  description: z.string().max(2000).optional(),
  sku: z.string().min(1, 'SKU is required').max(100),
  price: z.number().min(0, 'Price must be positive'),
  currency: currencySchema,
  category: z.string().max(100).optional(),
  isActive: z.boolean().default(true),
});

export const UpdateProductSchema = CreateProductSchema.partial().extend({
  id: uuidSchema,
});

export const ProductQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(25),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'sku', 'price', 'category', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  status: z.enum(['active', 'inactive', 'all']).default('active'),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
});

// Order schemas
export const OrderItemSchema = z.object({
  productId: uuidSchema,
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
});

export const CreateOrderSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required').max(50),
  contactId: uuidSchema.optional(),
  companyId: uuidSchema.optional(),
  status: z.enum(['draft', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).default('draft'),
  totalAmount: z.number().min(0),
  currency: currencySchema,
  orderDate: z.string().datetime(),
  expectedDeliveryDate: z.string().datetime().optional(),
  items: z.array(OrderItemSchema).min(1, 'Order must have at least one item'),
});

export const UpdateOrderSchema = CreateOrderSchema.partial().extend({
  id: uuidSchema,
  actualDeliveryDate: z.string().datetime().optional(),
});

export const OrderQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(25),
  search: z.string().optional(),
  sortBy: z.enum(['orderNumber', 'totalAmount', 'orderDate', 'status', 'createdAt']).default('orderDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['draft', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'all']).default('all'),
  contactId: uuidSchema.optional(),
  companyId: uuidSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Meeting schemas
export const MeetingAttendeeSchema = z.object({
  contactId: uuidSchema.optional(),
  userId: uuidSchema.optional(),
  email: emailSchema,
  name: z.string().min(1).max(100),
  status: z.enum(['invited', 'accepted', 'declined', 'tentative', 'attended', 'no-show']).default('invited'),
});

const BaseMeetingSchema = z.object({
  title: z.string().min(1, 'Meeting title is required').max(200),
  description: z.string().max(2000).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().max(200).optional(),
  meetingType: z.enum(['call', 'video', 'in-person', 'demo', 'follow-up']),
  status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show']).default('scheduled'),
  attendees: z.array(MeetingAttendeeSchema).min(1, 'Meeting must have at least one attendee'),
});

export const CreateMeetingSchema = BaseMeetingSchema.refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export const UpdateMeetingSchema = BaseMeetingSchema.partial().extend({
  id: uuidSchema,
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export const MeetingQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(25),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'startDate', 'endDate', 'status', 'createdAt']).default('startDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show', 'all']).default('all'),
  meetingType: z.enum(['call', 'video', 'in-person', 'demo', 'follow-up']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Transaction schemas
export const CreateTransactionSchema = z.object({
  type: z.enum(['payment', 'refund', 'invoice', 'credit', 'debit']),
  amount: z.number().min(0),
  currency: currencySchema,
  description: z.string().min(1, 'Description is required').max(500),
  contactId: uuidSchema.optional(),
  companyId: uuidSchema.optional(),
  orderId: uuidSchema.optional(),
  dealId: uuidSchema.optional(),
  transactionDate: z.string().datetime(),
  status: z.enum(['pending', 'completed', 'failed', 'cancelled', 'refunded']).default('pending'),
  referenceNumber: z.string().max(100).optional(),
});

export const UpdateTransactionSchema = CreateTransactionSchema.partial().extend({
  id: uuidSchema,
});

export const TransactionQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(25),
  search: z.string().optional(),
  sortBy: z.enum(['amount', 'transactionDate', 'status', 'type', 'createdAt']).default('transactionDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  type: z.enum(['payment', 'refund', 'invoice', 'credit', 'debit', 'all']).default('all'),
  status: z.enum(['pending', 'completed', 'failed', 'cancelled', 'refunded', 'all']).default('all'),
  contactId: uuidSchema.optional(),
  companyId: uuidSchema.optional(),
  orderId: uuidSchema.optional(),
  dealId: uuidSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
});

// Activity schemas
export const CreateActivitySchema = z.object({
  type: z.enum(['email', 'call', 'meeting', 'note', 'task', 'deal-created', 'deal-updated', 'order-placed', 'order-updated', 'payment-received']),
  title: z.string().min(1, 'Activity title is required').max(200),
  description: z.string().max(2000).optional(),
  contactId: uuidSchema.optional(),
  companyId: uuidSchema.optional(),
  dealId: uuidSchema.optional(),
  meetingId: uuidSchema.optional(),
  occurredAt: z.string().datetime(),
});

export const ActivityQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(25),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'type', 'occurredAt', 'createdAt']).default('occurredAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  type: z.enum(['email', 'call', 'meeting', 'note', 'task', 'deal-created', 'deal-updated', 'order-placed', 'order-updated', 'payment-received', 'all']).default('all'),
  contactId: uuidSchema.optional(),
  companyId: uuidSchema.optional(),
  dealId: uuidSchema.optional(),
  createdBy: uuidSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Bulk operation schemas
export const BulkDeleteSchema = z.object({
  ids: z.array(uuidSchema).min(1, 'At least one ID is required'),
});

export const BulkUpdateSchema = z.object({
  ids: z.array(uuidSchema).min(1, 'At least one ID is required'),
  updates: z.record(z.any()),
});

// Export type inference helpers
export type CreateContactInput = z.infer<typeof CreateContactSchema>;
export type UpdateContactInput = z.infer<typeof UpdateContactSchema>;
export type ContactQuery = z.infer<typeof ContactQuerySchema>;

export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>;
export type CompanyQuery = z.infer<typeof CompanyQuerySchema>;

export type CreateDealInput = z.infer<typeof CreateDealSchema>;
export type UpdateDealInput = z.infer<typeof UpdateDealSchema>;
export type DealQuery = z.infer<typeof DealQuerySchema>;

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductQuery = z.infer<typeof ProductQuerySchema>;

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;
export type OrderQuery = z.infer<typeof OrderQuerySchema>;

export type CreateMeetingInput = z.infer<typeof CreateMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof UpdateMeetingSchema>;
export type MeetingQuery = z.infer<typeof MeetingQuerySchema>;

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;
export type TransactionQuery = z.infer<typeof TransactionQuerySchema>;

export type CreateActivityInput = z.infer<typeof CreateActivitySchema>;
export type ActivityQuery = z.infer<typeof ActivityQuerySchema>;
