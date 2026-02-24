# OpenCode

> ## Documentation Index
>
> Fetch the complete documentation index at: <https://docs.bigmodel.cn/llms.txt>
> Use this file to discover all available pages before exploring further.

# OpenCode

> 在 OpenCode 中使用 GLM Coding Plan 的方法

OpenCode 既是一款在终端中运行的 CLI + TUI AI 编程代理工具，也提供 IDE 的插件集成，能够在不同开发环境下完成快速代码生成、调试、项目分析、文件操作与跨项目协作等任务。

<Tip>
  搭配 [**GLM Coding Plan**](https://zhipuaishengchan.datasink.sensorsdata.cn/t/Nd)，OpenCode 的使用成本大幅降低，开发效率与稳定性全面提升。
</Tip>

<img src="https://mintcdn.com/zhipu-ef7018ed/q2gZk1zJC_jqbzxN/resource/opencode.png?fit=max&auto=format&n=q2gZk1zJC_jqbzxN&q=85&s=e66a963a5949825fd159fcd5c68be1f2" alt="Description" data-og-width="2210" width="2210" data-og-height="1156" height="1156" data-path="resource/opencode.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/zhipu-ef7018ed/q2gZk1zJC_jqbzxN/resource/opencode.png?w=280&fit=max&auto=format&n=q2gZk1zJC_jqbzxN&q=85&s=c5d3a94fa32e9092bce0f1ca4cac00dd 280w, https://mintcdn.com/zhipu-ef7018ed/q2gZk1zJC_jqbzxN/resource/opencode.png?w=560&fit=max&auto=format&n=q2gZk1zJC_jqbzxN&q=85&s=684688e515d0645b2e4ca6a947e1a485 560w, https://mintcdn.com/zhipu-ef7018ed/q2gZk1zJC_jqbzxN/resource/opencode.png?w=840&fit=max&auto=format&n=q2gZk1zJC_jqbzxN&q=85&s=c57adbc4dae2467aa5492dd91e19294e 840w, https://mintcdn.com/zhipu-ef7018ed/q2gZk1zJC_jqbzxN/resource/opencode.png?w=1100&fit=max&auto=format&n=q2gZk1zJC_jqbzxN&q=85&s=ab0186b5417401b4d85c2856ce1a84cc 1100w, https://mintcdn.com/zhipu-ef7018ed/q2gZk1zJC_jqbzxN/resource/opencode.png?w=1650&fit=max&auto=format&n=q2gZk1zJC_jqbzxN&q=85&s=4161b66b6fde81a43b16a5a168c47f8a 1650w, https://mintcdn.com/zhipu-ef7018ed/q2gZk1zJC_jqbzxN/resource/opencode.png?w=2500&fit=max&auto=format&n=q2gZk1zJC_jqbzxN&q=85&s=773e54543022b44a88d4cc9cb23d1f02 2500w" />

<Warning>
  使用 GLM Coding Plan 时，需要配置专属的 Coding API 端点 [https://open.bigmodel.cn/api/coding/paas/v4](https://open.bigmodel.cn/api/coding/paas/v4) 而不是通用 API 端点
</Warning>

<Tip>
  使用 GLM-5，需要在 opencode 中执行 `/models` 选择模型编码为 `GLM-5`
</Tip>

## 一、安装 OpenCode

安装 OpenCode 最简单的方式是使用官方安装脚本：

```bash  theme={null}
curl -fsSL https://opencode.ai/install | bash
```

你也可以使用 npm 安装：

```bash  theme={null}
npm install -g opencode-ai
```

## 二、配置 GLM 模型

<Tabs>
  <Tab title="方式一：自动化助手">
    Coding Tool Helper 是一个编码工具助手，快速将您的**GLM编码套餐**加载到您喜爱的**编码工具**中。安装并运行它，按照界面提示操作即可自动完成工具安装，套餐配置，MCP服务器管理等。

    ### 1. 获取 API 密钥

    访问智谱 Bigmodel 开放平台，获取你的 [API key](https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys)。

    ### 2. 运行 Coding Tool Helper

    ```bash  theme={null}
    # 进入命令行界面，执行如下运行 Coding Tool Helper
    npx @z_ai/coding-helper
    ```

    详细说明请参考 [Coding Tool Helper 文档](/cn/coding-plan/extension/coding-tool-helper)。

    ![Description](https://cdn.bigmodel.cn/markdown/1764664136830image.png?attname=image.png)

    ### 3. 启动 OpenCode

    运行 `opencode` 启动 OpenCode：

    ```bash  theme={null}
    $ opencode
    ```

    使用 `/models` 命令来选择模型，例如 GLM-4.7：

    ```
    /models
    ```
  </Tab>

  <Tab title="方式二：手动配置">
    ### 1. 获取 API 密钥

    访问智谱 Bigmodel 开放平台，获取你的 [API key](https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys)。

    ### 2. 运行 `opencode auth login` 并选择 **Zhipu AI Coding Plan**

    ```bash  theme={null}
    $ opencode auth login

    ┌  Add credential
    │
    ◆  Select provider
    │  ● Zhipu AI Coding Plan
    │  ...
    └
    ```

    ### 3. 输入您的 Zhipu AI API Key

    ```bash  theme={null}
    $ opencode auth login

    ┌  Add credential
    │
    ◇  Select provider
    │  Zhipu AI Coding Plan
    │
    ◇  Enter your API key
    │  _
    └
    ```

    ### 4. 运行 `opencode` 启动 OpenCode

    ```bash  theme={null}
    $ opencode
    ```

    使用 `/models`  命令来选择模型，例如 GLM-4.7。

    ```
    /models
    ```

    ### 5. 其它低版本配置

    > 若您使用的低版本 OpenCode 内无 `Zhipu AI Coding Plan` Provider 选项，建议您升级 OpenCode 版本。\
    > 或者您可以选择 `Zhipu AI` Provider 后再参考下方切换端点配置。

    在 `~/.config/opencode/opencode.json` 中配置：

    ```
    {
        "$schema": "https://opencode.ai/config.json",
        "provider": {
            "zhipuai": {
                "api": "https://open.bigmodel.cn/api/coding/paas/v4"
            }
        }
    }
    ```
  </Tab>
</Tabs>

## 三、套餐专属 MCP 服务器

GLM Coding Plan 提供了专属的 MCP 服务器，支持视觉识别、搜索、网页读取和开源仓库访问等功能：

* [视觉 MCP 服务器](/cn/coding-plan/mcp/vision-mcp-server) - 支持图像识别和分析
* [搜索 MCP 服务器](/cn/coding-plan/mcp/search-mcp-server) - 支持网络搜索功能
* [网页读取 MCP 服务器](/cn/coding-plan/mcp/reader-mcp-server) - 支持网页内容提取
* [开源仓库 MCP 服务器](../mcp/zread-mcp-server) - 支持开源仓库文档搜索、结构分析和代码读取

<Tip>
  **推荐方式**：使用 Coding Tool Helper 可以一键安装和管理所有套餐 MCP 服务器，无需手动配置。

  ```bash  theme={null}
  npx @z_ai/coding-helper
  ```

  Coding Tool Helper 会自动检测您的工具环境并安装相应的 MCP 服务器。
</Tip>
