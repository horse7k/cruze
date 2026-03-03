"use client";

import { SessionProvider } from "next-auth/react";
import { I18nProvider } from "@/lib/i18n";
import SolanaWalletProvider from "./wallet-provider";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SolanaWalletProvider>
        <I18nProvider>
          {children}
        </I18nProvider>
      </SolanaWalletProvider>
    </SessionProvider>
  );
}
