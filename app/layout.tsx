import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HyperSpace Scanner",
  description: "Scan dollar bills to access portals",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HyperSpace Scanner",
  },
  applicationName: "HyperSpace Scanner",
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/app-icon.png" />
        <link rel="shortcut icon" type="image/png" href="/app-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script id="device-detector" strategy="beforeInteractive">
          {`
            // Detect if the device is a desktop
            function isMobileDevice() {
              return (
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                (navigator.maxTouchPoints && navigator.maxTouchPoints > 2)
              );
            }

            // If not a mobile device, redirect to a "desktop not supported" message
            if (!isMobileDevice() && window.location.pathname.includes("/scanner")) {
              window.location.href = "/desktop-not-supported";
            }
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
