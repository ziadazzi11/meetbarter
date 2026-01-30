/**
 * Copyright (c) 2026 Ziad Azzi. All Rights Reserved.
 * This software is proprietary and confidential.
 */
import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "Meetbarter | Trust-Based Barter in Lebanon",
  description: "Trade goods and services without cash using Meetbarter's trust network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <ClientLayout>{children}</ClientLayout>
    </html>
  );
}
