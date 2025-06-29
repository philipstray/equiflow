/**
 * Dashboard Overview Page
 * Shows key metrics and recent activity
 */

// import { use } from 'react';
// import { trpc } from '../trpc';

// Mock dashboard data structure
interface DashboardStats {
  totalContacts: number;
  totalCompanies: number;
  activeDeals: number;
  totalRevenue: number;
  currency: string;
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: string;
  }>;
  upcomingMeetings: Array<{
    id: string;
    title: string;
    startDate: string;
    attendeeCount: number;
  }>;
}

// Stats card component
interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
}

function StatsCard({ title, value, subtitle, trend }: StatsCardProps) {
  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-oklch(0.5 0.1 240)';
    }
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-oklch(0.9 0.02 240) shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-oklch(0.5 0.08 240)">{title}</p>
          <p className="text-2xl font-bold text-oklch(0.15 0.1 240)">{value}</p>
          {subtitle && (
            <p className="text-sm text-oklch(0.6 0.06 240)">{subtitle}</p>
          )}
        </div>
        {trend && (
          <div className={`text-sm ${getTrendColor(trend.direction)}`}>
            <span className="text-lg">{getTrendIcon(trend.direction)}</span>
            <span className="ml-1">{trend.value}% {trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Recent activity item component
interface ActivityItemProps {
  activity: {
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: string;
  };
}

function ActivityItem({ activity }: ActivityItemProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contact':
        return '👤';
      case 'deal':
        return '💼';
      case 'meeting':
        return '📅';
      case 'email':
        return '📧';
      case 'call':
        return '📞';
      default:
        return '📝';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-start space-x-3 p-4 hover:bg-oklch(0.98 0.005 240) rounded-md transition-colors">
      <div className="flex-shrink-0 text-2xl">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-oklch(0.2 0.15 240)">
          {activity.title}
        </p>
        <p className="text-sm text-oklch(0.5 0.08 240) truncate">
          {activity.description}
        </p>
        <p className="text-xs text-oklch(0.6 0.06 240) mt-1">
          {formatDate(activity.createdAt)}
        </p>
      </div>
    </div>
  );
}

// Dashboard component with data fetching
// interface DashboardProps {
//   dashboardDataPromise?: Promise<DashboardStats>;
// }

function DashboardContent() {
  // Mock data for now - replace with actual tRPC query
  const mockData: DashboardStats = {
    totalContacts: 1247,
    totalCompanies: 89,
    activeDeals: 23,
    totalRevenue: 342500,
    currency: 'USD',
    recentActivities: [
      {
        id: '1',
        type: 'contact',
        title: 'New contact added',
        description: 'Sarah Johnson from TechCorp was added to the system',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: 'deal',
        title: 'Deal updated',
        description: 'Software License deal moved to negotiation stage',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: 'meeting',
        title: 'Meeting completed',
        description: 'Product demo with Acme Corp concluded successfully',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        type: 'email',
        title: 'Email sent',
        description: 'Follow-up email sent to 15 prospects',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    upcomingMeetings: [
      {
        id: '1',
        title: 'Product Demo - StartupXYZ',
        startDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        attendeeCount: 3,
      },
      {
        id: '2',
        title: 'Contract Review - BigCorp',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        attendeeCount: 5,
      },
    ],
  };

  // If using actual data fetching:
  // const data = dashboardDataPromise ? use(dashboardDataPromise) : mockData;
  const data = mockData;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Contacts"
          value={data.totalContacts.toLocaleString()}
          trend={{ value: 12, label: 'this month', direction: 'up' }}
        />
        <StatsCard
          title="Companies"
          value={data.totalCompanies}
          trend={{ value: 8, label: 'this month', direction: 'up' }}
        />
        <StatsCard
          title="Active Deals"
          value={data.activeDeals}
          trend={{ value: 5, label: 'this week', direction: 'up' }}
        />
        <StatsCard
          title="Revenue (YTD)"
          value={formatCurrency(data.totalRevenue, data.currency)}
          trend={{ value: 23, label: 'vs last year', direction: 'up' }}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-oklch(0.9 0.02 240) shadow-sm">
            <div className="px-6 py-4 border-b border-oklch(0.9 0.02 240)">
              <h3 className="text-lg font-medium text-oklch(0.15 0.1 240)">Recent Activity</h3>
            </div>
            <div className="divide-y divide-oklch(0.95 0.01 240)">
              {data.recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
            <div className="px-6 py-3 border-t border-oklch(0.9 0.02 240)">
              <button className="text-sm text-oklch(0.5 0.15 240) hover:text-oklch(0.4 0.15 240) font-medium">
                View all activity →
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div>
          <div className="bg-white rounded-lg border border-oklch(0.9 0.02 240) shadow-sm">
            <div className="px-6 py-4 border-b border-oklch(0.9 0.02 240)">
              <h3 className="text-lg font-medium text-oklch(0.15 0.1 240)">Upcoming Meetings</h3>
            </div>
            <div className="p-4 space-y-4">
              {data.upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="border-l-4 border-oklch(0.5 0.15 240) pl-4">
                  <h4 className="text-sm font-medium text-oklch(0.2 0.15 240)">
                    {meeting.title}
                  </h4>
                  <p className="text-sm text-oklch(0.5 0.08 240)">
                    {new Date(meeting.startDate).toLocaleString()}
                  </p>
                  <p className="text-xs text-oklch(0.6 0.06 240)">
                    {meeting.attendeeCount} attendees
                  </p>
                </div>
              ))}
            </div>
            <div className="px-6 py-3 border-t border-oklch(0.9 0.02 240)">
              <button className="text-sm text-oklch(0.5 0.15 240) hover:text-oklch(0.4 0.15 240) font-medium">
                View calendar →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg border border-oklch(0.9 0.02 240) shadow-sm p-6">
        <h3 className="text-lg font-medium text-oklch(0.15 0.1 240) mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-oklch(0.9 0.02 240) rounded-md hover:bg-oklch(0.98 0.005 240) transition-colors">
            <span className="text-2xl mb-2">👤</span>
            <span className="text-sm font-medium text-oklch(0.3 0.12 240)">Add Contact</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-oklch(0.9 0.02 240) rounded-md hover:bg-oklch(0.98 0.005 240) transition-colors">
            <span className="text-2xl mb-2">🏢</span>
            <span className="text-sm font-medium text-oklch(0.3 0.12 240)">Add Company</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-oklch(0.9 0.02 240) rounded-md hover:bg-oklch(0.98 0.005 240) transition-colors">
            <span className="text-2xl mb-2">💼</span>
            <span className="text-sm font-medium text-oklch(0.3 0.12 240)">Create Deal</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-oklch(0.9 0.02 240) rounded-md hover:bg-oklch(0.98 0.005 240) transition-colors">
            <span className="text-2xl mb-2">📅</span>
            <span className="text-sm font-medium text-oklch(0.3 0.12 240)">Schedule Meeting</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Main dashboard page component
export function Dashboard() {
  // For now, we'll use mock data
  // In the future, this would be: const dashboardQuery = trpc.dashboard.overview.useQuery();
  
  return <DashboardContent />;
}

export default Dashboard;
