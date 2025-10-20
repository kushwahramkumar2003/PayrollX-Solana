"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ComplianceReport {
  id: string;
  organizationId: string;
  organizationName: string;
  reportType: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  filePath?: string;
  error?: string;
}

export default function CompliancePage() {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/compliance/reports", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch compliance reports");
      }

      const data = await response.json();
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (reportType: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/compliance/reports", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reportType }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      // Refresh the reports list
      fetchReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
          <h1 className="text-3xl font-bold text-gray-900">Compliance</h1>
          <p className="text-gray-600">
            Generate and manage compliance reports
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => generateReport("PAYROLL_SUMMARY")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg"
          >
            Generate Payroll Report
          </button>
          <button
            onClick={() => generateReport("AUDIT_LOG")}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg"
          >
            Generate Audit Log
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {reports.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🛡️</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No compliance reports yet
            </h3>
            <p className="text-gray-600 mb-4">
              Generate your first compliance report to get started.
            </p>
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => generateReport("PAYROLL_SUMMARY")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg"
              >
                Generate Payroll Report
              </button>
              <button
                onClick={() => generateReport("AUDIT_LOG")}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg"
              >
                Generate Audit Log
              </button>
            </div>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {report.reportType.replace("_", " ")}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="font-medium text-gray-700">
                        Organization:
                      </span>
                      <p className="text-gray-600">{report.organizationName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Created:
                      </span>
                      <p className="text-gray-600">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {report.completedAt && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Completed:
                        </span>
                        <p className="text-gray-600">
                          {new Date(report.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {report.filePath && (
                      <div>
                        <span className="font-medium text-gray-700">File:</span>
                        <p className="text-gray-600 font-mono text-xs">
                          {report.filePath.split("/").pop()}
                        </p>
                      </div>
                    )}
                  </div>

                  {report.error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                      Error: {report.error}
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-6">
                  {report.status === "COMPLETED" && report.filePath && (
                    <a
                      href={report.filePath}
                      download
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm text-center"
                    >
                      Download
                    </a>
                  )}
                  <Link
                    href={`/compliance/reports/${report.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm text-center"
                  >
                    View Details
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
