import Link from 'next/link';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary p-4 text-white shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Iqra Eğitim Portalı
          </Link>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/docs" className="hover:underline">
                  Dokümantasyon Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/docs/api" className="hover:underline">
                  API Dokümanları
                </Link>
              </li>
              <li>
                <Link href="/docs/components" className="hover:underline">
                  Bileşenler
                </Link>
              </li>
              <li>
                <Link href="/docs/guides" className="hover:underline">
                  Rehberler
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>

      <footer className="bg-gray-800 p-6 text-white">
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 md:mb-0">
              <p>&copy; {new Date().getFullYear()} Iqra Eğitim Portalı. Tüm hakları saklıdır.</p>
            </div>
            <div>
              <ul className="flex space-x-4">
                <li>
                  <Link href="/docs" className="hover:underline">
                    Dokümantasyon
                  </Link>
                </li>
                <li>
                  <Link href="/docs/api" className="hover:underline">
                    API
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/i-es"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
