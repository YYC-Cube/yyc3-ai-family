/**
 * YYC³ Family-π³ E2E Page Object Model
 * 页面对象模型 - 用于 E2E 测试
 */

import { type Locator, type Page, expect } from '@playwright/test';

/**
 * 主页页面对象
 */
export class HomePage {
  readonly page: Page;
  readonly chatInput: Locator;
  readonly sendButton: Locator;
  readonly messageList: Locator;
  readonly sidebar: Locator;
  readonly settingsButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.chatInput = page.getByPlaceholder(/输入消息|Enter message/i);
    this.sendButton = page.getByRole('button', { name: /发送|Send/i });
    this.messageList = page.getByTestId('message-list');
    this.sidebar = page.getByTestId('sidebar');
    this.settingsButton = page.getByRole('button', { name: /设置|Settings/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async sendMessage(message: string) {
    await this.chatInput.fill(message);
    await this.sendButton.click();
  }

  async waitForMessage(content: string) {
    const message = this.page.getByText(content);
    await expect(message).toBeVisible();
    return message;
  }

  async openSettings() {
    await this.settingsButton.click();
  }
}

/**
 * 控制台页面对象
 */
export class ConsolePage {
  readonly page: Page;
  readonly dashboardTab: Locator;
  readonly aiTab: Locator;
  readonly devopsTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboardTab = page.getByRole('tab', { name: /总控|Dashboard/i });
    this.aiTab = page.getByRole('tab', { name: /AI|智能体/i });
    this.devopsTab = page.getByRole('tab', { name: /DevOps/i });
  }

  async goto() {
    await this.page.goto('/');
    // 导航到控制台视图
    await this.page.getByRole('button', { name: /控制台|Console/i }).click();
  }

  async switchToDashboard() {
    await this.dashboardTab.click();
  }

  async switchToAI() {
    await this.aiTab.click();
  }

  async switchToDevOps() {
    await this.devopsTab.click();
  }
}

/**
 * 设置页面对象
 */
export class SettingsPage {
  readonly page: Page;
  readonly generalTab: Locator;
  readonly modelsTab: Locator;
  readonly appearanceTab: Locator;
  readonly saveButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.generalTab = page.getByRole('tab', { name: /常规|General/i });
    this.modelsTab = page.getByRole('tab', { name: /模型 |Models/i });
    this.appearanceTab = page.getByRole('tab', { name: /外观|Appearance/i });
    this.saveButton = page.getByRole('button', { name: /保存|Save/i });
    this.closeButton = page.getByRole('button', { name: /关闭|Close/i });
  }

  async goto() {
    await this.page.goto('/?tab=settings');
  }

  async switchToModels() {
    await this.modelsTab.click();
  }

  async switchToAppearance() {
    await this.appearanceTab.click();
  }

  async save() {
    await this.saveButton.click();
  }

  async close() {
    await this.closeButton.click();
  }
}

/**
 * Agent 聊天页面对象
 */
export class AgentChatPage {
  readonly page: Page;
  readonly agentList: Locator;
  readonly navigatorButton: Locator;
  readonly thinkerButton: Locator;
  readonly prophetButton: Locator;
  readonly sentinelButton: Locator;
  readonly grandmasterButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.agentList = page.getByTestId('agent-list');
    this.navigatorButton = page.getByRole('button', { name: /领航员|Navigator/i });
    this.thinkerButton = page.getByRole('button', { name: /思想家|Thinker/i });
    this.prophetButton = page.getByRole('button', { name: /先知|Prophet/i });
    this.sentinelButton = page.getByRole('button', { name: /哨兵|Sentinel/i });
    this.grandmasterButton = page.getByRole('button', { name: /宗师|Grandmaster/i });
  }

  async goto() {
    await this.page.goto('/?tab=ai');
  }

  async selectAgent(agentName: string) {
    const agentButton = this.page.getByRole('button', { 
      name: new RegExp(agentName, 'i') 
    });
    await agentButton.click();
  }

  async selectNavigator() {
    await this.navigatorButton.click();
  }

  async selectThinker() {
    await this.thinkerButton.click();
  }
}

/**
 * 集群监控页面对象
 */
export class ClusterMonitorPage {
  readonly page: Page;
  readonly clusterTopology: Locator;
  readonly nodeCards: Locator;
  readonly metricsChart: Locator;

  constructor(page: Page) {
    this.page = page;
    this.clusterTopology = page.getByTestId('cluster-topology');
    this.nodeCards = page.getByTestId('node-cards');
    this.metricsChart = page.getByTestId('metrics-chart');
  }

  async goto() {
    await this.page.goto('/?tab=dashboard');
  }

  async getNodeStatus(nodeName: string) {
    const node = this.page.getByTestId(`node-${nodeName}`);
    return node;
  }

  async waitForMetrics() {
    await expect(this.metricsChart).toBeVisible();
  }
}
