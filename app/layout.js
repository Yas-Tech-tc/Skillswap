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

export const metadata = {
  title: "SkillSwap",
  description: "Échangez vos compétences, sans argent",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="bg-white shadow-sm px-6 py-3 flex gap-4 text-sm text-textsub">
          <a href="/browse" className="hover:text-primary">Découvrir</a>
          <a href="/skills" className="hover:text-primary">Mes compétences</a>
          <a href="/requests" className="hover:text-primary">Demandes</a>
          <a href="/profile" className="hover:text-primary">Profil</a>
        </nav>
        {children}
      </body>
    </html>
  );
}