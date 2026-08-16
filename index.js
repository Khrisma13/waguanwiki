// index.js
const ORIGIN = 'https://saiba.moe';  // 替换为你的 GitHub Pages 地址

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        // 只保护 /waguanwiki/ 路径
        if (!path.startsWith('/waguanwiki/')) {
            return new Response('Not Found', { status: 404 });
        }

        // 从环境变量读取凭证（在 wrangler.toml 或 Dashboard Secrets 中设置）
        const USERNAME = env.USERNAME || 'admin';
        const PASSWORD = env.PASSWORD || 'your-secret-password';

        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return new Response('Unauthorized', {
                status: 401,
                headers: { 'WWW-Authenticate': 'Basic realm="群友档案馆"' }
            });
        }

        try {
            const base64 = authHeader.split(' ')[1];
            const credentials = atob(base64);
            const [user, pwd] = credentials.split(':');

            if (user === USERNAME && pwd === PASSWORD) {
                // 验证通过，代理请求至 GitHub Pages
                const newUrl = ORIGIN + path;
                const newRequest = new Request(newUrl, {
                    method: request.method,
                    headers: request.headers,
                    body: request.body,
                });
                newRequest.headers.delete('Host');
                return fetch(newRequest);
            } else {
                return new Response('Forbidden', { status: 403 });
            }
        } catch (err) {
            return new Response('Invalid Authorization Header', { status: 400 });
        }
    }
};