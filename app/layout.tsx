import type { Metadata } from "next";
import { PwaRegister } from "@/components/ui/PwaRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daniyal Transport",
  description: "Daily pick and drop fee tracking for Daniyal Transport customers.",
  applicationName: "Daniyal Transport",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    title: "Daniyal Transport",
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
