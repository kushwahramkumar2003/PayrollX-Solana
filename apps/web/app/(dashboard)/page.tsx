// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@payrollx/ui";
// import { DollarSign, Users, Building2, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your payroll system.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Payroll</h3>
            <span className="text-gray-500">💰</span>
          </div>
          <div className="pt-2">
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-gray-500">
              +20.1% from last month
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Employees</h3>
            <span className="text-gray-500">👥</span>
          </div>
          <div className="pt-2">
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-gray-500">
              +180.1% from last month
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Organizations</h3>
            <span className="text-gray-500">🏢</span>
          </div>
          <div className="pt-2">
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-gray-500">
              +19% from last month
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Growth</h3>
            <span className="text-gray-500">📈</span>
          </div>
          <div className="pt-2">
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-gray-500">
              +201 since last hour
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <p className="text-sm text-gray-600">
              Latest payroll transactions processed
            </p>
          </div>
          <div>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-sm text-muted-foreground">
                    $3,500.00 - Software Engineer
                  </p>
                </div>
                <div className="ml-auto font-medium">2 hours ago</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Jane Smith</p>
                  <p className="text-sm text-muted-foreground">
                    $4,200.00 - Product Manager
                  </p>
                </div>
                <div className="ml-auto font-medium">4 hours ago</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Mike Johnson
                  </p>
                  <p className="text-sm text-muted-foreground">
                    $2,800.00 - Designer
                  </p>
                </div>
                <div className="ml-auto font-medium">6 hours ago</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Upcoming Payroll</h3>
            <p className="text-sm text-gray-600">
              Scheduled payroll runs for this week
            </p>
          </div>
          <div>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Weekly Payroll
                  </p>
                  <p className="text-sm text-muted-foreground">
                    45 employees - $125,000.00
                  </p>
                </div>
                <div className="ml-auto font-medium">Tomorrow</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Monthly Bonus
                  </p>
                  <p className="text-sm text-muted-foreground">
                    120 employees - $45,000.00
                  </p>
                </div>
                <div className="ml-auto font-medium">Friday</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Contractor Payments
                  </p>
                  <p className="text-sm text-muted-foreground">
                    15 contractors - $18,500.00
                  </p>
                </div>
                <div className="ml-auto font-medium">Next Monday</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
