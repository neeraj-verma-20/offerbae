"use client";

import { usePathname } from "next/navigation";
import BasicHeader from "./BasicHeader";

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Don't show header on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  
  return <BasicHeader />;
} 