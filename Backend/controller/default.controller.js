import { UAParser } from 'ua-parser-js';
import os from 'os';
import Commision from '../models/commision.model.js';
export const handleDefaultGetRequest = async (req, res, next) => {
    try {
        // Parse user agent if not already parsed by middleware
        const parser = new UAParser(req.headers['user-agent']);
        const ua = parser.getResult();

        // Get IP address
        let ip = req.ip;
        if (req.headers['x-forwarded-for']) {
            ip = req.headers['x-forwarded-for'].split(',')[0].trim();
        } else if (req.socket.remoteAddress) {
            ip = req.socket.remoteAddress;
        }

        // Clean IPv6 addresses
        if (ip && ip.includes('::ffff:')) {
            ip = ip.replace('::ffff:', '');
        }

        // Prepare user information
        const userInfo = {
            ip,
            browser: {
                name: ua.browser.name || 'Unknown',
                version: ua.browser.version || 'Unknown',
                major: ua.browser.major || 'Unknown',
            },
            os: {
                name: ua.os.name || 'Unknown',
                version: ua.os.version || 'Unknown',
            },
            device: {
                type: ua.device.type || 'desktop',
                model: ua.device.model || 'Unknown',
                vendor: ua.device.vendor || 'Unknown',
            },
            userAgentRaw: req.headers['user-agent'],
            timestamp: new Date().toISOString(),
        };

        // Log the request
        // console.log(`📊 Homepage accessed by ${ip} using ${ua.browser.name} on ${ua.os.name}`);/

        // Choose response format based on Accept header or query parameter
        const acceptHeader = req.headers['accept'] || '';
        const format = req.query.format || (acceptHeader.includes('application/json') ? 'json' : 'html');

        if (format === 'json') {
            // JSON response
            res.status(200).json({
                success: true,
                message: 'Welcome to HamRahi API',
                data: {
                    user: userInfo,
                    server: {
                        name: 'HamRahi Backend',
                        version: '1.0.0',
                        status: 'active',
                        timestamp: new Date().toISOString(),
                    },
                    endpoints: {
                        userInfo: '/api/user-info',
                        health: '/api/health',
                        detailedInfo: '/api/user-info/detailed',
                    },
                    documentation: 'Add /docs endpoint for API documentation',
                },
            });
        } else {
            // HTML response - Beautiful welcome page
            const htmlResponse = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>🚗 HamRahi - Ride Sharing Platform</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            min-height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            padding: 20px;
                        }
                        
                        .container {
                            max-width: 1200px;
                            width: 100%;
                        }
                        
                        .card {
                            background: white;
                            border-radius: 20px;
                            padding: 40px;
                            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                            margin-bottom: 30px;
                            overflow: hidden;
                        }
                        
                        .header {
                            text-align: center;
                            margin-bottom: 40px;
                        }
                        
                        .logo {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 15px;
                            margin-bottom: 20px;
                        }
                        
                        .logo-icon {
                            font-size: 48px;
                            color: #E10600;
                        }
                        
                        .logo-text {
                            font-size: 48px;
                            font-weight: 800;
                            background: linear-gradient(135deg, #E10600 0%, #111111 100%);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                        }
                        
                        .tagline {
                            font-size: 20px;
                            color: #555555;
                            margin-bottom: 30px;
                        }
                        
                        .user-info {
                            background: #F7F7F7;
                            border-radius: 15px;
                            padding: 25px;
                            margin-bottom: 30px;
                            border: 1px solid #E5E5E5;
                        }
                        
                        .info-grid {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                            gap: 20px;
                        }
                        
                        .info-item {
                            background: white;
                            padding: 15px;
                            border-radius: 10px;
                            border-left: 4px solid #E10600;
                        }
                        
                        .info-label {
                            font-size: 12px;
                            color: #555555;
                            text-transform: uppercase;
                            font-weight: 600;
                            margin-bottom: 5px;
                        }
                        
                        .info-value {
                            font-size: 16px;
                            color: #111111;
                            font-weight: 500;
                        }
                        
                        .endpoints {
                            background: #F7F7F7;
                            border-radius: 15px;
                            padding: 25px;
                            margin-bottom: 30px;
                        }
                        
                        .endpoints-title {
                            font-size: 20px;
                            color: #111111;
                            margin-bottom: 20px;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                        }
                        
                        .endpoint-list {
                            display: flex;
                            flex-direction: column;
                            gap: 15px;
                        }
                        
                        .endpoint-item {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            background: white;
                            padding: 15px 20px;
                            border-radius: 10px;
                            border: 1px solid #E5E5E5;
                            transition: transform 0.2s, box-shadow 0.2s;
                        }
                        
                        .endpoint-item:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                        }
                        
                        .endpoint-name {
                            font-weight: 600;
                            color: #111111;
                        }
                        
                        .endpoint-url {
                            color: #E10600;
                            font-family: 'Courier New', monospace;
                        }
                        
                        .endpoint-description {
                            font-size: 14px;
                            color: #555555;
                        }
                        
                        .buttons {
                            display: flex;
                            gap: 15px;
                            justify-content: center;
                            flex-wrap: wrap;
                        }
                        
                        .btn {
                            padding: 12px 30px;
                            border-radius: 50px;
                            text-decoration: none;
                            font-weight: 600;
                            font-size: 16px;
                            transition: all 0.3s;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                        
                        .btn-primary {
                            background: #E10600;
                            color: white;
                            border: 2px solid #E10600;
                        }
                        
                        .btn-primary:hover {
                            background: #c10500;
                            transform: translateY(-2px);
                        }
                        
                        .btn-secondary {
                            background: transparent;
                            color: #111111;
                            border: 2px solid #E5E5E5;
                        }
                        
                        .btn-secondary:hover {
                            background: #F7F7F7;
                            transform: translateY(-2px);
                        }
                        
                        .footer {
                            text-align: center;
                            color: white;
                            margin-top: 30px;
                            opacity: 0.8;
                        }
                        
                        .footer a {
                            color: white;
                            text-decoration: underline;
                        }
                        
                        @media (max-width: 768px) {
                            .card {
                                padding: 20px;
                            }
                            
                            .logo-text {
                                font-size: 36px;
                            }
                            
                            .info-grid {
                                grid-template-columns: 1fr;
                            }
                            
                            .endpoint-item {
                                flex-direction: column;
                                align-items: flex-start;
                                gap: 10px;
                            }
                        }
                    </style>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                </head>
                <body>
                    <div class="container">
                        <div class="card">
                            <div class="header">
                                <div class="logo">
                                    <i class="fas fa-car-side logo-icon"></i>
                                    <h1 class="logo-text">HamRahi</h1>
                                </div>
                                <p class="tagline">Your trusted ride-sharing platform. Connect. Travel. Save.</p>
                            </div>
                            
                            <div class="user-info">
                                <h2 style="margin-bottom: 20px; color: #111111;">
                                    <i class="fas fa-user-circle"></i> Your Connection Info
                                </h2>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <div class="info-label">IP Address</div>
                                        <div class="info-value">${userInfo.ip}</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-label">Browser</div>
                                        <div class="info-value">${userInfo.browser.name} ${userInfo.browser.version}</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-label">Operating System</div>
                                        <div class="info-value">${userInfo.os.name} ${userInfo.os.version}</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-label">Device</div>
                                        <div class="info-value">${userInfo.device.type} - ${userInfo.device.model}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="endpoints">
                                <h2 class="endpoints-title">
                                    <i class="fas fa-plug"></i> Available API Endpoints
                                </h2>
                                <div class="endpoint-list">
                                    <div class="endpoint-item">
                                        <div>
                                            <div class="endpoint-name">Health Check</div>
                                            <div class="endpoint-description">Check if the server is running properly</div>
                                        </div>
                                        <div class="endpoint-url">GET /api/health</div>
                                    </div>
                                    <div class="endpoint-item">
                                        <div>
                                            <div class="endpoint-name">JSON Response</div>
                                            <div class="endpoint-description">View this page in JSON format</div>
                                        </div>
                                        <div class="endpoint-url">GET /?format=json</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="buttons">
                                <a href="/api/user-info" class="btn btn-primary">
                                    <i class="fas fa-code"></i> Try API
                                </a>
                                <a href="/api/health" class="btn btn-secondary">
                                    <i class="fas fa-heartbeat"></i> Check Health
                                </a>
                                <a href="/?format=json" class="btn btn-secondary">
                                    <i class="fas fa-brackets-curly"></i> View JSON
                                </a>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>HamRahi Backend Server v1.0.0 | Connected at ${userInfo.timestamp}</p>
                            <p>Made with <i class="fas fa-heart" style="color: #E10600;"></i> for seamless ride-sharing</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            res.status(200).send(htmlResponse);
        }

    } catch (error) {
        // console.error('Error in default route handler:', error);
        next(error);
    }
};



// In your main file, use it like this:
// import { handleDefaultGetRequest } from './path/to/handler.js';
// app.get("/", handleDefaultGetRequest);

export const handleHealthCheck = async (req, res, next) => {
    try {
        // Collect system information
        const startTime = process.hrtime();

        // Get memory usage
        const memoryUsage = process.memoryUsage();

        // Calculate uptime in human readable format
        const uptimeSeconds = process.uptime();
        const uptime = {
            seconds: uptimeSeconds,
            human: formatUptime(uptimeSeconds)
        };

        // Get server load
        let loadAvg = [0, 0, 0];
        try {
            if (typeof os.loadavg === 'function') {
                loadAvg = os.loadavg();
            }
        } catch (e) {
            // console.log('Could not get load average:', e.message);
        }

        // Database connection check
        const dbStatus = await checkDatabaseConnection();

        // External services status
        const externalServices = await checkExternalServices();

        // Response time calculation
        const hrend = process.hrtime(startTime);
        const responseTimeMs = (hrend[0] * 1000 + hrend[1] / 1000000).toFixed(2);

        // Prepare health data
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: uptime,
            server: {
                name: 'HamRahi Backend',
                version: process.env.npm_package_version || '1.0.0',
                environment: process.env.NODE_ENV || 'development',
                nodeVersion: process.version,
                platform: process.platform,
                architecture: process.arch,
            },
            system: {
                memory: {
                    rss: formatBytes(memoryUsage.rss),
                    heapTotal: formatBytes(memoryUsage.heapTotal),
                    heapUsed: formatBytes(memoryUsage.heapUsed),
                    external: formatBytes(memoryUsage.external),
                    arrayBuffers: formatBytes(memoryUsage.arrayBuffers),
                },
                cpu: {
                    usage: process.cpuUsage ? process.cpuUsage() : { user: 0, system: 0 },
                    loadAverage: loadAvg,
                },
                uptime: uptime.human,
                pid: process.pid,
            },
            performance: {
                responseTime: `${responseTimeMs}ms`,
                totalRequests: req.app.locals?.totalRequests || 0,
                activeConnections: req.app.locals?.activeConnections || 0,
            },
            dependencies: {
                database: dbStatus,
                redis: externalServices.redis,
                cache: externalServices.cache,
            },
            checks: {
                database: dbStatus.status === 'connected' ? 'pass' : 'fail',
                memory: (memoryUsage.heapUsed / memoryUsage.heapTotal) < 0.8 ? 'pass' : 'warning',
                uptime: uptimeSeconds > 60 ? 'pass' : 'starting',
            },
            endpoints: {
                count: req.app._router?.stack?.filter(layer => layer.route).length || 0,
                available: [
                    { path: '/', method: 'GET', description: 'Home page with user info' },
                    { path: '/api/health', method: 'GET', description: 'Health check endpoint' },
                    { path: '/api/user-info', method: 'GET', description: 'User agent information' },
                    { path: '/api/user-info/detailed', method: 'GET', description: 'Detailed user info with rate limiting' },
                ]
            }
        };

        // Determine overall status
        const allChecksPass = Object.values(healthData.checks).every(check =>
            check === 'pass' || check === 'starting'
        );

        healthData.status = allChecksPass ? 'healthy' : 'unhealthy';

        // Set appropriate status code
        const statusCode = allChecksPass ? 200 : 503;

        // Log health check
        // console.log(`🏥 Health check performed - Status: ${healthData.status} - Response: ${responseTimeMs}ms`);

        // Send response
        res.status(statusCode).json({
            success: true,
            message: healthData.status === 'healthy'
                ? 'Server is healthy and running smoothly'
                : 'Server is experiencing issues',
            data: healthData,
            meta: {
                responseTime: responseTimeMs,
                timestamp: healthData.timestamp,
            }
        });

    } catch (error) {
        // console.error('❌ Health check error:', error);

        // FIXED: Safely handle error object
        const errorMessage = error?.message || 'Unknown error occurred';
        const errorStack = error?.stack;

        // Send error response
        res.status(503).json({
            success: false,
            message: 'Health check failed',
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
            stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
            data: {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: 'Health check system failure',
                details: process.env.NODE_ENV === 'development' ? errorMessage : 'Contact administrator'
            }
        });
    }
};

