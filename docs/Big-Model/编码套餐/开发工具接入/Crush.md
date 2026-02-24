# Crush

> ## Documentation Index
>
> Fetch the complete documentation index at: <https://docs.bigmodel.cn/llms.txt>
> Use this file to discover all available pages before exploring further.

# Crush

> 在 Crush 中使用 GLM Coding Plan 的方法

Crush 既是一款在终端中运行的 CLI + TUI AI 编程工具，也支持多种模型接入，能够在命令行环境下完成代码生成、调试、对话、文件操作与多任务处理等工作。

<Tip>
  搭配 [**GLM Coding Plan**](https://zhipuaishengchan.datasink.sensorsdata.cn/t/Nd)，Crush 可在终端中发挥强大的编程与对话能力，兼具高效与稳定，全面提升开发体验。
</Tip>

<Warning>
  使用 GLM Coding Plan 时，需要配置专属的 Coding API 端点 [https://open.bigmodel.cn/api/coding/paas/v4](https://open.bigmodel.cn/api/coding/paas/v4) 而不是通用 API 端点
</Warning>

<Tip>
  使用 GLM-5，需要在 crush 中执行 `/models` 选择模型编码为 `GLM-5`
</Tip>

## 一、安装 Crush

根据您的系统选择对应的安装方式：

<Tabs>
  <Tab title="Homebrew（macOS 推荐）">
    ```
    brew install charmbracelet/tap/crush
    ```
  </Tab>

  <Tab title="NPM（跨平台）">
    ```
    npm install -g @charmland/crush
    ```
  </Tab>

  <Tab title="Arch Linux">
    ```
    yay -S crush-bin
    ```
  </Tab>

  <Tab title="Nix">
    ```
    nix run github:numtide/nix-ai-tools#crush
    ```
  </Tab>
</Tabs>

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

    ### 3. 启动 Crush

    配置完成后，您可以运行以下命令启动 Crush：

    ```
    crush
    ```

    通过输入模型名称，选择 GLM-4.7 模型进行操作：

    ```
    /models
    ```
  </Tab>

  <Tab title="方式二：手动配置">
    ### 1. 获取 API 密钥

    访问智谱 Bigmodel 开放平台，获取你的 [API key](https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys)。

    ### 2. 启动 Crush 并选择模型

    运行 crush 命令启动应用：

    ```
    crush
    ```

    在模型选择界面中，选择以下模型之一：

    * glm-4.7 : 最新最强编码模型
    * glm-4.5 : 标准版本，适合复杂任务
    * glm-4.5-air : 轻量版本，响应更快

    ### 3. 输入 API 密钥

    在提示界面中输入您从智谱 AI 获取的 API Key。
    ![Description](https://cdn.bigmodel.cn/markdown/1759228565353crush.png?attname=crush.png)

    ### 4. 修改 Crush 配置

    #### 4.1 找到配置文件

    配置文件位置因操作系统而异：

    <Tabs>
      <Tab title="macOS/Linux">
        ```
        ~/.config/crush/crush.json
        ```
      </Tab>

      <Tab title="Windows">
        ```
        %USERPROFILE%\.config\crush\crush.json
        ```
      </Tab>
    </Tabs>

    #### 4.2 修改 API 端点

    打开 crush.json 文件，配置如下，注意替换您的 API KEY：

    ```
    {
      "providers": {
        "zai": {
          "id": "zai",
          "name": "ZAI Provider",
          "base_url": "https://open.bigmodel.cn/api/coding/paas/v4",
          "api_key": "your_api_key"
        }
      }
    }
    ```

    ### 5. 完成配置并启动 Crush

    配置完成后，您可以运行以下命令启动 Crush：

    ```
    crush
    ```

    通过输入模型名称，选择 GLM-4.7 模型进行操作：

    ```
    /models
    ```
  </Tab>
</Tabs>

配置完成后，重启 Crush 应用。您现在可以：

* 使用 GLM-4.7 进行代码生成和优化
* 进行技术问答和调试
* 执行复杂的编程任务
* 享受智谱 AI 的强大能力

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
