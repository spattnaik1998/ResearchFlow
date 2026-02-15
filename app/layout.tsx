import type { Metadata } from "next";
import "./globals.css";
import { RootLayoutClient } from "./RootLayoutClient";

export const metadata: Metadata = {
  title: "ResearchFlow",
  description: "Search, Summarize, Explore - AI-powered research with follow-up questions and knowledge base",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
