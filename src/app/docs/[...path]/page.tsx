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
      <div className="markdown-container p-4 max-w-4xl mx-auto">
        <div className="prose prose-slate">
          <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-[80vh]">
            {fileContent}
          </pre>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error reading markdown file:', error);
    return notFound();
  }
} 