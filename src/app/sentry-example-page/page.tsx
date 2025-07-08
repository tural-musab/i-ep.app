'use client';

import Head from 'next/head';
import * as Sentry from '@sentry/nextjs';
import { useState, useEffect } from 'react';

const { logger } = Sentry;

class SentryExampleFrontendError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = 'SentryExampleFrontendError';
  }
}

export default function Page() {
  const [isConnected, setIsConnected] = useState(true);
  const [testResult, setTestResult] = useState<{
    type: string;
    message: string;
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    async function checkConnectivity() {
      const result = await Sentry.diagnoseSdkConnectivity();
      setIsConnected(result !== 'sentry-unreachable');
      
      // Log connectivity check
      logger.info('Sentry connectivity check completed', {
        connected: result !== 'sentry-unreachable',
        result,
        timestamp: new Date().toISOString(),
      });
    }
    checkConnectivity();
  }, []);

  const handleErrorTest = async () => {
    await Sentry.startSpan(
      {
        name: 'Error Test Button Click',
        op: 'ui.click',
      },
      async (span) => {
        try {
          // Add attributes to the span
          span.setAttribute('test_type', 'error_example');
          span.setAttribute('user_action', 'button_click');
          
          // Log the test start
          logger.info('Starting Sentry error test', {
            test_type: 'error_example',
            user_action: 'button_click',
            timestamp: new Date().toISOString(),
          });

          // Create a child span for the API call
          await Sentry.startSpan(
            {
              name: 'Example Frontend/Backend API Call',
              op: 'http.client',
            },
            async (apiSpan) => {
              apiSpan.setAttribute('endpoint', '/api/sentry-example-api');
              apiSpan.setAttribute('method', 'GET');
              
              const res = await fetch('/api/sentry-example-api');
              
              apiSpan.setAttribute('response_status', res.status);
              
              if (!res.ok) {
                setTestResult({
                  type: 'API Error',
                  message: 'Backend API returned an error',
                  timestamp: new Date().toISOString(),
                });
                
                logger.warn('API request failed', {
                  endpoint: '/api/sentry-example-api',
                  status: res.status,
                  timestamp: new Date().toISOString(),
                });
              }
            }
          );

          // Throw a frontend error for testing
          const error = new SentryExampleFrontendError(
            'This error is raised on the frontend of the example page.'
          );

          // Capture the exception with detailed context
          Sentry.captureException(error, {
            tags: {
              component: 'sentry-example-page',
              test_error: true,
              error_origin: 'frontend',
            },
            extra: {
              user_action: 'button_click',
              timestamp: new Date().toISOString(),
              connectivity_status: isConnected,
            },
            level: 'error',
          });

          span.setStatus({ code: 2, message: 'Test Error Thrown' });
          throw error;

        } catch (error) {
          // Log the error for additional context
          logger.error('Error test completed with exception', {
            error: error instanceof Error ? error.message : 'Unknown error',
            error_type: error instanceof SentryExampleFrontendError ? 'test_error' : 'unexpected_error',
            timestamp: new Date().toISOString(),
          });

          setTestResult({
            type: 'Frontend Error',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            timestamp: new Date().toISOString(),
          });

          throw error; // Re-throw to maintain original behavior
        }
      }
    );
  };

  const handleLoggingTest = () => {
    Sentry.startSpan(
      {
        name: 'Logging Test Button Click',
        op: 'ui.click',
      },
      (span) => {
        span.setAttribute('test_type', 'logging_example');
        span.setAttribute('user_action', 'logging_test');

        // Demonstrate different log levels
        logger.trace('Trace level log example', { 
          component: 'sentry-example-page',
          test_type: 'logging',
        });

        logger.debug(logger.fmt`Debug level log with user interaction at ${new Date().toISOString()}`);

        logger.info('Info level log - user tested logging functionality', {
          component: 'sentry-example-page',
          feature: 'logging_test',
          timestamp: new Date().toISOString(),
        });

        logger.warn('Warning level log example', {
          warning_type: 'test_warning',
          component: 'sentry-example-page',
        });

        setTestResult({
          type: 'Logging Test',
          message: 'Various log levels sent to Sentry',
          timestamp: new Date().toISOString(),
        });

        logger.info('Logging test completed successfully', {
          test_result: 'success',
          logs_sent: 5,
          timestamp: new Date().toISOString(),
        });
      }
    );
  };

  const handlePerformanceTest = async () => {
    await Sentry.startSpan(
      {
        name: 'Performance Test Button Click',
        op: 'ui.click',
      },
      async (span) => {
        span.setAttribute('test_type', 'performance_example');
        
        logger.info('Starting performance test', {
          test_type: 'performance',
          timestamp: new Date().toISOString(),
        });

        // Simulate some work with child spans
        await Sentry.startSpan(
          {
            name: 'Data Processing Simulation',
            op: 'task.processing',
          },
          async (processingSpan) => {
            processingSpan.setAttribute('simulation_type', 'data_processing');
            
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 100));
            
            processingSpan.setAttribute('processed_items', 1000);
          }
        );

        await Sentry.startSpan(
          {
            name: 'Calculation Simulation',
            op: 'task.calculation',
          },
          async (calcSpan) => {
            calcSpan.setAttribute('calculation_type', 'statistical_analysis');
            
            // Simulate calculation delay
            await new Promise(resolve => setTimeout(resolve, 50));
            
            calcSpan.setAttribute('calculations_performed', 25);
          }
        );

        setTestResult({
          type: 'Performance Test',
          message: 'Performance traces sent to Sentry',
          timestamp: new Date().toISOString(),
        });

        logger.info('Performance test completed', {
          test_result: 'success',
          total_duration: Date.now(),
          timestamp: new Date().toISOString(),
        });
      }
    );
  };

  return (
    <div>
      <Head>
        <title>sentry-example-page</title>
        <meta name="description" content="Test Sentry for your Next.js app!" />
      </Head>

      <main>
        <div className="flex-spacer" />
        <svg height="40" width="40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M21.85 2.995a3.698 3.698 0 0 1 1.353 1.354l16.303 28.278a3.703 3.703 0 0 1-1.354 5.053 3.694 3.694 0 0 1-1.848.496h-3.828a31.149 31.149 0 0 0 0-3.09h3.815a.61.61 0 0 0 .537-.917L20.523 5.893a.61.61 0 0 0-1.057 0l-3.739 6.494a28.948 28.948 0 0 1 9.63 10.453 28.988 28.988 0 0 1 3.499 13.78v1.542h-9.852v-1.544a19.106 19.106 0 0 0-2.182-8.85 19.08 19.08 0 0 0-6.032-6.829l-1.85 3.208a15.377 15.377 0 0 1 6.382 12.484v1.542H3.696A3.694 3.694 0 0 1 0 34.473c0-.648.17-1.286.494-1.849l2.33-4.074a8.562 8.562 0 0 1 2.689 1.536L3.158 34.17a.611.611 0 0 0 .538.917h8.448a12.481 12.481 0 0 0-6.037-9.09l-1.344-.772 4.908-8.545 1.344.77a22.16 22.16 0 0 1 7.705 7.444 22.193 22.193 0 0 1 3.316 10.193h3.699a25.892 25.892 0 0 0-3.811-12.033 25.856 25.856 0 0 0-9.046-8.796l-1.344-.772 5.269-9.136a3.698 3.698 0 0 1 3.2-1.849c.648 0 1.285.17 1.847.495Z"
            fill="currentcolor"
          />
        </svg>
        <h1>Sentry Test Sayfası</h1>

        <p className="description">
          Aşağıdaki butonları kullanarak Sentry&apos;nin farklı özelliklerini test edin. 
          Hataları ve performans verilerini{' '}
          <a target="_blank" href="https://tomnap.sentry.io/issues/?project=4509633858764880">
            Sentry Issues Sayfası
          </a>
          &apos;nda görüntüleyebilirsiniz. Daha fazla bilgi için{' '}
          <a target="_blank" href="https://docs.sentry.io/platforms/javascript/guides/nextjs/">
            belgelerimizi okuyun
          </a>
          .
        </p>

        <div className="button-group">
          <button
            type="button"
            onClick={handleErrorTest}
            disabled={!isConnected}
          >
            <span>Hata Testi</span>
          </button>

          <button
            type="button"
            onClick={handleLoggingTest}
            disabled={!isConnected}
          >
            <span>Logging Testi</span>
          </button>

          <button
            type="button"
            onClick={handlePerformanceTest}
            disabled={!isConnected}
          >
            <span>Performans Testi</span>
          </button>
        </div>

        {testResult ? (
          <div className="test-result">
            <h3>{testResult.type}</h3>
            <p>{testResult.message}</p>
            <small>{testResult.timestamp}</small>
          </div>
        ) : !isConnected ? (
          <div className="connectivity-error">
            <p>
              Sentry&apos;ye ağ istekleri engelleniyor gibi görünüyor, bu da hataların yakalanmasını engelleyecektir. 
              Testi tamamlamak için reklam engelleyicinizi devre dışı bırakmayı deneyin.
            </p>
          </div>
        ) : (
          <div className="success_placeholder" />
        )}

        <div className="flex-spacer" />
      </main>

      <style>{`
        main {
          display: flex;
          min-height: 100vh;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 16px;
          padding: 16px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
        }

        h1 {
          padding: 0px 4px;
          border-radius: 4px;
          background-color: rgba(24, 20, 35, 0.03);
          font-family: monospace;
          font-size: 20px;
          line-height: 1.2;
        }

        p {
          margin: 0;
          font-size: 20px;
        }

        a {
          color: #6341F0;
          text-decoration: underline;
          cursor: pointer;

          @media (prefers-color-scheme: dark) {
            color: #B3A1FF;
          }
        }

        .button-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        button {
          border-radius: 8px;
          color: white;
          cursor: pointer;
          background-color: #553DB8;
          border: none;
          padding: 0;
          margin-top: 4px;

          & > span {
            display: inline-block;
            padding: 12px 16px;
            border-radius: inherit;
            font-size: 16px;
            font-weight: bold;
            line-height: 1;
            background-color: #7553FF;
            border: 1px solid #553DB8;
            transform: translateY(-4px);
          }

          &:hover > span {
            transform: translateY(-8px);
          }

          &:active > span {
            transform: translateY(0);
          }

          &:disabled {
            cursor: not-allowed;
            opacity: 0.6;

            & > span {
              transform: translateY(0);
              border: none
            }
          }
        }

        .description {
          text-align: center;
          color: #6E6C75;
          max-width: 500px;
          line-height: 1.5;
          font-size: 18px;

          @media (prefers-color-scheme: dark) {
            color: #A49FB5;
          }
        }

        .flex-spacer {
          flex: 1;
        }

        .test-result {
          padding: 12px 16px;
          border-radius: 8px;
          background-color: #00F261;
          border: 1px solid #00BF4D;
          color: #181423;
          text-align: center;
          max-width: 400px;
        }

        .test-result h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
        }

        .test-result p {
          margin: 0 0 4px 0;
          font-size: 14px;
        }

        .test-result small {
          font-size: 12px;
          opacity: 0.8;
        }

        .success_placeholder {
          height: 80px;
        }

        .connectivity-error {
          padding: 12px 16px;
          background-color: #E50045;
          border-radius: 8px;
          width: 500px;
          color: #FFFFFF;
          border: 1px solid #A80033;
          text-align: center;
          margin: 0;
        }
        
        .connectivity-error a {
          color: #FFFFFF;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
