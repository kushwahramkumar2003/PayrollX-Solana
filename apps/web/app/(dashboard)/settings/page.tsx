"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@payrollx/ui";
import { Button } from "@payrollx/ui";
import { Input } from "@payrollx/ui";
import { Label } from "@payrollx/ui";
import { Alert, AlertDescription } from "@payrollx/ui";
import {
  Loader2,
  Save,
  Building2,
  Users,
  DollarSign,
  Clock,
} from "lucide-react";

const organizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  payrollSchedule: z.string().min(1, "Payroll schedule is required"),
  defaultCurrency: z.string().min(1, "Default currency is required"),
  timezone: z.string().min(1, "Timezone is required"),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

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
}

export default function SettingsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
  });

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const response = await fetch("/api/organizations/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOrganization(data);
          reset({
            name: data.name,
            payrollSchedule: data.config.payrollSchedule,
            defaultCurrency: data.config.defaultCurrency,
            timezone: data.config.timezone,
          });
        }
      } catch (error) {
        console.error("Failed to fetch organization:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganization();
  }, [reset]);

  const onSubmit = async (data: OrganizationFormData) => {
    if (!organization) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await fetch(`/api/organizations/${organization.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          config: {
            payrollSchedule: data.payrollSchedule,
            defaultCurrency: data.defaultCurrency,
            timezone: data.timezone,
          },
        }),
      });

      if (response.ok) {
        const updatedOrg = await response.json();
        setOrganization(updatedOrg);
        setSuccess("Organization settings updated successfully");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update organization settings");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
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

  if (!organization) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>Organization not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your organization settings</p>
      </div>

      {/* Organization Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organization</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.name}</div>
            <p className="text-xs text-muted-foreground">
              {organization.onboardingCompleted
                ? "Setup Complete"
                : "Setup Pending"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Authorized Signers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organization.authorizedSigners.length}
            </div>
            <p className="text-xs text-muted-foreground">Signers configured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Default Currency
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organization.config.defaultCurrency}
            </div>
            <p className="text-xs text-muted-foreground">Primary currency</p>
          </CardContent>
        </Card>
      </div>

      {/* Organization Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
          <CardDescription>
            Update your organization configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <select
                  id="defaultCurrency"
                  {...register("defaultCurrency")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SOL">SOL</option>
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                </select>
                {errors.defaultCurrency && (
                  <p className="text-sm text-red-500">
                    {errors.defaultCurrency.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payrollSchedule">Payroll Schedule</Label>
                <select
                  id="payrollSchedule"
                  {...register("payrollSchedule")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="WEEKLY">Weekly</option>
                  <option value="BIWEEKLY">Bi-weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                </select>
                {errors.payrollSchedule && (
                  <p className="text-sm text-red-500">
                    {errors.payrollSchedule.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  {...register("timezone")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Shanghai">Shanghai</option>
                </select>
                {errors.timezone && (
                  <p className="text-sm text-red-500">
                    {errors.timezone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Authorized Signers */}
      <Card>
        <CardHeader>
          <CardTitle>Authorized Signers</CardTitle>
          <CardDescription>
            Manage who can authorize payroll transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {organization.authorizedSigners.map((signer, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Signer #{index + 1}
                    </h3>
                    <p className="text-sm text-gray-500">{signer}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Remove
                </Button>
              </div>
            ))}

            <Button variant="outline" className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Add Authorized Signer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

