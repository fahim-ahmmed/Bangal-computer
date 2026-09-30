"use client";

import { ThemeProvider } from "@gravity-ui/uikit";

export function AdminProviders({ children }) {
  return <ThemeProvider theme="light">{children}</ThemeProvider>;
}
