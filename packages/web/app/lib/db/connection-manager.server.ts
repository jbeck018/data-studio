import { db } from './db.server';
import { eq } from 'drizzle-orm';
import { connections } from './schema/connections';
import { permissionsManager } from './permissions-manager.server';
import { createConnection, BaseConnection } from './connection-handlers.server';
import type { DatabaseType } from './schema';
import type { StandardConnectionConfig, MongoDBConnectionConfig, RedisConnectionConfig, SQLiteConnectionConfig } from './schema/connections';

type ConnectionConfig = StandardConnectionConfig | MongoDBConnectionConfig | RedisConnectionConfig | SQLiteConnectionConfig;

interface PooledConnection {
  connection: BaseConnection;
  type: DatabaseType;
  lastUsed: number;
  inUse: boolean;
  createdAt: number;
  usageCount: number;
  healthChecks: {
    lastCheck: number;
    status: 'healthy' | 'unhealthy';
    errorCount: number;
  };
  userId: string;
  organizationId: string;
  queryTimes: number[];
}

interface PoolConfig {
  maxConnections: number;
  minConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
  healthCheckInterval: number;
  maxErrorCount: number;
}

export interface ConnectionStats {
  healthy: boolean;
  activeConnections: number;
  averageQueryTime: number | null;
  errorCount: number;
  lastHealthCheck: Date;
}

class ConnectionManager {
  private static instance: ConnectionManager;
  private connections: Map<string, PooledConnection>;
  private poolConfig: PoolConfig;
  private maintenanceInterval: NodeJS.Timeout | null = null;
  private activeConnections: Map<string, string> = new Map(); // organizationId -> connectionId

  private constructor() {
    this.connections = new Map();
    this.poolConfig = {
      maxConnections: 10,
      minConnections: 1,
      connectionTimeout: 30000,
      idleTimeout: 300000,
      healthCheckInterval: 60000,
      maxErrorCount: 3,
    };
    this.startMaintenanceLoop();
  }

  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  private startMaintenanceLoop(): void {
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
    }
    this.maintenanceInterval = setInterval(() => {
      this.performMaintenance().catch(console.error);
    }, this.poolConfig.healthCheckInterval);
  }

  private async performMaintenance(): Promise<void> {
    const now = Date.now();
    for (const [connectionId, connection] of this.connections.entries()) {
      // Check if connection is idle for too long
      if (!connection.inUse && (now - connection.lastUsed) > this.poolConfig.idleTimeout) {
        await this.closeConnection(connectionId);
        continue;
      }

      // Perform health check
      if ((now - connection.healthChecks.lastCheck) > this.poolConfig.healthCheckInterval) {
        try {
          const isHealthy = await this.checkConnectionHealth(connection.connection);
          connection.healthChecks.status = isHealthy ? 'healthy' : 'unhealthy';
          connection.healthChecks.lastCheck = now;
          if (!isHealthy) {
            connection.healthChecks.errorCount++;
            if (connection.healthChecks.errorCount >= this.poolConfig.maxErrorCount) {
              await this.closeConnection(connectionId);
            }
          } else {
            connection.healthChecks.errorCount = 0;
          }
        } catch (error) {
          console.error(`Health check failed for connection ${connectionId}:`, error);
          connection.healthChecks.errorCount++;
          if (connection.healthChecks.errorCount >= this.poolConfig.maxErrorCount) {
            await this.closeConnection(connectionId);
          }
        }
      }
    }
  }

  private async checkConnectionHealth(connection: BaseConnection): Promise<boolean> {
    try {
      await connection.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  private async closeConnection(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (connection) {
      try {
        await connection.connection.end();
      } catch (error) {
        console.error(`Error closing connection ${connectionId}:`, error);
      }
      this.connections.delete(connectionId);
    }
  }

  public async getConnection(connectionId: string, organizationId: string): Promise<BaseConnection> {
    // Check permissions
    const hasAccess = await permissionsManager.checkConnectionAccess(connectionId, organizationId);
    if (!hasAccess) {
      throw new Error('Access denied to connection');
    }

    // Check if connection exists in pool
    let pooledConnection = this.connections.get(connectionId);
    if (pooledConnection && pooledConnection.healthChecks.status === 'healthy') {
      pooledConnection.lastUsed = Date.now();
      pooledConnection.inUse = true;
      return pooledConnection.connection;
    }

    // Create new connection
    const dbConnection = await db.select().from(connections).where(eq(connections.id, connectionId)).limit(1);
    if (!dbConnection.length) {
      throw new Error('Connection not found');
    }

    const config = dbConnection[0];
    const connection = await createConnection(config as ConnectionConfig);
    
    pooledConnection = {
      connection,
      type: config.type as DatabaseType,
      lastUsed: Date.now(),
      inUse: true,
      createdAt: Date.now(),
      usageCount: 0,
      healthChecks: {
        lastCheck: Date.now(),
        status: 'healthy',
        errorCount: 0,
      },
      userId: config.userId,
      organizationId,
      queryTimes: [],
    };

    this.connections.set(connectionId, pooledConnection);
    return connection;
  }

  public async setActiveConnection(connectionId: string, organizationId: string): Promise<void> {
    const hasAccess = await permissionsManager.checkConnectionAccess(connectionId, organizationId);
    if (!hasAccess) {
      throw new Error('Access denied to connection');
    }
    this.activeConnections.set(organizationId, connectionId);
  }

  public async getActiveConnection(organizationId: string): Promise<string | null> {
    return this.activeConnections.get(organizationId) || null;
  }

  public getConnectionStats(connectionId: string): ConnectionStats | null {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return null;
    }

    const averageQueryTime = connection.queryTimes.length > 0
      ? connection.queryTimes.reduce((a, b) => a + b, 0) / connection.queryTimes.length
      : null;

    return {
      healthy: connection.healthChecks.status === 'healthy',
      activeConnections: Array.from(this.connections.values()).filter(c => c.inUse).length,
      averageQueryTime,
      errorCount: connection.healthChecks.errorCount,
      lastHealthCheck: new Date(connection.healthChecks.lastCheck),
    };
  }
}

export const connectionManager = ConnectionManager.getInstance();
