import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Background from "@/components/Background";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EnterpriseBlog - Modern Blogging Platform",
  description: "A modern, enterprise-grade blogging platform with advanced features, collaboration tools, and beautiful design.",
  keywords: "blog, enterprise, collaboration, modern, glassmorphism, design",
  authors: [{ name: "EnterpriseBlog Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "EnterpriseBlog - Modern Blogging Platform",
    description: "A modern, enterprise-grade blogging platform with advanced features and beautiful design.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "EnterpriseBlog - Modern Blogging Platform",
    description: "A modern, enterprise-grade blogging platform with advanced features and beautiful design.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/logo.svg" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Beautiful animated background */}
        <Background />
        
        {/* Main content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Performance optimization */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </body>
    </html>
  );
}
