"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { ReactNode } from "react";

// Create a query client
const queryClient = new QueryClient();

const QueryProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

export default QueryProvider;
