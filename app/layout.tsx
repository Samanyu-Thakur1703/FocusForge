import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FocusForge",
  description: "A personal focus coach for students."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
