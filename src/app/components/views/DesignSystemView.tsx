import {
  Palette, Layout, Layers, Zap, BookOpen,
  Code2, Settings, ExternalLink, Github,
  Download, RefreshCw, CheckCircle2,
} from 'lucide-react';
import * as React from 'react';

import { YYC3DesignSystemDemo } from '@/app/components/examples/YYC3DesignSystemDemo';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface DesignSystemSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const SECTIONS: DesignSystemSection[] = [
  {
    id: 'overview',
    title: '概览',
    description: 'YYC³ Design System 简介',
    icon: <BookOpen className="w-5 h-5" />,
    content: (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">YYC³ Design System</h3>
          <p className="text-muted-foreground">
            基于「五高五标五化」理念的企业级设计系统，为 YYC³-HKCT 项目提供统一的设计语言、组件库和开发工具。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                设计令牌
              </CardTitle>
              <CardDescription>
                统一的颜色、圆角、阴影、字体和动画令牌
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                组件库
              </CardTitle>
              <CardDescription>
                可复用的 UI 组件，支持 React、Vue、Svelte
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                主题系统
              </CardTitle>
              <CardDescription>
                深色/浅色主题切换，支持自定义主题
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                动画系统
              </CardTitle>
              <CardDescription>
                预定义的动画效果和动画工具函数
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">版本信息</h4>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">v1.3.0</Badge>
            <Badge variant="outline">Stable</Badge>
            <span className="text-sm text-muted-foreground">更新于 2026-02-19</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'tokens',
    title: '设计令牌',
    description: '设计令牌参考',
    icon: <Palette className="w-5 h-5" />,
    content: <YYC3DesignSystemDemo />,
  },
  {
    id: 'components',
    title: '组件库',
    description: '可用组件列表',
    icon: <Layers className="w-5 h-5" />,
    content: (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">组件库</h3>
          <p className="text-muted-foreground">
            YYC³ Design System 提供了一系列可复用的 UI 组件，位于 <code className="px-2 py-1 bg-muted rounded">/yyc3-Design-System/src/components/</code> 目录。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Button</CardTitle>
              <CardDescription>按钮组件，支持多种变体和尺寸</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="default" size="sm">Default</Button>
                <Button variant="destructive" size="sm">Destructive</Button>
                <Button variant="outline" size="sm">Outline</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Card</CardTitle>
              <CardDescription>卡片组件，用于展示内容</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-muted rounded text-sm">Card Content</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>输入框组件，支持多种类型</CardDescription>
            </CardHeader>
            <CardContent>
              <Input placeholder="Enter text..." className="text-sm" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select</CardTitle>
              <CardDescription>下拉选择器组件</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">Coming Soon</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Checkbox</CardTitle>
              <CardDescription>复选框组件</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">Coming Soon</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dialog</CardTitle>
              <CardDescription>对话框组件</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">Coming Soon</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">使用示例</h4>
          <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
            <code>{`import { Button } from '@/yyc3-Design-System/src/components/Button';

<Button variant="default" size="md">
  Default Button
</Button>`}</code>
          </pre>
        </div>
      </div>
    ),
  },
  {
    id: 'documentation',
    title: '文档',
    description: '用户手册和 API 文档',
    icon: <BookOpen className="w-5 h-5" />,
    content: (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">文档资源</h3>
          <p className="text-muted-foreground">
            详细的用户手册和 API 文档，帮助您快速上手 YYC³ Design System。
          </p>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>YYC³ Design System 用户手册</span>
                <Badge variant="secondary">完整</Badge>
              </CardTitle>
              <CardDescription>
                包含快速开始、设计令牌、组件库、主题系统、动画系统、最佳实践等内容
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="/docs/YYC3-Design-System-用户手册.md" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    查看文档
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/docs/YYC3-Design-System-用户手册.md" download>
                    <Download className="w-4 h-4 mr-2" />
                    下载
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>API 文档</span>
                <Badge variant="outline">Coming Soon</Badge>
              </CardTitle>
              <CardDescription>
                详细的 API 文档，包含所有组件的 Props、方法和事件
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" disabled>
                <Code2 className="w-4 h-4 mr-2" />
                查看文档
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Storybook</span>
                <Badge variant="outline">Coming Soon</Badge>
              </CardTitle>
              <CardDescription>
                交互式组件文档和示例，实时预览组件效果
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" disabled>
                <ExternalLink className="w-4 h-4 mr-2" />
                打开 Storybook
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">快速链接</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Design System 目录</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-sm text-muted-foreground">/yyc3-Design-System/</code>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">组件目录</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-sm text-muted-foreground">/yyc3-Design-System/src/components/</code>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">设计令牌源文件</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-sm text-muted-foreground">/yyc3-Design-System/design/tokens.json</code>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">构建输出</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-sm text-muted-foreground">/yyc3-Design-System/dist/</code>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'settings',
    title: '设置',
    description: 'Design System 配置',
    icon: <Settings className="w-5 h-5" />,
    content: (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Design System 设置</h3>
          <p className="text-muted-foreground">
            配置和管理 YYC³ Design System。
          </p>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>重新构建令牌</CardTitle>
              <CardDescription>
                当修改设计令牌源文件后，需要重新构建以生成最新的令牌文件
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                  <code>{`cd yyc3-Design-System
npm run build:tokens`}</code>
                </pre>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新构建
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>更新 Design System</CardTitle>
              <CardDescription>
                从远程仓库拉取最新的 Design System 更新
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                  <code>{`cd yyc3-Design-System
git pull origin main
npm install
npm run build:tokens`}</code>
                </pre>
                <Button variant="outline" size="sm">
                  <Github className="w-4 h-4 mr-2" />
                  检查更新
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>系统状态</CardTitle>
              <CardDescription>
                Design System 当前状态信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">版本</span>
                  <Badge variant="secondary">v1.3.0</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">构建状态</span>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    已构建
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">令牌文件</span>
                  <Badge variant="outline">最新</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">集成状态</span>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    已集成
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
];

export const DesignSystemView: React.FC = () => {
  const [activeSection, setActiveSection] = React.useState<string>('overview');

  const currentSection = SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border">
        <ScrollArea className="h-14">
          <div className="flex items-center px-4 h-full">
            {SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                  activeSection === section.id
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                )}
              >
                {section.icon}
                <span>{section.title}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          {currentSection?.content}
        </div>
      </ScrollArea>
    </div>
  );
};