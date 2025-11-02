const http = require('http');
const os = require('os');

const PORT = process.env.PORT || 3000;
const VERSION = process.env.APP_VERSION || '1.0.0';

const server = http.createServer((req, res) => {
    const hostname = os.hostname();
    const uptime = process.uptime();
    
    // Health check endpoint
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'healthy',
            hostname: hostname,
            uptime: Math.floor(uptime)
        }));
        return;
    }
    
    // Main page
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>DevOps Day 3 - Docker & ECS</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 50px auto;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                .container {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 30px;
                    border-radius: 10px;
                    backdrop-filter: blur(10px);
                }
                h1 { margin-top: 0; }
                .info { 
                    background: rgba(255, 255, 255, 0.2);
                    padding: 15px;
                    border-radius: 5px;
                    margin: 10px 0;
                }
                .label { font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🐳 DevOps Day 3: Docker & ECS Deployment</h1>
                <div class="info">
                    <p><span class="label">Container ID:</span> ${hostname}</p>
                    <p><span class="label">Version:</span> ${VERSION}</p>
                    <p><span class="label">Uptime:</span> ${Math.floor(uptime)} seconds</p>
                    <p><span class="label">Port:</span> ${PORT}</p>
                </div>
                <p>✅ This application is running in a Docker container on AWS ECS!</p>
            </div>
        </body>
        </html>
    `);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Container ID: ${os.hostname()}`);
    console.log(`Version: ${VERSION}`);
});
