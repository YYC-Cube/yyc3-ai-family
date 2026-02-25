// ============================================================
// BigModel-Z.ai SDK - MCP PostgreSQL 服务器
// PostgreSQL 数据库访问功能封装
// ============================================================

import { MCPClient, MCPServerConfig } from './MCPClient';

export interface PostgreSQLConfig {
  connectionString: string,
}

export class MCPPostgreSQLServer extends MCPClient {
  constructor(connectionString: string) {
    const config: MCPServerConfig = {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres', connectionString],
    };

    super(config);
  }

  async executeQuery(query: string): Promise<any[]> {
    const response = await this.callTool('execute_query', { query });

    return response.content?.[0]?.rows || [];
  }

  async listTables(): Promise<string[]> {
    const response = await this.callTool('list_tables', {});

    return response.content?.[0]?.tables || [];
  }

  async describeTable(tableName: string): Promise<any> {
    const response = await this.callTool('describe_table', { table_name: tableName });

    return response.content?.[0];
  }

  async getTableSchema(tableName: string): Promise<any> {
    const response = await this.callTool('get_table_schema', { table_name: tableName });

    return response.content?.[0];
  }

  async listDatabases(): Promise<string[]> {
    const response = await this.callTool('list_databases', {});

    return response.content?.[0]?.databases || [];
  }

  async getDatabaseInfo(): Promise<any> {
    const response = await this.callTool('get_database_info', {});

    return response.content?.[0];
  }

  async createTable(tableName: string, columns: any[]): Promise<void> {
    await this.callTool('create_table', { table_name: tableName, columns });
  }

  async insertData(tableName: string, data: Record<string, any>): Promise<void> {
    await this.callTool('insert_data', { table_name: tableName, data });
  }

  async updateData(
    tableName: string,
    where: Record<string, any>,
    data: Record<string, any>,
  ): Promise<void> {
    await this.callTool('update_data', { table_name: tableName, where, data });
  }

  async deleteData(tableName: string, where: Record<string, any>): Promise<void> {
    await this.callTool('delete_data', { table_name: tableName, where });
  }

  async getConnectionString(): Promise<string> {
    const config = this.getConfig();

    return config.args?.[2] || '';
  }
}

export default MCPPostgreSQLServer;
