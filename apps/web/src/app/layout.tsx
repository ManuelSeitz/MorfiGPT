import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { getUser } from "@/lib/auth";
import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MorfiGPT",
  description: "Tu herramienta para dejar de pensar que comer.",
  icons: "/favicon.svg",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  return (
    <html lang="es" className={`${nunitoSans.variable} antialiased`}>
      <body className="bg-primary-50 flex min-h-dvh">
        <Sidebar />
        <main className="relative flex h-dvh flex-1 flex-col overflow-hidden">
          <Navbar user={user} />
          {children}
        </main>
      </body>
    </html>
  );
}
