// ============================================================
// BigModel-Z.ai SDK - MCP PostgreSQL 服务器
// ============================================================

import { MCPClient } from './MCPClient';

export interface PostgreSQLConfig {
  connectionString: string;
}

export class MCPPostgreSQLServer extends MCPClient {
  constructor(config: PostgreSQLConfig) {
    super({
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres', config.connectionString],
    });
  }

  async getConnectionString(): Promise<string> {
    return 'configured';
  }
}

export default MCPPostgreSQLServer;
