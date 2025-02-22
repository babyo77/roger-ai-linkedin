import { RequestHandler } from "express";
import redisClient from "../redis";

interface CacheConfig {
  [key: string]: number; // path: duration in seconds
}

const DEFAULT_CACHE_DURATION = 3600; // 1 hour default
const CACHE_CONFIG: CacheConfig = {
  "/api/connections": 3600, // 1 hour
  "/api/me": 3600, // 1 hour
  "/api/send-connection": 3600, // 1 hour
  "/api/send-message": 3600, // 1 hour
};

// Routes that should never be cached
const NO_CACHE_ROUTES = [""];

export const autoCacheMiddleware = (): RequestHandler => {
  return async (req, res, next) => {
    const path = req.path;

    const token = req.headers["li_at"] || req.query.token;
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
    }

    const queryString = Object.keys(req.query)
      .sort() // Sort keys for consistent cache keys
      .filter((key) => key !== "token") // Exclude token from cache key
      .map((key) => `${key}=${req.query[key]}`)
      .join("&");

    const cacheKey = queryString
      ? `${path}:${token}:${queryString}`
      : `${path}:${token}`;

    // Skip caching for specified routes or non-GET requests
    if (NO_CACHE_ROUTES.includes(path) || req.method !== "GET") {
      next();
      return;
    }

    try {
      // Check cache with query parameters
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        res.status(200).json(JSON.parse(cachedData));
        return;
      }

      // Store original status and json methods
      const originalStatus = res.status;
      const originalJson = res.json;

      // Override status method to track response status code
      let currentStatus = 200;
      res.status = function (code: number) {
        currentStatus = code;
        return originalStatus.call(this, code);
      };

      // Override json method to cache only 200 responses
      res.json = function (data) {
        if (currentStatus === 200) {
          redisClient
            .setEx(
              cacheKey,
              CACHE_CONFIG[path] || DEFAULT_CACHE_DURATION,
              JSON.stringify(data)
            )
            .catch((err) => console.error("Cache write error:", err));
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Cache error:", error);
      next();
    }
  };
};
