'use client';
import localFont from 'next/font/local';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import CookieBanner from '@/components/CookiesConsent/banner';
import ErrorBoundary from '@/utils/ErrorBoundary';
import ClientAuthWrapper from '@/contexts/ClientAuthWrapper';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import QueryProvider from '@/utils/QueryProvider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <ClientAuthWrapper>{children}</ClientAuthWrapper>
              <SpeedInsights />
              <Analytics />
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
