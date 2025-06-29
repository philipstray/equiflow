/**
 * Contact Form Component
 * Uses TanStack Form with Zod validation
 */

import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { CreateContactSchema, CreateContactInput } from '../../../lib/schemas';

interface ContactFormProps {
  initialData?: Partial<CreateContactInput>;
  onSubmit: (data: CreateContactInput) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
}

export function ContactForm({ 
  initialData, 
  onSubmit, 
  submitLabel = 'Save Contact',
  isLoading = false 
}: ContactFormProps) {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      firstName: initialData?.firstName ?? '',
      lastName: initialData?.lastName ?? '',
      email: initialData?.email ?? '',
      phone: initialData?.phone ?? '',
      title: initialData?.title ?? '',
      companyId: initialData?.companyId ?? '',
      tags: initialData?.tags ?? [],
      notes: initialData?.notes ?? '',
    },
    onSubmit: async ({ value }) => {
      try {
        // Validate with Zod
        const validatedData = CreateContactSchema.parse(value);
        await onSubmit(validatedData);
      } catch (error) {
        console.error('Form submission error:', error);
        // Handle validation errors
      }
    },
  });

  const availableTags = ['decision-maker', 'technical', 'startup', 'operations', 'marketing', 'finance'];

  return (
    <div className="max-w-2xl mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        {/* Name fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form.Field
            name="firstName"
            validators={{
              onChange: ({ value }) => {
                if (!value || value.length < 1) return 'First name is required';
                if (value.length > 50) return 'First name must be 50 characters or less';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <label 
                  htmlFor={field.name} 
                  className="block text-sm font-medium text-oklch(0.3 0.12 240) mb-2"
                >
                  First Name *
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={`
                    w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-oklch(0.5 0.15 240) focus:border-transparent
                    ${field.state.meta.errors.length > 0 
                      ? 'border-red-500' 
                      : 'border-oklch(0.9 0.02 240)'
                    }
                  `}
                  placeholder="Enter first name"
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error} className="mt-1 text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field
            name="lastName"
            validators={{
              onChange: ({ value }) => {
                if (!value || value.length < 1) return 'Last name is required';
                if (value.length > 50) return 'Last name must be 50 characters or less';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <label 
                  htmlFor={field.name} 
                  className="block text-sm font-medium text-oklch(0.3 0.12 240) mb-2"
                >
                  Last Name *
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={`
                    w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-oklch(0.5 0.15 240) focus:border-transparent
                    ${field.state.meta.errors.length > 0 
                      ? 'border-red-500' 
                      : 'border-oklch(0.9 0.02 240)'
                    }
                  `}
                  placeholder="Enter last name"
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error} className="mt-1 text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        {/* Email field */}
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => {
              if (!value || value.length < 1) return 'Email is required';
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(value)) return 'Please enter a valid email address';
              return undefined;
            },
          }}
        >
          {(field) => (
            <div>
              <label 
                htmlFor={field.name} 
                className="block text-sm font-medium text-oklch(0.3 0.12 240) mb-2"
              >
                Email Address *
              </label>
              <input
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={`
                  w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-oklch(0.5 0.15 240) focus:border-transparent
                  ${field.state.meta.errors.length > 0 
                    ? 'border-red-500' 
                    : 'border-oklch(0.9 0.02 240)'
                  }
                `}
                placeholder="Enter email address"
              />
              {field.state.meta.errors.map((error) => (
                <p key={error} className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        {/* Phone and Title fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form.Field
            name="phone"
            validators={{
              onChange: ({ value }) => {
                if (value && value.length > 0) {
                  const phoneRegex = /^\+?[\d\s\-()]+$/;
                  if (!phoneRegex.test(value)) return 'Please enter a valid phone number';
                  if (value.replace(/\D/g, '').length < 10) return 'Phone number must be at least 10 digits';
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <label 
                  htmlFor={field.name} 
                  className="block text-sm font-medium text-oklch(0.3 0.12 240) mb-2"
                >
                  Phone Number
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="tel"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={`
                    w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-oklch(0.5 0.15 240) focus:border-transparent
                    ${field.state.meta.errors.length > 0 
                      ? 'border-red-500' 
                      : 'border-oklch(0.9 0.02 240)'
                    }
                  `}
                  placeholder="Enter phone number"
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error} className="mt-1 text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="title">
            {(field) => (
              <div>
                <label 
                  htmlFor={field.name} 
                  className="block text-sm font-medium text-oklch(0.3 0.12 240) mb-2"
                >
                  Job Title
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-oklch(0.9 0.02 240) rounded-md focus:outline-none focus:ring-2 focus:ring-oklch(0.5 0.15 240) focus:border-transparent"
                  placeholder="Enter job title"
                />
              </div>
            )}
          </form.Field>
        </div>

        {/* Tags field */}
        <form.Field name="tags">
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-oklch(0.3 0.12 240) mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <label
                    key={tag}
                    className={`
                      inline-flex items-center px-3 py-2 rounded-full text-sm cursor-pointer transition-colors
                      ${field.state.value.includes(tag)
                        ? 'bg-oklch(0.5 0.15 240) text-white'
                        : 'bg-oklch(0.95 0.01 240) text-oklch(0.4 0.1 240) hover:bg-oklch(0.9 0.02 240)'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={field.state.value.includes(tag)}
                      onChange={(e) => {
                        const currentTags = field.state.value;
                        if (e.target.checked) {
                          field.handleChange([...currentTags, tag]);
                        } else {
                          field.handleChange(currentTags.filter(t => t !== tag));
                        }
                      }}
                    />
                    {tag}
                  </label>
                ))}
              </div>
            </div>
          )}
        </form.Field>

        {/* Notes field */}
        <form.Field name="notes">
          {(field) => (
            <div>
              <label 
                htmlFor={field.name} 
                className="block text-sm font-medium text-oklch(0.3 0.12 240) mb-2"
              >
                Notes
              </label>
              <textarea
                id={field.name}
                name={field.name}
                rows={4}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-3 py-2 border border-oklch(0.9 0.02 240) rounded-md focus:outline-none focus:ring-2 focus:ring-oklch(0.5 0.15 240) focus:border-transparent"
                placeholder="Add any additional notes about this contact..."
              />
            </div>
          )}
        </form.Field>

        {/* Form actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-oklch(0.9 0.02 240)">
          <button
            type="button"
            onClick={() => navigate({ to: '/contacts' })}
            className="px-4 py-2 text-sm font-medium text-oklch(0.4 0.1 240) bg-white border border-oklch(0.9 0.02 240) rounded-md hover:bg-oklch(0.98 0.005 240) transition-colors"
          >
            Cancel
          </button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting || isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-oklch(0.5 0.15 240) border border-transparent rounded-md hover:bg-oklch(0.45 0.15 240) focus:outline-none focus:ring-2 focus:ring-oklch(0.5 0.15 240) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting || isLoading ? 'Saving...' : submitLabel}
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
}

export default ContactForm;
