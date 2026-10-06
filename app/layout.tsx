import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "AKANI Design Lab", description: "Turn great references into reusable design intelligence." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html> }