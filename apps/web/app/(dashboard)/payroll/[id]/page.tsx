"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@payrollx/ui";
import { Button } from "@payrollx/ui";
import { Badge } from "@payrollx/ui";
import { Alert, AlertDescription } from "@payrollx/ui";
import {
  DollarSign,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  ExternalLink,
  RefreshCw,
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
  items: PayrollItem[];
}

interface PayrollItem {
  id: string;
  employeeId: string;
  amount: number;
  paymentToken: string;
  status: string;
  txSignature?: string;
  retryCount: number;
  employee: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export default function PayrollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [payrollRun, setPayrollRun] = useState<PayrollRun | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayrollRun = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const response = await fetch(`/api/payroll/runs/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPayrollRun(data);
        } else {
          setError("Failed to fetch payroll run details");
        }
      } catch (error) {
        console.error("Failed to fetch payroll run:", error);
        setError("An error occurred while fetching payroll run details");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchPayrollRun();
    }
  }, [params.id]);

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
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleExecutePayroll = async () => {
    if (!payrollRun) return;

    setIsExecuting(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await fetch(
        `/api/payroll/runs/${payrollRun.id}/execute`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Refresh the payroll run data
        const updatedResponse = await fetch(
          `/api/payroll/runs/${payrollRun.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (updatedResponse.ok) {
          const data = await updatedResponse.json();
          setPayrollRun(data);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to execute payroll");
      }
    } catch (error) {
      console.error("Failed to execute payroll:", error);
      setError("An error occurred while executing payroll");
    } finally {
      setIsExecuting(false);
    }
  };

  const getSolanaExplorerUrl = (signature: string) => {
    return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
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

  if (error || !payrollRun) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>
            {error || "Payroll run not found"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Payroll Run #{payrollRun.id.slice(-8)}
          </h1>
          <p className="text-gray-600">Payroll run details and execution</p>
        </div>
        <div className="flex space-x-3">
          {payrollRun.status === "PENDING" && (
            <Button onClick={handleExecutePayroll} disabled={isExecuting}>
              {isExecuting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Execute Payroll
            </Button>
          )}
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(payrollRun.status)}>
              {getStatusIcon(payrollRun.status)}
              <span className="ml-1">{payrollRun.status}</span>
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${payrollRun.totalAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {payrollRun.currency}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollRun.employeeCount}</div>
            <p className="text-xs text-muted-foreground">Total employees</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Details */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Details</CardTitle>
          <CardDescription>Information about this payroll run</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">
                Created At:
              </span>
              <p className="text-sm">
                {new Date(payrollRun.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">
                Scheduled Date:
              </span>
              <p className="text-sm">
                {new Date(payrollRun.scheduledDate).toLocaleString()}
              </p>
            </div>
            {payrollRun.completedAt && (
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Completed At:
                </span>
                <p className="text-sm">
                  {new Date(payrollRun.completedAt).toLocaleString()}
                </p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-gray-500">
                Created By:
              </span>
              <p className="text-sm">{payrollRun.createdBy}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Items */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Items</CardTitle>
          <CardDescription>
            Individual payments for each employee
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payrollRun.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {item.employee.user.firstName}{" "}
                      {item.employee.user.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.employee.user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium">
                      ${item.amount.toLocaleString()} {item.paymentToken}
                    </p>
                    {item.retryCount > 0 && (
                      <p className="text-xs text-gray-500">
                        Retry count: {item.retryCount}
                      </p>
                    )}
                  </div>

                  <Badge className={getItemStatusColor(item.status)}>
                    {item.status}
                  </Badge>

                  {item.txSignature && (
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={getSolanaExplorerUrl(item.txSignature)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

