declare module 'swagger-ui-react' {
  import * as React from 'react';

  interface SwaggerUIProps {
    spec?: object;
    url?: string;
    docExpansion?: 'list' | 'full' | 'none';
    defaultModelsExpandDepth?: number;
    requestInterceptor?: (req: any) => any;
    responseInterceptor?: (res: any) => any;
    onComplete?: () => void;
    [key: string]: any;
  }

  const SwaggerUI: React.FC<SwaggerUIProps>;

  export default SwaggerUI;
} 