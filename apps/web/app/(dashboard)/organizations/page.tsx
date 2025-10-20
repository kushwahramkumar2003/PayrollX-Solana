"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Organization {
  id: string;
  name: string;
  description: string;
  walletAddress: string;
  createdAt: string;
  employeeCount: number;
  status: string;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/organizations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch organizations");
      }

      const data = await response.json();
      setOrganizations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-600">
            Manage your organizations and their settings
          </p>
        </div>
        <Link
          href="/organizations/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg"
        >
          Create Organization
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {organizations.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🏢</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No organizations yet
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first organization.
            </p>
            <Link
              href="/organizations/new"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg"
            >
              Create Organization
            </Link>
          </div>
        ) : (
          organizations.map((org) => (
            <div key={org.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {org.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{org.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Wallet Address:
                      </span>
                      <p className="text-gray-600 font-mono">
                        {org.walletAddress}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Employees:
                      </span>
                      <p className="text-gray-600">{org.employeeCount}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          org.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {org.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Created:
                      </span>
                      <p className="text-gray-600">
                        {new Date(org.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/organizations/${org.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    View
                  </Link>
                  <Link
                    href={`/organizations/${org.id}/edit`}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
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
