"use client";

import { StoreProvider } from "@/lib/store";
import Navbar from "./Navbar";
import type { ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <Navbar />
      <main className="page min-h-dvh">{children}</main>
    </StoreProvider>
  );
}
