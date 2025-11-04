import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Blog - Discover Amazing Articles",
    template: "%s | Blog"
  },
  description: "Discover amazing articles on technology, development, and innovation. Explore our collection with smart search, tags, categories, and archives.",
  keywords: ["blog", "articles", "technology", "development", "programming", "search", "tags", "categories"],
  authors: [{ name: "Blog Team" }],
  creator: "Blog Team",
  publisher: "Blog",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Blog - Discover Amazing Articles",
    description: "Discover amazing articles on technology, development, and innovation. Explore our collection with smart search, tags, categories, and archives.",
    siteName: "Blog",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Blog - Discover Amazing Articles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Discover Amazing Articles",
    description: "Discover amazing articles on technology, development, and innovation.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
