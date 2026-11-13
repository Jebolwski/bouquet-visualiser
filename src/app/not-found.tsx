import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h2 className="text-2xl font-serif font-bold mb-2">Sayfa Bulunamadı</h2>
      <p className="text-stone-500 text-sm mb-4">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
      <Link href="/" className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-medium">
        Stüdyoya Dön
      </Link>
    </div>
  );
}
