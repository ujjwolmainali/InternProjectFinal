import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import ToastProvider from "./components/ToastProvider";
import ReduxProvider from "./components/ReduxProvider";
import Script from 'next/script';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      <Script
        id="ckeditor-cdn"
        src="https://cdn.ckeditor.com/ckeditor5/41.4.2/classic/ckeditor.js"
        strategy="beforeInteractive"
      />
      {/* Inline script runs before React hydration — prevents dark-mode flash */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{if(localStorage.getItem('darkMode')==='true'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
        }}
      />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`} cz-shortcut-listen="true">
        <ReduxProvider>
          {children}
        </ReduxProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
