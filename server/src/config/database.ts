/**
 * server/src/config/database.ts
 *
 * Production-ready Singleton MongoDB Connection Manager.
 * Encapsulates lifecycle events, connection pooling, graceful shutdown,
 * and eliminates duplicate connection attempts across hot-reloading & testing.
 */

import mongoose, { ConnectOptions } from 'mongoose';
import env from './env';

export interface DatabaseStats {
  state: 'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'uninitialized';
  host?: string;
  name?: string;
  port?: number;
  modelsCount: number;
}

export class Database {
  private static instance: Database | null = null;
  private isConnecting: boolean = false;
  private isShuttingDown: boolean = false;

  private constructor() {
    this.setupListeners();
    this.setupProcessHandlers();
  }

  /**
   * Retrieves the singleton Database instance.
   */
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * Configures Mongoose connection event listeners.
   */
  private setupListeners(): void {
    mongoose.connection.on('connected', () => {
      console.log(`[Database] MongoDB connected successfully to ${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('[Database] MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      if (!this.isShuttingDown) {
        console.warn('[Database] MongoDB disconnected. Waiting for reconnect...');
      }
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[Database] MongoDB reconnected successfully.');
    });
  }

  /**
   * Registers graceful termination handlers for process signals.
   */
  private setupProcessHandlers(): void {
    const handleTermination = async (signal: string) => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      console.log(`[Database] ${signal} signal received: closing MongoDB connection...`);
      try {
        await this.disconnect();
        console.log('[Database] MongoDB connection closed safely.');
      } catch (err) {
        console.error('[Database] Error closing MongoDB connection during shutdown:', err);
      }
    };

    process.once('SIGINT', () => handleTermination('SIGINT'));
    process.once('SIGTERM', () => handleTermination('SIGTERM'));
  }

  /**
   * Connects to MongoDB with connection pooling and timeouts.
   * Safe to call multiple times — returns existing connection if already active.
   */
  public async connect(uri: string = env.MONGODB_URI): Promise<typeof mongoose> {
    // 1: connected, 2: connecting
    if (mongoose.connection.readyState === 1) {
      return mongoose;
    }

    if (this.isConnecting || mongoose.connection.readyState === 2) {
      console.log('[Database] MongoDB connection in progress, awaiting resolution...');
      await new Promise<void>((resolve) => {
        mongoose.connection.once('connected', () => resolve());
      });
      return mongoose;
    }

    this.isConnecting = true;

    const options: ConnectOptions = {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
    };

    try {
      const conn = await mongoose.connect(uri, options);
      this.isConnecting = false;
      return conn;
    } catch (err) {
      this.isConnecting = false;
      console.error('[Database] Failed to establish MongoDB connection:', err);
      throw err;
    }
  }

  /**
   * Safely closes the MongoDB connection.
   */
  public async disconnect(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }

  /**
   * Checks whether the database connection is currently active.
   */
  public isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Returns current connection metadata and health stats.
   */
  public getStats(): DatabaseStats {
    const states: Record<number, DatabaseStats['state']> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const readyState = mongoose.connection.readyState;
    return {
      state: states[readyState] || 'uninitialized',
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      port: mongoose.connection.port,
      modelsCount: Object.keys(mongoose.connection.models).length,
    };
  }

  /**
   * Direct access to Mongoose Connection object.
   */
  public get connection(): mongoose.Connection {
    return mongoose.connection;
  }
}

// Export singleton instance as default
export const db = Database.getInstance();
export default db;
