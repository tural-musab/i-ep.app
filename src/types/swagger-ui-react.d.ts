declare module 'swagger-ui-react' {
  import * as React from 'react';

  interface SwaggerUIProps {
    spec?: Record<string, unknown>;
    url?: string;
    docExpansion?: 'list' | 'full' | 'none';
    defaultModelsExpandDepth?: number;
    requestInterceptor?: (req: Request) => Request;
    responseInterceptor?: (res: Response) => Response;
    onComplete?: () => void;
    [key: string]: unknown;
  }

  const SwaggerUI: React.FC<SwaggerUIProps>;

  export default SwaggerUI;
}
