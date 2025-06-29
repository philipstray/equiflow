/**
 * Contacts List Page
 * Displays contacts with filtering, sorting, and pagination
 */

import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Contact } from '../../lib/types';
import { 
  mockContactId, 
  mockTenantId, 
  mockEmail, 
  mockPhoneNumber, 
  mockCompanyId, 
  mockContactTags,
  mockContactTag
} from '../../lib/utils';

// Mock contact data
const mockContacts: Contact[] = [
  {
    id: mockContactId('1'),
    tenantId: mockTenantId('tenant-1'),
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: mockEmail('sarah.johnson@techcorp.com'),
    phone: mockPhoneNumber('+1-555-0123'),
    title: 'VP of Engineering',
    companyId: mockCompanyId('company-1'),
    tags: mockContactTags(['decision-maker', 'technical']),
    notes: 'Interested in enterprise solutions',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: mockContactId('2'),
    tenantId: mockTenantId('tenant-1'),
    firstName: 'Michael',
    lastName: 'Chen',
    email: mockEmail('michael.chen@startup.io'),
    phone: mockPhoneNumber('+1-555-0124'),
    title: 'CTO',
    companyId: mockCompanyId('company-2'),
    tags: mockContactTags(['technical', 'startup']),
    notes: 'Looking for scalable solutions',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: mockContactId('3'),
    tenantId: mockTenantId('tenant-1'),
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: mockEmail('emily.rodriguez@bigcorp.com'),
    phone: mockPhoneNumber('+1-555-0125'),
    title: 'Director of Operations',
    companyId: mockCompanyId('company-3'),
    tags: mockContactTags(['decision-maker', 'operations']),
    notes: 'Focused on efficiency improvements',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-22'),
  },
];

// Search and filter component
interface ContactFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

function ContactFilters({
  searchTerm,
  onSearchChange,
  selectedTags,
  onTagToggle,
  sortBy,
  onSortChange,
}: ContactFiltersProps) {
  const availableTags = ['decision-maker', 'technical', 'startup', 'operations', 'marketing'];

  return (
    <div className="bg-white border border-oklch(0.9 0.02 240) rounded-lg p-4 space-y-4">
      {/* Search */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-oklch(0.3 0.12 240) mb-2">
          Search Contacts
        </label>
        <input
          type="text"
          id="search"
          placeholder="Search by name, email, or company..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 border border-oklch(0.9 0.02 240) rounded-md focus:outline-none focus:ring-2 focus:ring-oklch(0.5 0.15 240) focus:border-transparent"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Tags filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-oklch(0.3 0.12 240) mb-2">
            Filter by Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={`
                  px-3 py-1 text-sm rounded-full border transition-colors
                  ${selectedTags.includes(tag)
                    ? 'bg-oklch(0.5 0.15 240) text-white border-oklch(0.5 0.15 240)'
                    : 'bg-white text-oklch(0.4 0.1 240) border-oklch(0.9 0.02 240) hover:bg-oklch(0.98 0.005 240)'
                  }
                `}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Sort by */}
        <div className="sm:w-48">
          <label htmlFor="sort" className="block text-sm font-medium text-oklch(0.3 0.12 240) mb-2">
            Sort by
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-oklch(0.9 0.02 240) rounded-md focus:outline-none focus:ring-2 focus:ring-oklch(0.5 0.15 240) focus:border-transparent bg-white"
          >
            <option value="lastName">Last Name</option>
            <option value="firstName">First Name</option>
            <option value="email">Email</option>
            <option value="createdAt">Date Added</option>
            <option value="updatedAt">Last Updated</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Contact card component
interface ContactCardProps {
  contact: Contact;
}

function ContactCard({ contact }: ContactCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="bg-white border border-oklch(0.9 0.02 240) rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="w-12 h-12 bg-oklch(0.5 0.15 240) rounded-full flex items-center justify-center text-white font-medium">
            {getInitials(contact.firstName, contact.lastName)}
          </div>
          
          {/* Contact info */}
          <div className="flex-1">
            <h3 className="text-lg font-medium text-oklch(0.15 0.1 240)">
              <Link
                to={`/contacts/${contact.id}`}
                className="hover:text-oklch(0.4 0.15 240) transition-colors"
              >
                {contact.firstName} {contact.lastName}
              </Link>
            </h3>
            {contact.title && (
              <p className="text-sm text-oklch(0.5 0.08 240)">{contact.title}</p>
            )}
            <div className="mt-2 space-y-1">
              <p className="text-sm text-oklch(0.4 0.1 240)">{contact.email}</p>
              {contact.phone && (
                <p className="text-sm text-oklch(0.4 0.1 240)">{contact.phone}</p>
              )}
            </div>
            
            {/* Tags */}
            {contact.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {contact.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-oklch(0.95 0.01 240) text-oklch(0.4 0.1 240) rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Link
            to={`/contacts/${contact.id}/edit`}
            className="text-oklch(0.5 0.15 240) hover:text-oklch(0.4 0.15 240) text-sm font-medium"
          >
            Edit
          </Link>
          <button className="text-oklch(0.6 0.08 240) hover:text-oklch(0.4 0.12 240) text-sm">
            More
          </button>
        </div>
      </div>
      
      {/* Notes preview */}
      {contact.notes && (
        <div className="mt-4 pt-4 border-t border-oklch(0.95 0.01 240)">
          <p className="text-sm text-oklch(0.5 0.08 240) line-clamp-2">
            {contact.notes}
          </p>
        </div>
      )}
    </div>
  );
}

// Main contacts page component
export function ContactsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('lastName');

  // Filter and sort contacts
  const filteredContacts = mockContacts
    .filter((contact) => {
      const matchesSearch = searchTerm === '' || 
        contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.some(tag => contact.tags.includes(mockContactTag(tag)));
      
      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'firstName':
          return a.firstName.localeCompare(b.firstName);
        case 'lastName':
          return a.lastName.localeCompare(b.lastName);
        case 'email':
          return a.email.localeCompare(b.email);
        case 'createdAt':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'updatedAt':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        default:
          return 0;
      }
    });

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-oklch(0.15 0.1 240)">Contacts</h1>
          <p className="text-oklch(0.5 0.08 240)">
            {filteredContacts.length} contacts found
          </p>
        </div>
        <Link
          to="/contacts/new"
          className="bg-oklch(0.5 0.15 240) text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-oklch(0.45 0.15 240) transition-colors"
        >
          Add Contact
        </Link>
      </div>

      {/* Filters */}
      <ContactFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Contacts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>

      {/* Empty state */}
      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-oklch(0.3 0.12 240) mb-2">
            No contacts found
          </h3>
          <p className="text-oklch(0.5 0.08 240) mb-6">
            {searchTerm || selectedTags.length > 0
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first contact'
            }
          </p>
          <Link
            to="/contacts/new"
            className="inline-flex items-center px-4 py-2 bg-oklch(0.5 0.15 240) text-white rounded-md hover:bg-oklch(0.45 0.15 240) transition-colors"
          >
            Add Contact
          </Link>
        </div>
      )}
    </div>
  );
}

export default ContactsList;
