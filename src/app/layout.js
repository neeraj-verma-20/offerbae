import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Header from "./components/Header"; // ✅ Import your Header component

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Offerbae – Just grab it!",
  description: "Discover exclusive offers from top malls and shops in Indore, Bhopal, Ujjain, and cities all over India!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <Header /> {/* ✅ This will show header on every page */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
