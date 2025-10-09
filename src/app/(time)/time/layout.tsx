import { Montserrat, Space_Grotesk } from "next/font/google";
import "./time.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={`${montserrat.className} ${spaceGrotesk.variable}`}>{children}</div>;
}
