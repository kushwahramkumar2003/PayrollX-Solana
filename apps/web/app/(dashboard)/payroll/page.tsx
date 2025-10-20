"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Payroll {
  id: string;
  organizationId: string;
  organizationName: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  employeeCount: number;
  status: string;
  createdAt: string;
}

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/payroll", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch payrolls");
      }

      const data = await response.json();
      setPayrolls(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-600">
            Manage and process payroll for your organizations
          </p>
        </div>
        <Link
          href="/payroll/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg"
        >
          Create Payroll
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {payrolls.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">💰</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No payroll runs yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first payroll run to get started.
            </p>
            <Link
              href="/payroll/new"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg"
            >
              Create Payroll
            </Link>
          </div>
        ) : (
          payrolls.map((payroll) => (
            <div key={payroll.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {payroll.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payroll.status)}`}
                    >
                      {payroll.status}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{payroll.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Organization:
                      </span>
                      <p className="text-gray-600">
                        {payroll.organizationName}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Period:</span>
                      <p className="text-gray-600">
                        {new Date(payroll.startDate).toLocaleDateString()} -{" "}
                        {new Date(payroll.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Total Amount:
                      </span>
                      <p className="text-gray-600 font-semibold">
                        ${payroll.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Employees:
                      </span>
                      <p className="text-gray-600">{payroll.employeeCount}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="font-medium text-gray-700">Created:</span>
                    <p className="text-gray-600">
                      {new Date(payroll.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-6">
                  <Link
                    href={`/payroll/${payroll.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm text-center"
                  >
                    View Details
                  </Link>
                  {payroll.status === "PENDING" && (
                    <Link
                      href={`/payroll/${payroll.id}/process`}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm text-center"
                    >
                      Process
                    </Link>
                  )}
                  <Link
                    href={`/payroll/${payroll.id}/edit`}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm text-center"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
