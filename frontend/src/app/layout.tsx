import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hunar.AI Platform | AI-Powered HR Suite",
  description: "AI Hiring Assistant, People Search & Reachout, and Smart Attendance — powered by Hunar.AI Voice Agents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