// Helper functions
const formatUptime = (seconds) => {
    try {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

        return parts.join(' ');
    } catch (error) {
        return `${seconds}s`;
    }
};

const formatBytes = (bytes) => {
    try {
        if (bytes === 0 || !bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    } catch (error) {
        return 'Unknown';
    }
};

// Mock database check
const checkDatabaseConnection = async () => {
    try {
        return {
            status: 'connected',
            type: 'mock',
            message: 'Database connection not configured',
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        return {
            status: 'disconnected',
            error: error?.message || 'Unknown database error',
            timestamp: new Date().toISOString(),
        };
    }
};

// Mock external services check
const checkExternalServices = async () => {
    try {
        return {
            redis: {
                status: 'not-configured',
                message: 'Redis cache not configured',
            },
            cache: {
                status: 'not-configured',
                message: 'External cache service not configured',
            }
        };
    } catch (error) {
        return {
            redis: {
                status: 'error',
                message: error?.message || 'Redis check failed',
            },
            cache: {
                status: 'error',
                message: error?.message || 'Cache check failed',
            }
        };
    }
};

// Add OS import at the top of your file



export const handleGetCommision = async (req, res, next) => {
    try {
        const commision = await Commision.findOne()

        if (!commision) {
            return res.status(200).json({
                message: "No commision found",
                error: false,
                success: true
            })
        }

        return res.status(200).json({
            message : "These are commision details",
            error : false,
            success : true,
            commision
        })
    } catch (error) {
        next(error)
    }
}