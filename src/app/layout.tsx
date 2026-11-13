import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fleur & Artisan | 3D İnteraktif Buket ve Hediye Tasarımcısı',
  description:
    'Three.js ve React Three Fiber ile güçlendirilmiş, kişiye özel 3D buket, retro gazete ambalajı ve hediye kartı tasarım stüdyosu.',
  keywords: [
    '3D Buket Tasarımı',
    'Çiçek Tasarımı',
    'React Three Fiber',
    'Three.js',
    'Next.js',
    'Vintage Gazete Buket',
    'Hediye Çiçek',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Agrave+Pro:wght@100..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
