import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FloatingContactButtons from "@/components/ui/FloatingContactButtons";
import { ToastProvider } from "@/context/ToastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FollowProperty - India's Property Intelligence Platform",
  description: "Monitor value, builder risks, legal alerts, and appreciation in one place. Built for serious property investors.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col overflow-x-hidden max-w-full">
        <ToastProvider>
          {children}
        </ToastProvider>
        <FloatingContactButtons />
      </body>
    </html>
  );
}

