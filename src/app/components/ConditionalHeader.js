"use client";

import { usePathname } from "next/navigation";
import BasicHeader from "./BasicHeader";

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Don't show header on admin pages or admin-secret page
  if (pathname?.startsWith("/admin") || pathname === "/admin-secret") {
    return null;
  }
  
  return <BasicHeader />;
} 