/**
 * TanStack Table Integration Example for Equiflow CRM
 * Shows integration with tRPC, Router, and Forms
 */

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { trpc } from './trpc';
import { useSearch, useNavigate } from '@tanstack/react-router';

// Contact table columns with actions
const columnHelper = createColumnHelper<Contact>();

export const contactColumns = [
  // Selection column
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  }),

  // Data columns
  columnHelper.accessor('firstName', {
    header: 'First Name',
    cell: (info) => info.getValue(),
    filterFn: 'includesString',
  }),

  columnHelper.accessor('lastName', {
    header: 'Last Name',
    cell: (info) => info.getValue(),
    filterFn: 'includesString',
  }),

  columnHelper.accessor('email', {
    header: 'Email',
    cell: (info) => (
      <a href={`mailto:${info.getValue()}`}>
        {info.getValue()}
      </a>
    ),
  }),

  // Computed column
  columnHelper.display({
    id: 'fullName',
    header: 'Full Name',
    cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
  }),

  // Status with conditional styling
  columnHelper.accessor('deletedAt', {
    header: 'Status',
    cell: (info) => (
      <span style={{
        color: info.getValue() ? 'red' : 'green',
        fontWeight: 'bold'
      }}>
        {info.getValue() ? 'Archived' : 'Active'}
      </span>
    ),
    filterFn: (row, columnId, filterValue) => {
      const isArchived = !!row.getValue(columnId);
      return filterValue === 'all' || 
             (filterValue === 'active' && !isArchived) ||
             (filterValue === 'archived' && isArchived);
    },
  }),

  // Actions column
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <ContactActions contact={row.original} />
    ),
  }),
];

