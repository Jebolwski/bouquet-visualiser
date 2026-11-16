import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fleur & Artisan | 3D Interactive Bouquet & Gift Designer',
  description:
    'Interactive 3D bouquet, vintage newspaper wrapping, vase arrangement, and personalized gift card design studio powered by Three.js and React Three Fiber.',
  keywords: [
    '3D Bouquet Designer',
    'Flower Arrangement',
    'React Three Fiber',
    'Three.js',
    'Next.js',
    'Vintage Newspaper Bouquet',
    'Gift Flowers',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Agrave+Pro:wght@100..700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('fleur_artisan_theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased min-h-screen h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
