import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "../globals.css";
import { WizardProvider } from "../../components/kiosk/WizardContext";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

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

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!['de', 'en', 'ar', 'tr'].includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${instrumentSerif.variable} antialiased font-sans bg-background text-foreground`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <WizardProvider>
            {children}
          </WizardProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
