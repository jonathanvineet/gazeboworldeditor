import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gazebo World Editor",
  description: "Visual Gazebo .world / .sdf file editor running entirely in the browser",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-zinc-900 text-zinc-100 h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
