import mongoose from "mongoose";
import os from "os";

/* -------- CPU USAGE (WORKS ON WINDOWS) -------- */
const getCpuUsage = () => {
  const cpus = os.cpus();
  if (!cpus || cpus.length === 0) return "Unavailable";

  let idle = 0;
  let total = 0;

  cpus.forEach((core) => {
    for (let type in core.times) {
      total += core.times[type];
    }
    idle += core.times.idle;
  });

  return `${Math.max(1, 100 - Math.round((idle / total) * 100))}%`;
};

export const getPlatformHealth = async (req, res) => {
  const start = process.hrtime();

  try {
    /* ---------------- UPTIME ---------------- */
    const uptimeSeconds = Math.floor(process.uptime());
    const uptime =
      uptimeSeconds < 60
        ? `${uptimeSeconds} sec`
        : `${Math.floor(uptimeSeconds / 60)} mins`;

    /* ---------------- MEMORY ---------------- */
    const nodeMem = process.memoryUsage();

    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    const systemMemoryAvailable =
      totalMem && freeMem && totalMem > 0;

    /* ---------------- DATABASE ---------------- */
    let dbStatus = "DOWN";
    let dbLatency = null;

    if (mongoose.connection.readyState === 1) {
      const dbStart = process.hrtime();
      await mongoose.connection.db.command({ ping: 1 });
      const diff = process.hrtime(dbStart);
      dbLatency = `${(diff[1] / 1e6).toFixed(2)} ms`;
      dbStatus = "UP";
    }

    /* ---------------- RESPONSE TIME ---------------- */
    const diff = process.hrtime(start);
    const responseTime = `${(diff[1] / 1e6).toFixed(2)} ms`;

    /* ---------------- STATUS ---------------- */
    const status = dbStatus === "UP" ? "HEALTHY" : "DEGRADED";

    return res.status(200).json({
      success: true,
      status,
      timestamp: new Date(),

      server: {
        hostname: os.hostname(),
        environment: process.env.NODE_ENV || "production",
        platform: os.platform(),
        uptime,
        cpuCores: os.cpus()?.length || "Unavailable",
        cpuUsage: getCpuUsage(),
      },

      memory: {
        node: {
          heapUsedMB: (nodeMem.heapUsed / 1024 / 1024).toFixed(2),
          heapTotalMB: (nodeMem.heapTotal / 1024 / 1024).toFixed(2),
        },
        system: systemMemoryAvailable
          ? {
              totalMB: (totalMem / 1024 / 1024).toFixed(2),
              freeMB: (freeMem / 1024 / 1024).toFixed(2),
            }
          : "Unavailable (container / OS restricted)",
      },

      database: {
        type: "MongoDB",
        status: dbStatus,
        latency: dbLatency,
      },

      api: {
        responseTime,
      },

      services: {
        webServer: "UP",
        apiGateway: "UP",
        database: dbStatus,
        cacheService: "NOT CONFIGURED",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: "DOWN",
      message: "Platform health check failed",
      error: error.message,
    });
  }
};
