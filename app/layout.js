import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AdmissionWidget from "../components/AdmissionWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Pillai College of Engineering | Admission Enquiry",
  description:
    "Admission enquiry portal for Pillai College of Engineering. Ask questions, share your interest, and our admissions team will contact you.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}
      >
        {children}
        <AdmissionWidget />
      </body>
    </html>
  );
}
