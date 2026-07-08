import { ClerkProvider } from "@clerk/nextjs";
import { AuthControls } from "../components/auth-controls";
import { Dropdown } from "../components/dropdown";
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
  title: "Macedonia Cervezas",
  description: "Macedonia Cervezas - Cerveza artesanal gasificada naturalmente, elaborada en Trenque Lauquen, Buenos Aires, Argentina.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-zinc-900">
        <ClerkProvider>
          <header className="sticky top-0 z-50 w-full border-b border-red-100 bg-white">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-3 shrink-0">
                <img src="/logo.jpg" alt="Macedonia Cervezas" className="h-10 w-10 shrink-0 rounded-full object-cover border border-red-200" />
                <span className="hidden sm:inline text-xl font-bold tracking-tight text-red-700">Macedonia Cervezas</span>
              </div>
              <nav className="flex items-center gap-4 sm:gap-6 text-sm font-semibold">
                <Dropdown
                  title="Bebidas"
                  options={[
                    { label: "Cervezas", href: "/cervezas", dotColorClass: "bg-amber-500" },
                    { label: "Espirituosas", href: "/espirituosas", dotColorClass: "bg-violet-500" },
                    { label: "Vermouth", href: "/vermouth", dotColorClass: "bg-rose-600" }
                  ]}
                  titleColor="text-zinc-600"
                  hoverColor="hover:text-red-600"
                />
                <a href="#" className="text-zinc-600 hover:text-red-600 transition-colors">Alquiler</a>
                <AuthControls />
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t py-6 text-center text-sm text-zinc-500 bg-white">
            <p>© {new Date().getFullYear()} Macedonia Cervezas. Todos los derechos reservados.</p>
          </footer>
        </ClerkProvider>
      </body>
    </html>
  );
}