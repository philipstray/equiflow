/**
 * Example CRM Contact Management Implementation
 * Demonstrates best practices from all guidelines
 */

import { z } from 'zod';
import { Result, ResultAsync, ok, err } from 'neverthrow';
import { initTRPC } from '@trpc/server';

// Domain Types (following naming conventions)
export interface Contact {
  id: ContactId;
  tenantId: TenantId;
  firstName: string;
  lastName: string;
  email: Email;
  phone?: PhoneNumber;
  companyId?: CompanyId;
  tags: ContactTag[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date; // Soft delete
}

// Branded types for type safety
type ContactId = string & { __brand: 'ContactId' };
type TenantId = string & { __brand: 'TenantId' };
type Email = string & { __brand: 'Email' };
type PhoneNumber = string & { __brand: 'PhoneNumber' };
type CompanyId = string & { __brand: 'CompanyId' };
type ContactTag = string & { __brand: 'ContactTag' };

// Error types for explicit error handling
type ContactError = 
  | { type: 'CONTACT_NOT_FOUND'; contactId: ContactId }
  | { type: 'DUPLICATE_EMAIL'; email: Email }
  | { type: 'INVALID_TENANT'; tenantId: TenantId }
  | { type: 'VALIDATION_ERROR'; field: string; message: string }
  | { type: 'DATABASE_ERROR'; cause: string };

// Validation schemas
const CreateContactSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().optional(),
  companyId: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

const UpdateContactSchema = CreateContactSchema.partial().extend({
  id: z.string(),
});

// Database layer (using Drizzle patterns)
class ContactRepository {
  constructor(private db: any, private tenantId: TenantId) {}

  async findById(id: ContactId): Promise<Result<Contact, ContactError>> {
    return ResultAsync.fromPromise(
      this.db.select()
        .from(contacts)
        .where(
          and(
            eq(contacts.id, id),
            eq(contacts.tenantId, this.tenantId),
            isNull(contacts.deletedAt) // Filter soft-deleted
          )
        )
        .limit(1),
      (error) => ({ type: 'DATABASE_ERROR' as const, cause: String(error) })
    ).andThen((results) => 
      results.length > 0 
        ? ok(results[0])
        : err({ type: 'CONTACT_NOT_FOUND' as const, contactId: id })
    );
  }

  async findByEmail(email: Email): Promise<Result<Contact | null, ContactError>> {
    return ResultAsync.fromPromise(
      this.db.select()
        .from(contacts)
        .where(
          and(
            eq(contacts.email, email),
            eq(contacts.tenantId, this.tenantId),
            isNull(contacts.deletedAt)
          )
        )
        .limit(1),
      (error) => ({ type: 'DATABASE_ERROR' as const, cause: String(error) })
    ).map((results) => results.length > 0 ? results[0] : null);
  }

  async create(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<Contact, ContactError>> {
    const id = crypto.randomUUID() as ContactId;
    const now = new Date();
    
    const contact: Contact = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    return ResultAsync.fromPromise(
      this.db.insert(contacts).values(contact).returning(),
      (error) => ({ type: 'DATABASE_ERROR' as const, cause: String(error) })
    ).map((results) => results[0]);
  }

  async update(id: ContactId, data: Partial<Contact>): Promise<Result<Contact, ContactError>> {
    return ResultAsync.fromPromise(
      this.db.update(contacts)
        .set({ ...data, updatedAt: new Date() })
        .where(
          and(
            eq(contacts.id, id),
            eq(contacts.tenantId, this.tenantId),
            isNull(contacts.deletedAt)
          )
        )
        .returning(),
      (error) => ({ type: 'DATABASE_ERROR' as const, cause: String(error) })
    ).andThen((results) => 
      results.length > 0 
        ? ok(results[0])
        : err({ type: 'CONTACT_NOT_FOUND' as const, contactId: id })
    );
  }

  async softDelete(id: ContactId): Promise<Result<void, ContactError>> {
    return ResultAsync.fromPromise(
      this.db.update(contacts)
        .set({ deletedAt: new Date() })
        .where(
          and(
            eq(contacts.id, id),
            eq(contacts.tenantId, this.tenantId)
          )
        ),
      (error) => ({ type: 'DATABASE_ERROR' as const, cause: String(error) })
    ).map(() => undefined);
  }
}

// Service layer (business logic)
class ContactService {
  constructor(private repository: ContactRepository) {}

  async createContact(input: z.infer<typeof CreateContactSchema>): Promise<Result<Contact, ContactError>> {
    // Validate input
    const validationResult = CreateContactSchema.safeParse(input);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return err({
        type: 'VALIDATION_ERROR',
        field: firstError.path.join('.'),
        message: firstError.message,
      });
    }

    const validData = validationResult.data;

    // Check for duplicate email
    const existingContactResult = await this.repository.findByEmail(validData.email as Email);
    if (existingContactResult.isErr()) {
      return err(existingContactResult.error);
    }

    if (existingContactResult.value !== null) {
      return err({
        type: 'DUPLICATE_EMAIL',
        email: validData.email as Email,
      });
    }

    // Create contact
    return this.repository.create({
      tenantId: this.repository['tenantId'], // Access private field
      firstName: validData.firstName,
      lastName: validData.lastName,
      email: validData.email as Email,
      phone: validData.phone as PhoneNumber | undefined,
      companyId: validData.companyId as CompanyId | undefined,
      tags: validData.tags as ContactTag[],
    });
  }

