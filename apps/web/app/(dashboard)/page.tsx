"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@payrollx/ui";
import { Button } from "@payrollx/ui";
import { Badge } from "@payrollx/ui";
import {
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalEmployees: number;
  totalPayrollRuns: number;
  totalDisbursed: number;
  pendingPayrolls: number;
}

interface RecentPayrollRun {
  id: string;
  status: string;
  totalAmount: number;
  employeeCount: number;
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPayrolls, setRecentPayrolls] = useState<RecentPayrollRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const [statsResponse, payrollsResponse] = await Promise.all([
          fetch("/api/dashboard/stats", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("/api/payroll/runs?limit=5", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        if (payrollsResponse.ok) {
          const payrollsData = await payrollsResponse.json();
          setRecentPayrolls(payrollsData.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with your payroll.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link href="/payroll/create">
              <Plus className="h-4 w-4 mr-2" />
              New Payroll Run
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalEmployees || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active employees in your organization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Payroll Runs
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalPayrollRuns || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Payroll runs completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Disbursed
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.totalDisbursed?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Total amount disbursed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payrolls
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.pendingPayrolls || 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting execution</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payroll Runs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payroll Runs</CardTitle>
          <CardDescription>
            Your latest payroll runs and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentPayrolls.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No payroll runs yet</p>
              <Button asChild className="mt-4">
                <Link href="/payroll/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Payroll Run
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPayrolls.map((payroll) => (
                <div
                  key={payroll.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">
                        Payroll Run #{payroll.id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {payroll.employeeCount} employees • $
                        {payroll.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(payroll.status)}>
                      {payroll.status}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/payroll/${payroll.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Employees</CardTitle>
            <CardDescription>
              Add, edit, or remove employees from your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/employees">
                <Users className="h-4 w-4 mr-2" />
                View Employees
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance</CardTitle>
            <CardDescription>
              View audit logs and compliance reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/compliance">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Compliance
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Configure your organization settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/settings">
                <DollarSign className="h-4 w-4 mr-2" />
                View Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
