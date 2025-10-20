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
import { Input } from "@payrollx/ui";
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Eye,
  Play,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface PayrollRun {
  id: string;
  status: string;
  totalAmount: number;
  currency: string;
  employeeCount: number;
  scheduledDate: string;
  createdAt: string;
  completedAt?: string;
  createdBy: string;
}

export default function PayrollPage() {
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchPayrollRuns = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const response = await fetch("/api/payroll/runs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPayrollRuns(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch payroll runs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayrollRuns();
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
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-3 w-3" />;
      case "IN_PROGRESS":
        return <Play className="h-3 w-3" />;
      case "COMPLETED":
        return <CheckCircle className="h-3 w-3" />;
      case "FAILED":
        return <XCircle className="h-3 w-3" />;
      case "CANCELLED":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const filteredPayrollRuns = payrollRuns.filter((run) => {
    const matchesSearch =
      run.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.currency.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === "all" || run.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleExecutePayroll = async (runId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await fetch(`/api/payroll/runs/${runId}/execute`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Refresh the payroll runs list
        const updatedResponse = await fetch("/api/payroll/runs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (updatedResponse.ok) {
          const data = await updatedResponse.json();
          setPayrollRuns(data.data || []);
        }
      }
    } catch (error) {
      console.error("Failed to execute payroll:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Payroll Runs</h1>
          <p className="text-gray-600">Manage and execute payroll runs</p>
        </div>
        <Button asChild>
          <Link href="/payroll/create">
            <Plus className="h-4 w-4 mr-2" />
            New Payroll Run
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search payroll runs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Runs List */}
      <div className="space-y-4">
        {filteredPayrollRuns.map((run) => (
          <Card key={run.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Payroll Run #{run.id.slice(-8)}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600">
                        <Users className="h-3 w-3 inline mr-1" />
                        {run.employeeCount} employees
                      </span>
                      <span className="text-sm text-gray-600">
                        <DollarSign className="h-3 w-3 inline mr-1" />$
                        {run.totalAmount.toLocaleString()} {run.currency}
                      </span>
                      <span className="text-sm text-gray-600">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(run.scheduledDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Badge className={getStatusColor(run.status)}>
                    {getStatusIcon(run.status)}
                    <span className="ml-1">{run.status}</span>
                  </Badge>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/payroll/${run.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {run.status === "PENDING" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExecutePayroll(run.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPayrollRuns.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterStatus !== "all"
                ? "No payroll runs found"
                : "No payroll runs yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Create your first payroll run to get started"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Button asChild>
                <Link href="/payroll/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Payroll Run
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