  async updateContact(input: z.infer<typeof UpdateContactSchema>): Promise<Result<Contact, ContactError>> {
    const validationResult = UpdateContactSchema.safeParse(input);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return err({
        type: 'VALIDATION_ERROR',
        field: firstError.path.join('.'),
        message: firstError.message,
      });
    }

    const { id, ...updateData } = validationResult.data;

    // Check if email is being changed and not duplicate
    if (updateData.email) {
      const existingContactResult = await this.repository.findByEmail(updateData.email as Email);
      if (existingContactResult.isErr()) {
        return err(existingContactResult.error);
      }

      if (existingContactResult.value && existingContactResult.value.id !== id) {
        return err({
          type: 'DUPLICATE_EMAIL',
          email: updateData.email as Email,
        });
      }
    }

    return this.repository.update(id as ContactId, updateData);
  }

  async deleteContact(id: ContactId): Promise<Result<void, ContactError>> {
    // Verify contact exists first
    const contactResult = await this.repository.findById(id);
    if (contactResult.isErr()) {
      return err(contactResult.error);
    }

    return this.repository.softDelete(id);
  }
}

// tRPC router
export const contactRouter = t.router({
  create: t.procedure
    .input(CreateContactSchema)
    .mutation(async ({ input, ctx }) => {
      const service = new ContactService(new ContactRepository(ctx.db, ctx.tenantId));
      const result = await service.createContact(input);
      
      return result.match(
        (contact) => contact,
        (error) => {
          switch (error.type) {
            case 'VALIDATION_ERROR':
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `${error.field}: ${error.message}`,
              });
            case 'DUPLICATE_EMAIL':
              throw new TRPCError({
                code: 'CONFLICT',
                message: `Email ${error.email} is already in use`,
              });
            default:
              throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create contact',
              });
          }
        }
      );
    }),

  update: t.procedure
    .input(UpdateContactSchema)
    .mutation(async ({ input, ctx }) => {
      const service = new ContactService(new ContactRepository(ctx.db, ctx.tenantId));
      const result = await service.updateContact(input);
      
      return result.match(
        (contact) => contact,
        (error) => {
          switch (error.type) {
            case 'CONTACT_NOT_FOUND':
              throw new TRPCError({
                code: 'NOT_FOUND',
                message: `Contact ${error.contactId} not found`,
              });
            case 'VALIDATION_ERROR':
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `${error.field}: ${error.message}`,
              });
            default:
              throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to update contact',
              });
          }
        }
      );
    }),

  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const service = new ContactService(new ContactRepository(ctx.db, ctx.tenantId));
      const result = await service.deleteContact(input.id as ContactId);
      
      return result.match(
        () => ({ success: true }),
        (error) => {
          throw new TRPCError({
            code: error.type === 'CONTACT_NOT_FOUND' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete contact',
          });
        }
      );
    }),
});

// React hooks following guidelines
export const useCreateContact = () => {
  const utils = trpc.useUtils();
  
  return trpc.contact.create.useMutation({
    onSuccess: (newContact) => {
      // Optimistic updates
      utils.contact.list.setData(undefined, (old) => {
        if (!old) return { contacts: [newContact], total: 1 };
        return {
          contacts: [newContact, ...old.contacts],
          total: old.total + 1,
        };
      });
      
      // Invalidate related queries
      utils.contact.list.invalidate();
    },
    onError: (error) => {
      console.error('Failed to create contact:', {
        code: error.data?.code,
        message: error.message,
      });
    },
  });
};

// Result-based hook for explicit error handling
export const useCreateContactResult = () => {
  const mutation = useCreateContact();
  
  const createWithResult = async (
    input: z.infer<typeof CreateContactSchema>
  ): Promise<Result<Contact, ContactError>> => {
    try {
      const contact = await mutation.mutateAsync(input);
      return ok(contact);
    } catch (error: any) {
      if (error.data?.code === 'CONFLICT') {
        return err({
          type: 'DUPLICATE_EMAIL',
          email: input.email as Email,
        });
      }
      
      if (error.data?.code === 'BAD_REQUEST') {
        return err({
          type: 'VALIDATION_ERROR',
          field: 'unknown',
          message: error.message,
        });
      }
      
      return err({
        type: 'DATABASE_ERROR',
        cause: error.message,
      });
    }
  };
  
  return {
    createWithResult,
    isPending: mutation.isPending,
    reset: mutation.reset,
  };
};

// Component example (would be in a .tsx file)
export const createContactFormExample = () => {
  // This is a TypeScript example of the component logic
  // In a real .tsx file, you would use React and JSX
  
  const handleSubmit = async (formData: FormData) => {
    const input = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()) || [],
    };
    
    // Using the result-based hook for explicit error handling
    const createContactResult = useCreateContactResult();
    const result = await createContactResult.createWithResult(input);
    
    result.match(
      (contact) => {
        console.log(`Contact ${contact.firstName} ${contact.lastName} created successfully`);
        // Update UI state, show success message
      },
      (error) => {
        const errorMessage = 
          error.type === 'DUPLICATE_EMAIL' 
            ? `Email ${error.email} is already in use`
            : error.type === 'VALIDATION_ERROR'
            ? `${error.field}: ${error.message}`
            : 'Failed to create contact';
        
        console.error(errorMessage);
        // Update UI state, show error message
      }
    );
  };
  
  return {
    handleSubmit,
    // Other component logic would go here
  };
};
