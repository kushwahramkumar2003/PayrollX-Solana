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
  Building2,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  Edit,
  Plus,
} from "lucide-react";
import Link from "next/link";

interface Organization {
  id: string;
  name: string;
  config: {
    payrollSchedule: string;
    defaultCurrency: string;
    timezone: string;
  };
  authorizedSigners: string[];
  onboardingCompleted: boolean;
  employeeCount: number;
  totalDisbursed: number;
  createdAt: string;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const response = await fetch("/api/organizations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOrganizations(data);
        }
      } catch (error) {
        console.error("Failed to fetch organizations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-600">
            Manage your organizations and their settings
          </p>
        </div>
        <Button asChild>
          <Link href="/organizations/create">
            <Plus className="h-4 w-4 mr-2" />
            New Organization
          </Link>
        </Button>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <Card key={org.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  {org.name}
                </CardTitle>
                <Badge
                  variant={org.onboardingCompleted ? "default" : "secondary"}
                  className={
                    org.onboardingCompleted
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {org.onboardingCompleted ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Pending
                    </>
                  )}
                </Badge>
              </div>
              <CardDescription>
                Created {new Date(org.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium">
                      {org.employeeCount}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      employees
                    </span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium">
                      ${org.totalDisbursed.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      disbursed
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Payroll Schedule:</span>{" "}
                    <span className="text-gray-600">
                      {org.config.payrollSchedule}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Currency:</span>{" "}
                    <span className="text-gray-600">
                      {org.config.defaultCurrency}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Timezone:</span>{" "}
                    <span className="text-gray-600">{org.config.timezone}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <Link href={`/organizations/${org.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    {!org.onboardingCompleted && (
                      <Button size="sm" asChild className="flex-1">
                        <Link href={`/organizations/${org.id}/onboard`}>
                          Complete Setup
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {organizations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No organizations yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first organization to get started with PayrollX
            </p>
            <Button asChild>
              <Link href="/organizations/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

