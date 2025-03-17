import Link from 'next/link';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            Maarif Okul Portalı
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
      
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white p-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>&copy; {new Date().getFullYear()} Maarif Okul Portalı. Tüm hakları saklıdır.</p>
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
                  <a href="https://github.com/maarifportal" target="_blank" rel="noreferrer" className="hover:underline">
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