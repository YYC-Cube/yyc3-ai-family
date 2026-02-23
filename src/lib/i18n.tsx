import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  zh: {
    // Sidebar
    'sidebar.new_session': '新建会话',
    'sidebar.terminal': '终端控制',
    'sidebar.console': '系统控制台',
    'sidebar.monitor': '网络监控',
    'sidebar.projects': '项目目录',
    'sidebar.artifacts': '工件日志',
    'sidebar.favorites': '收藏夹',
    'sidebar.history': '历史记录',
    'sidebar.today': '今天',
    'sidebar.yesterday': '昨天',
    'sidebar.archive': '归档',
    'sidebar.status_online': '在线',
    'sidebar.deploy_scripts': '部署脚本',
    'sidebar.api_docs': 'API 文档',
    'sidebar.settings': '系统设置',
    'sidebar.gitops': 'Git 版本管理',

    // New Navigation
    'sidebar.services': '常用服务',
    'sidebar.knowledge': '知识库',
    'sidebar.bookmarks': '项目管理',

    // Settings - Appearance
    'settings.tab.appearance': '外观主题',
    'settings.tab.agents': '智能体卡片',
    'settings.accent_color': '主题色',
    'settings.opacity': '面板透明度',
    'settings.bg_blur': '背景模糊',
    'settings.scanline': '扫描线效果',
    'settings.glow': '发光效果',
    'settings.theme_preview': '主题预览',
    'settings.background': '背景设置',
    'settings.bg_color': '背景颜色',
    'settings.bg_image': '背景图片',
    'settings.bg_image_upload': '上传背景图',
    'settings.bg_image_clear': '清除背景',
    'settings.bg_brightness': '背景亮度',
    'settings.bg_blur_amount': '背景模糊度',
    'settings.shadow_intensity': '边线阴影强度',
    'settings.overlay_opacity': '二级页面透明度',
    'settings.overlay_opacity_desc': '设置弹窗、浮层、二级面板的背景透明度',
    'settings.font_family': '字体选择',
    'settings.font_family_desc': '选择界面正文字体（支持本地字体检测）',
    'settings.mono_font': '等宽字体',
    'settings.mono_font_desc': '终端、代码区域字体',
    'settings.font_size': '全局字号',
    'settings.font_size_desc': '调整界面整体字号大小',
    'settings.detect_fonts': '检测本地字体',
    'settings.font_count': '已检测到 {count} 个字体',
    'settings.agent_name': '智能体名称',
    'settings.agent_role': '智能体角色',
    'settings.agent_desc': '智能体描述',
    'settings.agent_status': '智能体状态',

    // Services
    'services.title': '常用服务',
    'services.add': '添加服务',
    'services.category': '分类',
    'services.url': '服务地址',
    'services.open': '打开',

    // Knowledge Base
    'kb.title': '智能知识库',
    'kb.search': '搜索文档...',
    'kb.add_doc': '添加文档',
    'kb.categories': '文档分类',
    'kb.total_docs': '文档总数',
    'kb.recent': '最近编辑',
    'kb.export': '导出JSON',
    'kb.import': '导入JSON',
    'kb.import_success': '导入成功',
    'kb.import_fail': '导入失败',
    'kb.import_merged': '条合并',
    'kb.import_added': '条新增',
    'kb.ai_summary': 'AI摘要',
    'kb.ai_generating': '生成中...',
    'kb.ai_no_provider': '未配置LLM供应商',
    'kb.fuzzy_match': '模糊匹配',
    'kb.score': '匹配度',
    'kb.no_results': '未找到匹配结果',
    'kb.search_hint': '支持模糊搜索，多词用空格分隔',

    // Bookmarks
    'bookmarks.title': '项目管理',
    'bookmarks.add': '添加项目',
    'bookmarks.category': '项目分类',
    'bookmarks.visit': '访问',

    // Chat
    'chat.placeholder': '输入指令或自然语言查询...',
    'chat.placeholder_ai': '向 AI 提问任何问题...',
    'chat.search_placeholder': '搜索全局上下文 (Ctrl+K)...',
    'chat.artifacts': '工件面板',
    'chat.web_search': '联网搜索',
    'chat.execute': '执行',
    'chat.busy': '处理中',
    'chat.system_ready': '系统就绪',
    'chat.latency': '延迟',
    'chat.welcome_title': 'YYC3_OS 就绪',
    'chat.welcome_subtitle': '初始化完成。等待指令。',
    'chat.quick_action_1': '构建 React 组件',
    'chat.quick_action_2': '部署微服务',
    'chat.quick_action_3': '扫描安全漏洞',
    'chat.mode_navigate': '导航模式',
    'chat.mode_ai': 'AI 对话',
    'chat.mode_navigate_desc': '关键词驱动界面跳转',
    'chat.mode_ai_desc': '接入 LLM 实时对话',
    'chat.no_provider': '尚未配置 AI 模型。请前往 设置 → AI 模型 配置 API Key。',
    'chat.ai_thinking': '正在思考...',
    'chat.ai_error': 'AI 请求失败，已降级为模板响应。',
    'chat.navigate_to': '已导航至: {target}',
    'chat.navigate_unknown': '未识别导航意图。输入关键词如"仪表盘"、"项目"、"设置"等。',

    // Agents
    'agent.architect': '架构师',
    'agent.coder': '工程师',
    'agent.auditor': '审计员',
    'agent.orchestrator': '协调者',
    'agent.user': '开发者',

    // Settings
    'settings.title': '系统配置',
    'settings.desc': '配置系统参数、AI模型、GitOps及扩展',
    'settings.tab.general': '通用设置',
    'settings.tab.models': 'AI 模型',
    'settings.tab.gitops': 'GitOps',
    'settings.tab.extensions': '扩展插件',
    'settings.tab.security': '安全策略',
    'settings.workspace_name': '工作区名称',
    'settings.dev_mode': '开发者模式',
    'settings.dev_mode_desc': '启用实验性功能和调试日志',
    'settings.auto_save': '自动保存工件',
    'settings.auto_save_desc': '自动将生成的代码持久化到本地存储',
    'settings.inference': '推理参数',
    'settings.temp': '随机性 (Temperature)',
    'settings.tokens': '最大令牌数',
    'settings.marketplace_offline': '应用市场离线',
    'settings.scanning_enabled': '实时扫描已启用',
    'settings.language': '界面语言',

    // Search
    'search.title': '全局上下文搜索',
    'search.no_results': '未找到结果',
    'search.navigate': '导航',
    'search.select': '选择',
    'search.files': '文件',
    'search.code': '代码片段',
    'search.chat': '聊天记录',
    'search.commands': '终端指令',
    'search.cmd_hint': '输入指令名称或中文关键词快速导航',

    // Console
    'console.help_header': '可用命令:',
    'console.cmd_help': '显示帮助信息',
    'console.cmd_ls': '列出目录内容',
    'console.cmd_cd': '切换目录',
    'console.cmd_clear': '清除终端',
    'console.cmd_whoami': '打印当前用户',
    'console.cmd_date': '打印系统日期',
    'console.cmd_git': 'Git 版本控制',
    'console.init_1': 'YYC3_KERNEL_V3.0.1 初始化...',
    'console.init_2': '挂载虚拟文件系统... 完成',
    'console.init_3': '输入 "help" 查看可用命令。',
    'console.access_denied': '访问被拒绝',
    'console.module_locked': '模块 currently locked 由管理员锁定。',

    // DevOps
    'devops.title': 'DevOps 运维中心',
    'devops.pipeline': 'CI/CD 流水线',
    'devops.containers': '容器管理',
    'devops.terminal': '运维终端',
    'devops.all_nominal': '所有系统正常',
    'devops.run_pipeline': '执行流水线',
    'devops.retry': '重试',
  },
  en: {
    // Sidebar
    'sidebar.new_session': 'NEW_SESSION',
    'sidebar.terminal': 'terminal.exe',
    'sidebar.console': 'sys_console',
    'sidebar.monitor': 'net_monitor',
    'sidebar.projects': 'projects_dir',
    'sidebar.artifacts': 'artifacts_log',
    'sidebar.favorites': 'FAVORITES',
    'sidebar.history': 'HISTORY',
    'sidebar.today': './today',
    'sidebar.yesterday': './yesterday',
    'sidebar.archive': './archive',
    'sidebar.status_online': 'NET_ONLINE',
    'sidebar.deploy_scripts': 'deploy-scripts',
    'sidebar.api_docs': 'api-docs',
    'sidebar.settings': 'SYS_CONFIG',
    'sidebar.gitops': 'GitOps',

    // New Navigation
    'sidebar.services': 'services',
    'sidebar.knowledge': 'knowledge_base',
    'sidebar.bookmarks': 'project_mgr',

    // Settings - Appearance
    'settings.tab.appearance': 'Appearance',
    'settings.tab.agents': 'Agent Cards',
    'settings.accent_color': 'Accent Color',
    'settings.opacity': 'Panel Opacity',
    'settings.bg_blur': 'Background Blur',
    'settings.scanline': 'Scanline Effect',
    'settings.glow': 'Glow Effect',
    'settings.theme_preview': 'Theme Preview',
    'settings.background': 'Background Settings',
    'settings.bg_color': 'Background Color',
    'settings.bg_image': 'Background Image',
    'settings.bg_image_upload': 'Upload Background Image',
    'settings.bg_image_clear': 'Clear Background',
    'settings.bg_brightness': 'Background Brightness',
    'settings.bg_blur_amount': 'Background Blur',
    'settings.shadow_intensity': 'Border Shadow Intensity',
    'settings.overlay_opacity': 'Overlay Opacity',
    'settings.overlay_opacity_desc': 'Set the background opacity for popups, overlays, and secondary panels',
    'settings.font_family': 'Font Selection',
    'settings.font_family_desc': 'Choose the main text font for the interface (supports local font detection)',
    'settings.mono_font': 'Monospaced Font',
    'settings.mono_font_desc': 'Font for terminal and code areas',
    'settings.font_size': 'Global Font Size',
    'settings.font_size_desc': 'Adjust the overall font size of the interface',
    'settings.detect_fonts': 'Detect Local Fonts',
    'settings.font_count': 'Detected {count} fonts',
    'settings.agent_name': 'Agent Name',
    'settings.agent_role': 'Agent Role',
    'settings.agent_desc': 'Agent Description',
    'settings.agent_status': 'Agent Status',

    // Services
    'services.title': 'Common Services',
    'services.add': 'Add Service',
    'services.category': 'Category',
    'services.url': 'Service URL',
    'services.open': 'Open',

    // Knowledge Base
    'kb.title': 'Knowledge Base',
    'kb.search': 'Search docs...',
    'kb.add_doc': 'Add Document',
    'kb.categories': 'Categories',
    'kb.total_docs': 'Total Documents',
    'kb.recent': 'Recently Edited',
    'kb.export': 'Export JSON',
    'kb.import': 'Import JSON',
    'kb.import_success': 'Import Successful',
    'kb.import_fail': 'Import Failed',
    'kb.import_merged': ' merged',
    'kb.import_added': ' added',
    'kb.ai_summary': 'AI Summary',
    'kb.ai_generating': 'Generating...',
    'kb.ai_no_provider': 'No LLM provider configured',
    'kb.fuzzy_match': 'Fuzzy Match',
    'kb.score': 'Score',
    'kb.no_results': 'No matching results',
    'kb.search_hint': 'Fuzzy search supported, separate words with spaces',

    // Bookmarks
    'bookmarks.title': 'Project Manager',
    'bookmarks.add': 'Add Project',
    'bookmarks.category': 'Categories',
    'bookmarks.visit': 'Visit',

    // Chat
    'chat.placeholder': 'Input command or natural language query...',
    'chat.placeholder_ai': 'Ask AI anything...',
    'chat.search_placeholder': 'Search global context (Ctrl+K)...',
    'chat.artifacts': 'ARTIFACTS',
    'chat.web_search': 'Web Search',
    'chat.execute': 'EXECUTE',
    'chat.busy': 'BUSY',
    'chat.system_ready': 'System Ready',
    'chat.latency': 'Latency',
    'chat.welcome_title': 'YYC3_OS READY',
    'chat.welcome_subtitle': 'Initialization complete. Awaiting input.',
    'chat.quick_action_1': 'Build React Component',
    'chat.quick_action_2': 'Deploy Microservice',
    'chat.quick_action_3': 'Scan Vulnerabilities',
    'chat.mode_navigate': 'NAV_MODE',
    'chat.mode_ai': 'AI_CHAT',
    'chat.mode_navigate_desc': 'Keyword-driven navigation',
    'chat.mode_ai_desc': 'Real-time LLM conversation',
    'chat.no_provider': 'No AI provider configured. Go to Settings → AI Models to set up an API key.',
    'chat.ai_thinking': 'Thinking...',
    'chat.ai_error': 'AI request failed. Falling back to template response.',
    'chat.navigate_to': 'Navigated to: {target}',
    'chat.navigate_unknown': 'Unknown navigation intent. Try keywords like "dashboard", "projects", "settings".',

    // Agents
    'agent.architect': 'ARCHITECT',
    'agent.coder': 'ENGINEER',
    'agent.auditor': 'AUDITOR',
    'agent.orchestrator': 'ORCHESTRATOR',
    'agent.user': 'dev_operator',

    // Settings
    'settings.title': 'SYS_CONFIG',
    'settings.desc': 'Configure system parameters, AI models, GitOps, and extensions',
    'settings.tab.general': 'General',
    'settings.tab.models': 'AI Models',
    'settings.tab.gitops': 'GitOps',
    'settings.tab.extensions': 'Extensions',
    'settings.tab.security': 'Security',
    'settings.workspace_name': 'Workspace Name',
    'settings.dev_mode': 'Dev Mode',
    'settings.dev_mode_desc': 'Enable experimental features and debug logs',
    'settings.auto_save': 'Auto-Save Artifacts',
    'settings.auto_save_desc': 'Automatically persist generated code to local storage',
    'settings.inference': 'Inference Parameters',
    'settings.temp': 'Temperature',
    'settings.tokens': 'Max Tokens',
    'settings.marketplace_offline': 'Marketplace Offline',
    'settings.scanning_enabled': 'Scanning Enabled',
    'settings.language': 'Language',

    // Search
    'search.title': 'Global Context Search',
    'search.no_results': 'No results found for',
    'search.navigate': 'Navigate',
    'search.select': 'Select',
    'search.files': 'Files',
    'search.code': 'Code Snippets',
    'search.chat': 'Chat History',
    'search.commands': 'Terminal Commands',
    'search.cmd_hint': 'Enter command name or keyword for quick navigation',

    // Console
    'console.help_header': 'Available commands:',
    'console.cmd_help': 'Show this help message',
    'console.cmd_ls': 'List directory contents',
    'console.cmd_cd': 'Change directory',
    'console.cmd_clear': 'Clear terminal',
    'console.cmd_whoami': 'Print current user',
    'console.cmd_date': 'Print system date',
    'console.cmd_git': 'Git version control',
    'console.init_1': 'YYC3_KERNEL_V3.0.1 initialized...',
    'console.init_2': 'Mounting virtual file system... OK',
    'console.init_3': 'Type "help" for available commands.',
    'console.access_denied': 'ACCESS_DENIED',
    'console.module_locked': 'Module currently locked by Administrator.',

    // DevOps
    'devops.title': 'DevOps Control Center',
    'devops.pipeline': 'CI/CD Pipeline',
    'devops.containers': 'Container Management',
    'devops.terminal': 'Operations Shell',
    'devops.all_nominal': 'ALL SYSTEMS NOMINAL',
    'devops.run_pipeline': 'Run Pipeline',
    'devops.retry': 'Retry',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh');

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }

  return context;
}