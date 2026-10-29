import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/routecraft',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'routecraft-dev-jwt-secret-key-32-chars-long-minimum',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecret: process.env.COOKIE_SECRET || 'routecraft-dev-cookie-secret',
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  weatherApiKey: process.env.WEATHER_API_KEY || process.env.OPENWEATHERMAP_API_KEY || '',
  isProduction: process.env.NODE_ENV === 'production'
};
