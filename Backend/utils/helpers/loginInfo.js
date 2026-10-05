import deviceDetector from 'device-detector-js';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';

const deviceDetectorInstance = new deviceDetector();
const uaParser = new UAParser();

export const getDeviceInfo = (req) => {
    const userAgent = req.headers['user-agent'] || '';

    console.log('Raw User Agent:', userAgent); // Add this for debugging

    // Get IP address
    let ip = req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'] ||
        req.ip ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        '::1';

    if (ip && ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }

    // Parse with both libraries
    const deviceInfo = deviceDetectorInstance.parse(userAgent);
    uaParser.setUA(userAgent);
    const uaResult = uaParser.getResult();

    console.log('Device Detector Result:', deviceInfo); // Debug
    console.log('UA Parser Result:', uaResult); // Debug

    // Get location (null for localhost)
    let location = { country: null, city: null, region: null };

    // Enhanced manual detection for Windows
    let osName = deviceInfo.os?.name || uaResult.os.name || 'unknown';
    let osVersion = deviceInfo.os?.version || uaResult.os.version || 'unknown';
    let platform = deviceInfo.os?.platform || 'unknown';

    // Manually detect Windows from user agent
    if (userAgent.includes('Windows NT')) {
        osName = 'Windows';
        platform = 'Windows';

        // Extract Windows version
        const winMatch = userAgent.match(/Windows NT (\d+\.\d+)/);
        if (winMatch) {
            const version = winMatch[1];
            switch (version) {
                case '10.0': osVersion = '10 or 11'; break;
                case '6.3': osVersion = '8.1'; break;
                case '6.2': osVersion = '8'; break;
                case '6.1': osVersion = '7'; break;
                case '6.0': osVersion = 'Vista'; break;
                case '5.1': osVersion = 'XP'; break;
                case '5.0': osVersion = '2000'; break;
                default: osVersion = version;
            }
        }
    }

    // Detect device type
    let deviceType = 'desktop';
    let brand = 'unknown';
    let model = 'unknown';

    // Check for Windows device
    if (userAgent.includes('Windows NT')) {
        deviceType = 'desktop';
        brand = 'PC';
        model = 'Windows PC';
    }
    // Check for mobile devices
    else if (userAgent.includes('Android')) {
        deviceType = 'smartphone';
        const androidMatch = userAgent.match(/Android.*;(.*?)(?:Build|\))/);
        if (androidMatch) {
            model = androidMatch[1].trim();
        }
    }
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        deviceType = userAgent.includes('iPad') ? 'tablet' : 'smartphone';
        brand = 'Apple';
        const iosMatch = userAgent.match(/iPhone|iPad/);
        model = iosMatch ? iosMatch[0] : 'iOS Device';
    }

    // Browser detection
    let browserName = 'unknown';
    let browserVersion = 'unknown';

    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browserName = 'Chrome';
        const chromeMatch = userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
        if (chromeMatch) browserVersion = chromeMatch[1];
    }
    else if (userAgent.includes('Firefox')) {
        browserName = 'Firefox';
        const firefoxMatch = userAgent.match(/Firefox\/(\d+\.\d+)/);
        if (firefoxMatch) browserVersion = firefoxMatch[1];
    }
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browserName = 'Safari';
        const safariMatch = userAgent.match(/Version\/(\d+\.\d+(?:\.\d+)?)/);
        if (safariMatch) browserVersion = safariMatch[1];
    }
    else if (userAgent.includes('Edg')) {
        browserName = 'Edge';
        const edgeMatch = userAgent.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/);
        if (edgeMatch) browserVersion = edgeMatch[1];
    }

    // Determine if mobile/desktop
    const isMobile = userAgent.includes('Mobile') ||
        userAgent.includes('Android') ||
        userAgent.includes('iPhone') ||
        deviceType === 'smartphone' ||
        deviceType === 'tablet';

    const isDesktop = !isMobile && (userAgent.includes('Windows NT') ||
        userAgent.includes('Macintosh') ||
        userAgent.includes('X11'));

    return {
        device: {
            type: deviceType,
            brand: brand,
            model: model,
            isMobile: isMobile,
            isDesktop: isDesktop,
            isTablet: deviceType === 'tablet',
        },
        os: {
            name: osName,
            version: osVersion,
            platform: platform,
            fullName: `${osName} ${osVersion}`,
        },
        client: {
            type: 'browser',
            name: browserName,
            version: browserVersion,
            engine: 'Blink', // Chrome uses Blink engine
            engineVersion: 'unknown',
        },
        browser: {
            name: browserName,
            version: browserVersion,
            fullName: `${browserName} ${browserVersion}`,
            engine: 'Blink',
        },
        ipAddress: ip,
        userAgent: userAgent,
        timestamp: new Date(),
        location: location,
        userAgentInfo: {
            raw: userAgent,
            isBot: userAgent.includes('bot') || userAgent.includes('crawler') || userAgent.includes('spider'),
            isCrawler: false,
            language: req.headers['accept-language'] || 'en-US',
        },
        rawDetection: {
            deviceDetector: deviceInfo,
            uaParser: uaResult,
            hasWindows: userAgent.includes('Windows NT'),
            hasChrome: userAgent.includes('Chrome'),
            userAgentString: userAgent,
        }
    };
};

export const generateLoginActivity = (deviceInfo, user) => {
    const sessionId = `${user._id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
        userId: user._id,
        deviceInfo: deviceInfo,
        loginTime: new Date(),
        status: 'success',
        sessionId: sessionId,
        isCurrentSession: true,
        userAgent: deviceInfo.userAgent,
        ipAddress: deviceInfo.ipAddress,
        location: deviceInfo.location,
        deviceFingerprint: {
            browser: deviceInfo.browser.fullName,
            os: deviceInfo.os.fullName,
            device: `${deviceInfo.device.brand} ${deviceInfo.device.model}`,
            platform: deviceInfo.os.platform,
        }
    };
};

export const getReadableDeviceInfo = (deviceInfo) => {
    let deviceName = deviceInfo.device.model;
    if (deviceInfo.device.brand !== 'unknown') {
        deviceName = `${deviceInfo.device.brand} ${deviceInfo.device.model}`;
    } else if (deviceInfo.device.isMobile) {
        deviceName = 'Mobile Device';
    } else {
        deviceName = 'Desktop Computer';
    }

    return {
        device: deviceName,
        os: `${deviceInfo.os.name} ${deviceInfo.os.version}`,
        browser: `${deviceInfo.browser.name} ${deviceInfo.browser.version}`,
        location: 'Localhost (Development)',
        ip: deviceInfo.ipAddress,
        lastActive: deviceInfo.timestamp,
        isCurrent: true,
        detectedFrom: deviceInfo.rawDetection?.hasWindows ? 'Windows detected' : 'Unknown OS',
    };
};