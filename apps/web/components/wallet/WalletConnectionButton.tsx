"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import { Badge } from "@payrollx/ui";
import { Card } from "@payrollx/ui";
import { Button } from "@payrollx/ui";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";

interface WalletConnectionButtonProps {
  onConnect?: (publicKey: string) => void;
  onDisconnect?: () => void;
}

export function WalletConnectionButton({
  onConnect,
  onDisconnect,
}: WalletConnectionButtonProps) {
  const { connected, publicKey, wallet } = useWallet();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (!publicKey) return;

    try {
      await navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  const getSolanaExplorerUrl = (address: string) => {
    return `https://explorer.solana.com/address/${address}?cluster=devnet`;
  };

  if (connected && publicKey) {
    return (
      <div className="flex items-center space-x-2">
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Connected
        </Badge>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {publicKey.toString().slice(0, 8)}...
            {publicKey.toString().slice(-8)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyAddress}
            className="h-8 w-8 p-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
            <a
              href={getSolanaExplorerUrl(publicKey.toString())}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <WalletDisconnectButton />
        </div>
      </div>
    );
  }

  return <WalletMultiButton />;
}
