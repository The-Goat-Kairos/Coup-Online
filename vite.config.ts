import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type ViteDevServer } from 'vite';
import type { Server as HTTPServer} from 'http';

const webSocketServer = {
    name: 'webSocketServer',
    configureServer(viteServer: ViteDevServer) {
        const httpServer = viteServer.httpServer!;
        if (httpServer) {
            import('./src/lib/server/socket').then(({ initSocket }) => {
                initSocket(httpServer as HTTPServer);
            });
        }
    }
};

export default defineConfig({ plugins: [tailwindcss(), sveltekit(), webSocketServer] });
