/**
 * TanStack Form Integration Example for Equiflow CRM
 * Shows integration with tRPC, Zod, and neverthrow
 */

import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';
import { Result } from 'neverthrow';
import { trpc } from './trpc';

// Zod schema for contact form
const ContactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

type ContactFormData = z.infer<typeof ContactFormSchema>;

// TanStack Form with tRPC integration
export function CreateContactForm() {
  const createContactMutation = trpc.contacts.create.useMutation();
  const utils = trpc.useUtils();

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      tags: [] as string[],
      notes: '',
    },
    validatorAdapter: zodValidator,
    validators: {
      onChange: ContactFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const contact = await createContactMutation.mutateAsync(value);
        
        // Optimistic updates
        utils.contacts.list.invalidate();
        
        // Reset form on success
        form.reset();
        
        return contact;
      } catch (error) {
        // TanStack Form handles errors gracefully
        throw error;
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      {/* First Name Field */}
      <form.Field
        name="firstName"
        validators={{
          onChange: z.string().min(1, 'First name is required'),
        }}
        children={(field) => (
          <div>
            <label htmlFor={field.name}>First Name</label>
            <input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors && (
              <p style={{ color: 'red' }}>{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      />

      {/* Email Field with Async Validation */}
      <form.Field
        name="email"
        validators={{
          onChange: z.string().email(),
          onChangeAsync: async ({ value }) => {
            // Check if email already exists
            if (!value) return;
            
            const exists = await utils.contacts.checkEmail.fetch({ email: value });
            if (exists.isDuplicate) {
              return 'Email already exists';
            }
          },
          onChangeAsyncDebounceMs: 500,
        }}
        children={(field) => (
          <div>
            <label htmlFor={field.name}>Email</label>
            <input
              id={field.name}
              type="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.isValidating && (
              <span>Checking email...</span>
            )}
            {field.state.meta.errors && (
              <p style={{ color: 'red' }}>{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      />

      {/* Tags Array Field */}
      <form.Field
        name="tags"
        mode="array"
        children={(field) => (
          <div>
            <label>Tags</label>
            {field.state.value.map((tag, index) => (
              <form.Field
                key={index}
                name={`tags[${index}]`}
                children={(subField) => (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      value={subField.state.value}
                      onChange={(e) => subField.handleChange(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => field.removeValue(index)}
                    >
                      Remove
                    </button>
                  </div>
                )}
              />
            ))}
            <button
              type="button"
              onClick={() => field.pushValue('')}
            >
              Add Tag
            </button>
          </div>
        )}
      />

      {/* Submit with Loading State */}
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Contact'}
          </button>
        )}
      />

      {/* Form-level Error Display */}
      <form.Subscribe
        selector={(state) => state.errors}
        children={(errors) => (
          errors.length > 0 && (
            <div style={{ color: 'red' }}>
              <h4>Form Errors:</h4>
              <ul>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )
        )}
      />
    </form>
  );
}

// Advanced: Form with Router integration
export function EditContactForm() {
  const { contactId } = useParams({ from: '/dashboard/contacts/$contactId/edit' });
  const { data: contact } = trpc.contacts.get.useQuery({ id: contactId });
  const updateMutation = trpc.contacts.update.useMutation();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: contact || {
      firstName: '',
      lastName: '',
      email: '',
      // ... other fields
    },
    validatorAdapter: zodValidator,
    validators: {
      onChange: ContactFormSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await updateMutation.mutateAsync({
        id: contactId,
        ...value,
      });
      
      // Navigate back to contact detail
      navigate({ to: '/dashboard/contacts/$contactId', params: { contactId } });
      
      return result;
    },
  });

  // Update form when data loads
  useEffect(() => {
    if (contact) {
      form.setFieldValue('firstName', contact.firstName);
      form.setFieldValue('lastName', contact.lastName);
      form.setFieldValue('email', contact.email);
      // ... other fields
    }
  }, [contact]);

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit();
    }}>
      {/* Form fields... */}
    </form>
  );
}

// Form with neverthrow integration
export function ContactFormWithNeverthrow() {
  const createContactResult = useCreateContactResult(); // Your neverthrow hook

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
    validatorAdapter: zodValidator,
    validators: {
      onChange: ContactFormSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await createContactResult.createWithResult(value);
      
      if (result.isErr()) {
        // Handle specific error types
        switch (result.error.type) {
          case 'DUPLICATE_EMAIL':
            form.setFieldMeta('email', meta => ({
              ...meta,
              errors: ['Email already exists'],
            }));
            break;
          case 'VALIDATION_ERROR':
            throw new Error(result.error.message);
          default:
            throw new Error('Failed to create contact');
        }
        return;
      }
      
      // Success!
      form.reset();
      return result.value;
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit();
    }}>
      {/* Form implementation */}
    </form>
  );
}

/**
 * TanStack Form Benefits for Your Stack:
 * 
 * 1. Ecosystem Consistency:
 *    - Same patterns as TanStack Router and Table
 *    - Unified mental model across all TanStack tools
 *    - Better TypeScript integration
 * 
 * 2. Better Performance:
 *    - Field-level subscriptions (less re-renders)
 *    - Async validation with proper UX
 *    - Built-in optimizations
 * 
 * 3. Zod Integration:
 *    - Native Zod support with zodValidator
 *    - Type-safe form schemas
 *    - Runtime and compile-time validation
 * 
 * 4. tRPC Integration:
 *    - Works seamlessly with your mutations
 *    - Easy async validation
 *    - Proper error handling
 * 
 * 5. neverthrow Compatibility:
 *    - Easy integration with Result types
 *    - Explicit error handling patterns
 *    - Type-safe error states
 */
