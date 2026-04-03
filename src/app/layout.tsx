import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import SafeHeader from "@/components/SafeHeader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#1e3a8a",
};

export const metadata: Metadata = {
  title: "Transparência Construção | MVP",
  description: "Plataforma de transparência financeira para projetos de construção civil.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Transparência",
  },
};

import { AuthProvider } from "@/components/providers/AuthProvider";
import PageContainer from "@/components/PageContainer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col font-body bg-background text-foreground selection:bg-primary/10 selection:text-primary"
        suppressHydrationWarning
      >
        <AuthProvider>
          <SafeHeader />
          <PageContainer>
            {children}
          </PageContainer>
        </AuthProvider>
      </body>
    </html>
  );
}
