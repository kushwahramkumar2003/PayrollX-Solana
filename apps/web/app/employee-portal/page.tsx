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
  DollarSign,
  Wallet,
  History,
  User,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface Employee {
  id: string;
  userId: string;
  walletAddress: string;
  kycStatus: string;
  salary: number;
  paymentToken: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface RecentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  txSignature?: string;
}

export default function EmployeePortalPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<
    RecentTransaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const [employeeResponse, transactionsResponse] = await Promise.all([
          fetch("/api/employees/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("/api/transactions/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (employeeResponse.ok) {
          const employeeData = await employeeResponse.json();
          setEmployee(employeeData);
        }

        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setRecentTransactions(transactionsData.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch employee data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getKycStatusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <CheckCircle className="h-3 w-3" />;
      case "PENDING":
        return <Clock className="h-3 w-3" />;
      case "REJECTED":
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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

  if (!employee) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Employee Profile Not Found
            </h3>
            <p className="text-gray-500">Please contact your administrator</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Employee Portal</h1>
        <p className="text-gray-600">
          Welcome back, {employee.user.firstName}!
        </p>
      </div>

      {/* Employee Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${employee.salary.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {employee.paymentToken} per pay period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KYC Status</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getKycStatusColor(employee.kycStatus)}>
              {getKycStatusIcon(employee.kycStatus)}
              <span className="ml-1">{employee.kycStatus}</span>
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {employee.walletAddress
                ? `${employee.walletAddress.slice(0, 8)}...${employee.walletAddress.slice(-8)}`
                : "Not linked"}
            </div>
            <p className="text-xs text-muted-foreground">
              {employee.walletAddress ? "Connected" : "Link wallet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest payroll payments</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/employee-portal/transactions">
                <History className="h-4 w-4 mr-2" />
                View All
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No transactions yet
              </h3>
              <p className="text-gray-500">
                Your payroll payments will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Payroll Payment
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">
                        ${transaction.amount.toLocaleString()}{" "}
                        {transaction.currency}
                      </p>
                    </div>

                    <Badge
                      className={getTransactionStatusColor(transaction.status)}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              View all your payroll transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/employee-portal/transactions">
                <History className="h-4 w-4 mr-2" />
                View Transactions
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Management</CardTitle>
            <CardDescription>
              Manage your Solana wallet connection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/employee-portal/wallet">
                <Wallet className="h-4 w-4 mr-2" />
                Manage Wallet
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

