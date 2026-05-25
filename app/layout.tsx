import type { Metadata } from "next";
import { PwaRegister } from "@/components/ui/PwaRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "Transport Fee Manager",
  description: "Mobile-first transport fee tracking for local van businesses.",
  applicationName: "Transport Fee Manager",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Transport Fee Manager",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
