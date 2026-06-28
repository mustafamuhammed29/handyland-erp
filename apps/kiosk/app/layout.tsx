import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { WizardProvider } from "../components/kiosk/WizardContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "HANDYLAND Check-in",
  description: "Premium device repair check-in kiosk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${instrumentSerif.variable} antialiased font-sans bg-background text-foreground`}>
        <WizardProvider>
          {children}
        </WizardProvider>
      </body>
    </html>
  );
}
