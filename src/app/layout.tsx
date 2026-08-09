import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "DocFlow — polished documents, simple signatures", description: "Format, share, sign, and download business documents." };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
