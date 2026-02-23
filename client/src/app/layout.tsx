import type { Metadata } from "next";
import "../styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
    title: "AutoConcierge | Nigeria's Smartest Car Marketplace",
    description: "AI-powered vehicle valuations and real-time auctions.",
};

import { ToastProvider } from "@/context/ToastContext";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <ToastProvider>
                    <AuthProvider>
                        <Navbar />
                        <div className="pt-16">
                            {children}
                        </div>
                    </AuthProvider>
                </ToastProvider>
            </body>
        </html>
    );
}
