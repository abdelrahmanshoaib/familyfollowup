"use client";

import { StoreProvider } from "@/lib/store";
import Navbar from "./Navbar";
import type { ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <Navbar />
      <main className="p-4 pb-20 md:pb-4 pt-16 max-w-5xl mx-auto min-h-screen">
        {children}
      </main>
    </StoreProvider>
  );
}
