import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Real Estate Auto Post - Local Real Estate SA",
  description: "Automated real estate social media post generator for Local Real Estate SA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <footer className="fixed bottom-4 right-4 text-xs text-gray-500 dark:text-gray-400 space-x-3">
          <a href="/agents" className="hover:text-indigo-600">Agents</a>
          <a href="/branding" className="hover:text-indigo-600">Branding</a>
        </footer>
      </body>
    </html>
  );
}
