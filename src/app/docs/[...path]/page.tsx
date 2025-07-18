import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';

export default function DocPage({ params }: { params: { path: string[] } }) {
  try {
    // Rota parametrelerini alıp dosya yolunu oluştur
    const filePath = path.join(process.cwd(), 'docs', ...params.path);

    // Dosya uzantısını kontrol et, .md uzantısı yoksa ekle
    const filePathWithExt = filePath.endsWith('.md') ? filePath : `${filePath}.md`;

    // Dosyanın var olup olmadığını kontrol et
    if (!fs.existsSync(filePathWithExt)) {
      return notFound();
    }

    // Dosya içeriğini oku
    const fileContent = fs.readFileSync(filePathWithExt, 'utf8');

    return (
      <div className="markdown-container mx-auto max-w-4xl p-4">
        <div className="prose prose-slate">
          <pre className="max-h-[80vh] overflow-auto rounded bg-gray-50 p-4">{fileContent}</pre>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error reading markdown file:', error);
    return notFound();
  }
}
