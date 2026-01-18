import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:5001',
            changeOrigin: true,
            secure: false
          }
        },
        headers: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Production build optimizations
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: isProduction, // Remove console.log in production
            drop_debugger: isProduction, // Remove debugger statements
            pure_funcs: isProduction ? ['console.log', 'console.debug', 'console.info'] : []
          },
          mangle: {
            safari10: true
          },
          format: {
            comments: false // Remove comments
          }
        },
        sourcemap: false, // Disable source maps in production
        rollupOptions: {
          output: {
            // Obfuscate chunk names
            chunkFileNames: isProduction ? 'assets/[hash].js' : 'assets/[name]-[hash].js',
            entryFileNames: isProduction ? 'assets/[hash].js' : 'assets/[name]-[hash].js',
            assetFileNames: isProduction ? 'assets/[hash].[ext]' : 'assets/[name]-[hash].[ext]'
          }
        }
      },
      esbuild: {
        drop: isProduction ? ['console', 'debugger'] : []
      }
    };
});
