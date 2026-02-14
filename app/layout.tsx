import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "No Catch — One free item every day",
  description: "Enter today’s drawing. If you win, we ship it. No catch.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
