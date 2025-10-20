"use client";

// import { ThemeProvider } from "next-themes";
// import { Toaster } from "sonner";
// import { SolanaWalletProvider } from "../components/wallet/SolanaWalletProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <>{children}</>;
}
