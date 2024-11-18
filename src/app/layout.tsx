
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Head from "next/head";
import CookieBanner from "@/components/CookiesConsent/banner";
import ErrorBoundary from "@/utils/ErrorBoundary";
import ClientAuthWrapper from "@/contexts/ClientAuthWrapper";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import QueryProvider from "@/utils/QueryProvider";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Collab-Hub",
  description: "A place for everyone to work on innovative projects together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        {/* All your icon links here */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
        <QueryProvider>
          <AuthProvider>
            <ClientAuthWrapper>{children}</ClientAuthWrapper>
            <CookieBanner />
          </AuthProvider>
          <ToastContainer />
          <ReactQueryDevtools initialIsOpen={false} />
          </QueryProvider>
        </ErrorBoundary>
        
      </body>
    </html>
  );
}
