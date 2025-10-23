"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SolanaProvider } from "@/components/wallet/SolanaProvider";
import { Toaster } from "sonner";
import { useState } from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SolanaProvider>
        {children}
        <Toaster position="top-right" theme="dark" />
      </SolanaProvider>
    </QueryClientProvider>
  );
}
