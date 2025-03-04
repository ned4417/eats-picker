import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


const inter = Inter({ subsets: ["latin"] });
const apiKey = process.env.GOOGLE_API_KEY

export const metadata: Metadata = {
  title: {default: "Grub Guide", template: "%s | Grub Guide"},
  description: "A restaurant finder app that helps you discover new places to eat",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
          {/* Load the Google Maps JavaScript API script with your API key */}
          <script
            src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
            async
            defer
          ></script>
        </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
