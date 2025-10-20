"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@payrollx/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@payrollx/ui";
import { Input } from "@payrollx/ui";
import { Label } from "@payrollx/ui";
import { Alert, AlertDescription } from "@payrollx/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@payrollx/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@payrollx/ui";
import { Badge } from "@payrollx/ui";
import { Loader2, Plus, Trash2, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";

const employeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  wallet: z.string(),
  amount: z.number().min(0, "Amount must be positive"),
});

const payrollSchema = z.object({
  currency: z.enum(["SOL", "USDC"]),
  scheduledDate: z.string(),
  notes: z.string().optional(),
  employees: z
    .array(employeeSchema)
    .min(1, "At least one employee is required"),
});

type PayrollFormData = z.infer<typeof payrollSchema>;

interface Employee {
  id: string;
  name: string;
  email: string;
  walletAddress?: string;
  salary: number;
  paymentToken: "SOL" | "USDC";
  isActive: boolean;
}

export default function CreatePayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      currency: "SOL",
      employees: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "employees",
  });

  const watchedCurrency = watch("currency");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const response = await fetch("/api/employees", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setEmployees(data.filter((emp: Employee) => emp.isActive));
        }
      } catch (error) {
        console.error("Failed to fetch employees:", error);
        toast.error("Failed to load employees");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const addEmployee = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return;

    // Check if employee is already added
    const isAlreadyAdded = fields.some((field) => field.id === employeeId);
    if (isAlreadyAdded) {
      toast.error("Employee already added to payroll");
      return;
    }

    append({
      id: employeeId,
      name: employee.name,
      wallet: employee.walletAddress || "",
      amount: employee.salary,
    });
  };

  const onSubmit = async (data: PayrollFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("/api/payroll/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currency: data.currency,
          scheduledDate: data.scheduledDate,
          notes: data.notes,
          items: data.employees.map((emp) => ({
            employeeId: emp.id,
            amount: emp.amount,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create payroll run");
      }

      const result = await response.json();
      toast.success("Payroll run created successfully");
      router.push(`/payroll/${result.id}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = fields.reduce((sum, field) => sum + field.amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Payroll Run</h1>
        <p className="text-gray-600">
          Set up a new payroll run for your employees
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Configure the basic details for this payroll run
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Payment Currency</Label>
                <Select
                  value={watchedCurrency}
                  onValueChange={(value) =>
                    setValue("currency", value as "SOL" | "USDC")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOL">SOL</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="text-sm text-red-500">
                    {errors.currency.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  {...register("scheduledDate")}
                  className={errors.scheduledDate ? "border-red-500" : ""}
                />
                {errors.scheduledDate && (
                  <p className="text-sm text-red-500">
                    {errors.scheduledDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Add any notes about this payroll run"
                  {...register("notes")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payroll Summary</CardTitle>
              <CardDescription>
                Overview of the current payroll run
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Employees:</span>
                <Badge variant="secondary">{fields.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Amount:</span>
                <span className="font-bold">
                  {totalAmount.toLocaleString()} {watchedCurrency}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employee Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Add Employees</CardTitle>
            <CardDescription>
              Select employees to include in this payroll run
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select onValueChange={addEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee to add" />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter(
                      (emp) => !fields.some((field) => field.id === emp.id)
                    )
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{employee.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {employee.paymentToken}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {fields.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Wallet Address</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{field.name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {field.wallet.slice(0, 8)}...
                            {field.wallet.slice(-8)}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            {...register(`employees.${index}.amount`, {
                              valueAsNumber: true,
                            })}
                            className="w-32"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {errors.employees && (
                <p className="text-sm text-red-500">
                  {errors.employees.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || fields.length === 0}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Payroll Run
          </Button>
        </div>
      </form>
    </div>
  );
}
