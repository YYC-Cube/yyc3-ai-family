# Factory Droid

> ## Documentation Index
>
> Fetch the complete documentation index at: <https://docs.bigmodel.cn/llms.txt>
> Use this file to discover all available pages before exploring further.

# Factory Droid

> 在 Factory Droid 中使用 GLM 编码计划的方法

Factory Droid 是一款企业级 AI 编码代理，它运行在你的终端中，负责端到端的软件开发工作流。

<Tip>
  搭配 [**GLM Coding Plan**](https://zhipuaishengchan.datasink.sensorsdata.cn/t/Nd)，Droid 可在终端中发挥强大的编程与对话能力，兼具高效与稳定，全面提升开发体验。
</Tip>

<Warning>
  Factory Droid 需要成功登录 Factory Droid 账户认证后才能使用，注意其需要海外手机号验证。
</Warning>

## 步骤 1：安装 Factory Droid

**macOS / Linux：**

```bash  theme={null}
curl -fsSL https://app.factory.ai/cli | sh
```

**Windows：**

```powershell  theme={null}
irm https://app.factory.ai/cli/windows | iex
```

## 步骤 2：配置 ZHIPU GLM 模型

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

    ### 3. 启动 Factory Droid

    进入项目目录并启动 droid：

    ```bash  theme={null}
    cd /path/to/your/project
    droid
    ```

    首次启动时，系统会引导你通过浏览器登录以连接到 Factory 的服务。

    ### 4. 选择你的 GLM 模型

    droid 运行后，使用 `/model` 命令选择 GLM 模型：

    ```
    /model
    ```

    你配置的 GLM 自定义模型会显示在 "Custom models（自定义模型）" 分区。选择你配置的 GLM 模型。
  </Tab>

  <Tab title="方式二：手动配置">
    ### 1. 获取 API 密钥

    访问智谱 Bigmodel 开放平台，获取你的 [API key](https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys)。

    ### 2. 配置自定义模型

    Factory Droid 通过 BYOK（Bring Your Own Key，自带密钥）连接 ZHIPU 的 GLM 模型。

    **配置文件位置**

    * macOS/Linux：`~/.factory/settings.json`
    * Windows：`%USERPROFILE%\.factory\settings.json`

    <Tip>
      使用下方任一方式即可：\
      注意替换里面的 `your_api_key` 为您上一步获取到的 API Key。
    </Tip>

    #### Anthropic 协议

    ```json  theme={null}
    {
      "customModels": [
        {
          "displayName": "GLM-4.7 [GLM Coding Plan China] - Anthropic",
          "model": "glm-4.7",
          "baseUrl": "https://open.bigmodel.cn/api/anthropic",
          "apiKey": "your_api_key",
          "provider": "anthropic",
          "maxOutputTokens": 131072
        }
      ]
    }
    ```

    #### OpenAI Chat Completion 协议

    ```json  theme={null}
    {
      "customModels": [
        {
          "displayName": "GLM-4.7 [GLM Coding Plan China] - Openai",
          "model": "glm-4.7",
          "baseUrl": "https://open.bigmodel.cn/api/coding/paas/v4",
          "apiKey": "your_api_key",
          "provider": "generic-chat-completion-api",
          "maxOutputTokens": 131072
        }
      ]
    }
    ```

    **重要说明**

    * 将 `your_api_key` 替换为你的实际 API Key
    * API Key 仅保存在本地，且不会上传到 Factory 服务器

    ### 3. 启动 Factory Droid

    进入项目目录并启动 droid：

    ```bash  theme={null}
    cd /path/to/your/project
    droid
    ```

    首次启动时，系统会引导你通过浏览器登录以连接到 Factory 的服务。

    <Warning>
      Factory Droid 需要成功登录认证后才能使用。
    </Warning>

    ### 4. 选择你的 GLM 模型

    droid 运行后，使用 `/model` 命令选择 GLM 模型：

    ```
    /model
    ```

    你配置的 GLM 自定义模型会显示在 "Custom models（自定义模型）" 分区。选择你配置的 GLM 模型。

    ### 5. 开始编码

    使用 droid 进行代码分析、功能实现、缺陷修复、变更审查等任务。
  </Tab>
</Tabs>

## 套餐专属 MCP 服务器

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

## 资源

* 文档：[docs.factory.ai](https://docs.factory.ai/cli/getting-started/overview)
* BYOK 配置：[docs.factory.ai/cli/byok/overview](https://docs.factory.ai/cli/byok/overview)
* 支持：[support@factory.ai](mailto:support@factory.ai)
