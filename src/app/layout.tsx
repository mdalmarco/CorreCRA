import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Desafio CRA 2026",
  description: "Sistema de gestão do Desafio CRA 2026",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
