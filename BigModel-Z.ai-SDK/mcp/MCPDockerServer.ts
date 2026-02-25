// ============================================================
// BigModel-Z.ai SDK - MCP Docker 服务器
// Docker 容器管理功能封装
// ============================================================

import { MCPClient, MCPServerConfig } from './MCPClient';

export interface DockerConfig {
  dockerHost?: string,
}

export interface ContainerInfo {
  id: string,
  name: string,
  image: string,
  status: string,
  ports: string[],
}

export class MCPDockerServer extends MCPClient {
  constructor(dockerHost = 'unix:///var/run/docker.sock') {
    const config: MCPServerConfig = {
      command: 'docker',
      args: [
        'run',
        '-i',
        '--rm',
        '-v',
        '/var/run/docker.sock:/var/run/docker.sock',
        'modelcontextprotocol/server-docker',
      ],
      env: {
        DOCKER_HOST: dockerHost,
      },
    };

    super(config);
  }

  async listContainers(all = false): Promise<ContainerInfo[]> {
    const response = await this.callTool('list_containers', { all });

    return response.content?.[0]?.containers || [];
  }

  async getContainerInfo(containerId: string): Promise<ContainerInfo> {
    const response = await this.callTool('get_container_info', { container_id: containerId });

    return response.content?.[0];
  }

  async startContainer(containerId: string): Promise<void> {
    await this.callTool('start_container', { container_id: containerId });
  }

  async stopContainer(containerId: string): Promise<void> {
    await this.callTool('stop_container', { container_id: containerId });
  }

  async restartContainer(containerId: string): Promise<void> {
    await this.callTool('restart_container', { container_id: containerId });
  }

  async removeContainer(containerId: string): Promise<void> {
    await this.callTool('remove_container', { container_id: containerId });
  }

  async listImages(): Promise<any[]> {
    const response = await this.callTool('list_images', {});

    return response.content?.[0]?.images || [];
  }

  async pullImage(imageName: string): Promise<void> {
    await this.callTool('pull_image', { image_name: imageName });
  }

  async getDockerHost(): string {
    const config = this.getConfig();

    return config.env?.DOCKER_HOST || '';
  }
}

export default MCPDockerServer;
