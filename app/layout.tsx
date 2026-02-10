import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoiceSearch Insights",
  description: "Search, Summarize, Listen - Get AI-powered audio summaries of any topic",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
