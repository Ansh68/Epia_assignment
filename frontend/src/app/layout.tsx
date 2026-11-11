import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MedCare – Patient Follow-up",
  description: "Patient follow-up management system for MedCare Clinic",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} bg-slate-50 min-h-full`}>
        {children}
        <Toaster
          position="bottom-right"
          theme="light"
          toastOptions={{
            duration: 3500,
            classNames: {
              toast:
                "border border-slate-200/80 shadow-md font-sans rounded-lg py-3 px-3.5 text-xs text-slate-800 bg-white",
              title: "font-semibold text-slate-900 text-xs",
              description: "text-slate-500 text-[11px] mt-0.5",
              success: "border-emerald-200 text-emerald-950",
              error: "border-rose-200 text-rose-950",
              info: "border-sky-200 text-sky-950",
            },
          }}
        />
      </body>
    </html>
  );
}
