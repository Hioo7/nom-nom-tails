import { DEFAULT_PORT } from './constants';

type NodeEnv = 'development' | 'production' | 'test';

class AppConfig {
  private static instance: AppConfig;

  readonly databaseUrl: string;
  readonly port: number;
  readonly nodeEnv: NodeEnv;
  readonly jwtSecret: string;
  readonly superAdminEmail: string;
  readonly superAdminPassword: string;
  readonly superAdminName: string;
  readonly corsOrigins: string[];
  readonly minioEndpoint: string;
  readonly minioPort: number;
  readonly minioUseSsl: boolean;
  readonly minioAccessKey: string;
  readonly minioSecretKey: string;
  readonly imageBaseUrl: string;

  private constructor() {
    this.databaseUrl = this.require('DATABASE_URL');
    this.jwtSecret = this.require('JWT_SECRET');
    this.superAdminEmail = this.require('SUPER_ADMIN_EMAIL');
    this.superAdminPassword = this.require('SUPER_ADMIN_PASSWORD');
    this.superAdminName = this.require('SUPER_ADMIN_NAME');
    this.corsOrigins = this.require('CORS_ORIGINS')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
    this.port = parseInt(process.env['PORT'] ?? String(DEFAULT_PORT), 10);
    this.nodeEnv = this.parseNodeEnv(process.env['NODE_ENV']);
    this.minioEndpoint = this.require('MINIO_ENDPOINT');
    this.minioPort = parseInt(this.require('MINIO_PORT'), 10);
    this.minioUseSsl = this.parseBoolean('MINIO_USE_SSL', false);
    this.minioAccessKey = this.require('MINIO_ACCESS_KEY');
    this.minioSecretKey = this.require('MINIO_SECRET_KEY');
    this.imageBaseUrl = this.require('IMAGE_BASE_URL');
  }

  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  private parseBoolean(key: string, defaultValue: boolean): boolean {
    const val = process.env[key];
    if (val === undefined) return defaultValue;
    return val.toLowerCase() === 'true';
  }

  private require(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  private parseNodeEnv(value: string | undefined): NodeEnv {
    if (value === 'production' || value === 'test') return value;
    return 'development';
  }
}

export default AppConfig;