// Contact table with URL state integration
export function ContactsTable() {
  const search = useSearch({ from: '/dashboard/contacts' });
  const navigate = useNavigate({ from: '/dashboard/contacts' });

  // Fetch data with tRPC
  const { data, isLoading } = trpc.contacts.list.useQuery({
    page: search.page,
    limit: search.limit,
    search: search.search,
    status: search.status,
    sortBy: search.sortBy,
    sortOrder: search.sortOrder,
  });

  const table = useReactTable({
    data: data?.contacts || [],
    columns: contactColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    
    // Manual pagination (server-side)
    manualPagination: true,
    pageCount: data ? Math.ceil(data.total / search.limit) : 0,
    
    // Manual sorting (server-side)
    manualSorting: true,
    
    // State managed by URL
    state: {
      pagination: {
        pageIndex: search.page - 1,
        pageSize: search.limit,
      },
      sorting: search.sortBy ? [{
        id: search.sortBy,
        desc: search.sortOrder === 'desc',
      }] : [],
      globalFilter: search.search,
    },

    // Update URL when table state changes
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' 
        ? updater({ pageIndex: search.page - 1, pageSize: search.limit })
        : updater;
      
      navigate({
        search: {
          ...search,
          page: newPagination.pageIndex + 1,
          limit: newPagination.pageSize,
        },
        replace: true,
      });
    },

    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function'
        ? updater(search.sortBy ? [{ id: search.sortBy, desc: search.sortOrder === 'desc' }] : [])
        : updater;
      
      const sort = newSorting[0];
      navigate({
        search: {
          ...search,
          sortBy: sort?.id || undefined,
          sortOrder: sort?.desc ? 'desc' : 'asc',
          page: 1, // Reset to first page
        },
        replace: true,
      });
    },

    onGlobalFilterChange: (filter) => {
      navigate({
        search: {
          ...search,
          search: filter || undefined,
          page: 1, // Reset to first page
        },
        replace: true,
      });
    },
  });

  if (isLoading) {
    return <div>Loading contacts...</div>;
  }

  return (
    <div>
      {/* Table Controls */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
        {/* Global Search */}
        <input
          value={search.search || ''}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          placeholder="Search contacts..."
        />

        {/* Status Filter */}
        <select
          value={search.status}
          onChange={(e) => navigate({
            search: { ...search, status: e.target.value as any, page: 1 },
            replace: true,
          })}
        >
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="all">All</option>
        </select>

        {/* Bulk Actions */}
        {table.getSelectedRowModel().rows.length > 0 && (
          <BulkActions
            selectedContacts={table.getSelectedRowModel().rows.map(row => row.original)}
            onAction={() => table.resetRowSelection()}
          />
        )}
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '2px solid #e2e8f0',
                    cursor: header.column.getCanSort() ? 'pointer' : 'default',
                  }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {/* Sort indicator */}
                  {{
                    asc: ' ↑',
                    desc: ' ↓',
                  }[header.column.getIsSorted() as string] ?? null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr
              key={row.id}
              style={{
                borderBottom: '1px solid #e2e8f0',
                cursor: 'pointer',
              }}
              onClick={() => navigate({
                to: '/dashboard/contacts/$contactId',
                params: { contactId: row.original.id },
              })}
            >
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  style={{ padding: '12px' }}
                  onClick={(e) => {
                    // Don't navigate when clicking on actions or checkboxes
                    if (cell.column.id === 'actions' || cell.column.id === 'select') {
                      e.stopPropagation();
                    }
                  }}
                >
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ 
        marginTop: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          Showing {((search.page - 1) * search.limit) + 1} to{' '}
          {Math.min(search.page * search.limit, data?.total || 0)} of{' '}
          {data?.total || 0} contacts
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </button>
          <span>
            Page {search.page} of {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Contact actions component
function ContactActions({ contact }: { contact: Contact }) {
  const navigate = useNavigate();
  const archiveMutation = trpc.contacts.archive.useMutation();
  const restoreMutation = trpc.contacts.restore.useMutation();
  const utils = trpc.useUtils();

  const handleArchive = async () => {
    await archiveMutation.mutateAsync({ id: contact.id });
    utils.contacts.list.invalidate();
  };

  const handleRestore = async () => {
    await restoreMutation.mutateAsync({ id: contact.id });
    utils.contacts.list.invalidate();
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={() => navigate({
          to: '/dashboard/contacts/$contactId/edit',
          params: { contactId: contact.id },
        })}
      >
        Edit
      </button>
      
      {contact.deletedAt ? (
        <button
          onClick={handleRestore}
          disabled={restoreMutation.isPending}
        >
          Restore
        </button>
      ) : (
        <button
          onClick={handleArchive}
          disabled={archiveMutation.isPending}
        >
          Archive
        </button>
      )}
    </div>
  );
}

// Bulk actions component
function BulkActions({ 
  selectedContacts, 
  onAction 
}: { 
  selectedContacts: Contact[];
  onAction: () => void;
}) {
  const bulkArchiveMutation = trpc.contacts.bulkArchive.useMutation();
  const utils = trpc.useUtils();

  const handleBulkArchive = async () => {
    const ids = selectedContacts.map(contact => contact.id);
    await bulkArchiveMutation.mutateAsync({ ids });
    utils.contacts.list.invalidate();
    onAction();
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <span>{selectedContacts.length} selected</span>
      <button
        onClick={handleBulkArchive}
        disabled={bulkArchiveMutation.isPending}
      >
        Archive Selected
      </button>
    </div>
  );
}

/**
 * TanStack Table Benefits for Your CRM:
 * 
 * 1. Router Integration:
 *    - URL state for pagination, sorting, filtering
 *    - Deep linking to any table state
 *    - Browser navigation works perfectly
 * 
 * 2. Performance:
 *    - Virtual scrolling for large datasets
 *    - Efficient re-renders
 *    - Server-side pagination/sorting
 * 
 * 3. Features:
 *    - Column sorting, filtering, resizing
 *    - Row selection and bulk actions
 *    - Expandable rows for details
 *    - Customizable everything
 * 
 * 4. TypeScript:
 *    - Fully typed columns and data
 *    - Type-safe cell renderers
 *    - Autocomplete for all APIs
 * 
 * 5. tRPC Integration:
 *    - Works seamlessly with your queries
 *    - Optimistic updates
 *    - Error handling
 */
