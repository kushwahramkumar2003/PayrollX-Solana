"use client";

import { Upload } from "@/components/ui/upload";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

interface KYCUploadProps {
  employeeId: string;
  onSuccess?: () => void;
}

export default function KYCUpload({ employeeId, onSuccess }: KYCUploadProps) {
  const mutation = useMutation({
    mutationFn: (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("kycDocs", file));
      return apiClient.post(`/api/employees/${employeeId}/kyc`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("KYC documents uploaded successfully!");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to upload KYC documents"
      );
    },
  });

  return (
    <Upload
      onUpload={mutation.mutate}
      maxFiles={3}
      accept={{
        "image/*": [".png", ".jpg", ".jpeg", ".gif"],
        "application/pdf": [".pdf"],
      }}
      disabled={mutation.isPending}
    />
  );
}
