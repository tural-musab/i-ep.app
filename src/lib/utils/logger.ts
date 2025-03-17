/**
 * Maarif Okul Portalı - Logger Modülü
 * 
 * Bu modül, uygulama genelinde tutarlı loglama sağlar.
 * Geliştirme ortamında konsola, üretim ortamında ise
 * yapılandırılmış bir şekilde dosyaya veya harici servislere log gönderir.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

/**
 * Belirli bir modül için logger oluşturur
 * 
 * @param module Logger'ın ait olduğu modül adı
 * @returns Logger nesnesi
 */
export function getLogger(module: string): Logger {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Loglama seviyesini belirle
  const minLevel = isDevelopment ? 'debug' : 'info';
  
  // Log seviyelerinin öncelik sırası
  const levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };
  
  // Belirli bir seviyede log oluşturan fonksiyon
  const createLogFn = (level: LogLevel) => {
    return (message: string, ...args: any[]) => {
      // Minimum log seviyesini kontrol et
      if (levelPriority[level] < levelPriority[minLevel as LogLevel]) {
        return;
      }
      
      const timestamp = new Date().toISOString();
      const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}`;
      
      // Geliştirme ortamında konsola yazdır
      if (isDevelopment) {
        switch (level) {
          case 'debug':
            console.debug(formattedMessage, ...args);
            break;
          case 'info':
            console.info(formattedMessage, ...args);
            break;
          case 'warn':
            console.warn(formattedMessage, ...args);
            break;
          case 'error':
            console.error(formattedMessage, ...args);
            break;
        }
      } else {
        // Üretim ortamında yapılandırılmış loglama
        // Burada harici bir loglama servisi entegrasyonu yapılabilir
        // Örneğin: Sentry, LogRocket, vb.
        
        // Şimdilik basit konsol çıktısı
        console[level](formattedMessage, ...args);
        
        // Hata loglarını Sentry veya benzeri bir servise gönderme örneği:
        if (level === 'error') {
          // Örnek: Sentry.captureException(args[0] instanceof Error ? args[0] : new Error(message));
        }
      }
    };
  };
  
  // Logger nesnesini oluştur
  return {
    debug: createLogFn('debug'),
    info: createLogFn('info'),
    warn: createLogFn('warn'),
    error: createLogFn('error')
  };
} 