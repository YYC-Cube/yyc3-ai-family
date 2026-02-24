# 一键安装小助手

> ## Documentation Index
>
> Fetch the complete documentation index at: <https://docs.bigmodel.cn/llms.txt>
> Use this file to discover all available pages before exploring further.

# 一键安装小助手

<Tip>
  为 GLM Coding Plan 用户统一管理与配置 Claude Code 等 CLI 工具的命令行助手。
</Tip>

**NPM 包地址**: [@z\_ai/coding-helper](https://www.npmjs.com/package/@z_ai/coding-helper) \
**前提条件**: [Node.js >= v18.0.0](https://nodejs.org/en/download/)

## 工具简介

Coding Tool Helper （一键安装小助手）是一个编码工具助手，快速将您的**GLM编码套餐**加载到您喜爱的**编码工具**中。安装并运行它，按照界面提示操作即可自动完成工具安装，套餐配置，MCP服务器管理，Claude Code 插件市场等。

当前编码工具支持：

* **Claude Code**
* **OpenCode**
* **Crush**
* **Factory Droid**

## 功能特性

<CardGroup cols={3}>
  <Card
    title="交互式向导"
    icon={
    <svg
      style={{ maskImage: "url(/resource/icon/window.svg)", WebkitMaskImage: "url(/resource/icon/window.svg)", maskRepeat: "no-repeat", maskPosition: "center center" }}
      className={"h-6 w-6 bg-primary dark:bg-primary-light !m-0 shrink-0"}
    />
  }
  >
    友好的设置引导
  </Card>

  <Card
    title="套餐集成"
    icon={
    <svg
      style={{ maskImage: "url(/resource/icon/code.svg)", WebkitMaskImage: "url(/resource/icon/code.svg)", maskRepeat: "no-repeat", maskPosition: "center center" }}
      className={"h-6 w-6 bg-primary dark:bg-primary-light !m-0 shrink-0"}
    />
  }
  >
    将GLM套餐接入喜爱的编码工具
  </Card>

  <Card
    title="工具管理"
    icon={
    <svg
      style={{ maskImage: "url(/resource/icon/box.svg)", WebkitMaskImage: "url(/resource/icon/box.svg)", maskRepeat: "no-repeat", maskPosition: "center center" }}
      className={"h-6 w-6 bg-primary dark:bg-primary-light !m-0 shrink-0"}
    />
  }
  >
    自动检测、安装和配置编码工具
  </Card>

  <Card
    title="MCP 配置"
    icon={
    <svg
      style={{ maskImage: "url(/resource/icon/hammer.svg)", WebkitMaskImage: "url(/resource/icon/hammer.svg)", maskRepeat: "no-repeat", maskPosition: "center center" }}
      className={"h-6 w-6 bg-primary dark:bg-primary-light !m-0 shrink-0"}
    />
  }
  >
    轻松管理 MCP 服务
  </Card>

  <Card
    title="插件市场"
    icon={
    <svg
      style={{ maskImage: "url(/resource/icon/database.svg)", WebkitMaskImage: "url(/resource/icon/database.svg)", maskRepeat: "no-repeat", maskPosition: "center center" }}
      className={"h-6 w-6 bg-primary dark:bg-primary-light !m-0 shrink-0"}
    />
  }
  >
    内置 Claude Code 插件市场
  </Card>

  <Card
    title="国际化支持"
    icon={
    <svg
      style={{ maskImage: "url(/resource/icon/globe.svg)", WebkitMaskImage: "url(/resource/icon/globe.svg)", maskRepeat: "no-repeat", maskPosition: "center center" }}
      className={"h-6 w-6 bg-primary dark:bg-primary-light !m-0 shrink-0"}
    />
  }
  >
    界面支持中文等多语言
  </Card>
</CardGroup>

## 快速开始

<Steps>
  <Step title="获取 API Key">
    前往 [智谱开放平台](https://open.bigmodel.cn/usercenter/apikeys) 获取您的 API Key
  </Step>

  <Step title="安装 Node.js">
    如果您尚未安装 Node.js，请前往 [Node.js 官网](https://nodejs.org/en/download/) 下载并安装最新的 LTS 版本。\
    MacOS 用户注意：推荐使用 `nvm` 工具安装 Node.js，避免权限问题，进入 [Node.js 官网](https://nodejs.org/en/download/) 如下在命令行粘贴运行即可。\\

    ![Description](https://cdn.bigmodel.cn/markdown/1765856965981image.png?attname=image.png)

    <Tip>
      MacOS 用户若您已使用其它方式安装 Node.js，在后续执行命令过程若遇到 Permission 权限问题，需要在命令前加 `sudo` 来提高权限运行，或者卸载后改用 `nvm` 重新安装。
    </Tip>
  </Step>

  <Step title="安装启动">
    前提条件：您需要安装 [Node.js 18+ 或更新版本](https://nodejs.org/en/download/) \
    选择下面的任意一种安装启动方式

    <Tabs>
      <Tab title="方式一（推荐：npx 即用）">
        该方式适合偶尔使用 Coding Tool Helper 的用户，无需全局安装，直接通过 npx 运行即可启动工具。

        ```shell  theme={null}
        ## 进入命令行界面，执行如下运行 Coding Tool Helper
        npx @z_ai/coding-helper
        ```
      </Tab>

      <Tab title="方式二（全局安装重复使用）">
        该方式适合频繁使用 Coding Tool Helper 的用户，通过全局安装后可运行 `coding-helper` 或 `chelper` 命令启动工具。

        <Tip>
          若您执行 `npm install` 后报错提示权限不足 `permission denied`，请尝试在命令前加上 sudo（MacOS / Linux），或以管理员身份运行命令行（Windows）。\
          如: `sudo npm install -g @z_ai/coding-helper` \
          或推荐使用 npx 方式直接启动 `npx @z_ai/coding-helper`
        </Tip>

        ```shell  theme={null}
        ## 进入命令行界面，先全局安装 @z_ai/coding-helper
        npm install -g @z_ai/coding-helper
        ## 然后运行 coding-helper 或 chelper
        coding-helper
        ```
      </Tab>
    </Tabs>
  </Step>

  <Step title="完成引导">
    进入向导界面后，通过键盘上下方向键选择，回车确认按钮，根据引导进行配置。\
    向导将引导您完成：\
    选择界面语言 --> 选择编码套餐 --> 输入 API 密钥 --> 选择要管理的工具 \
    \--> 自动安装工具（如需要） --> 进入工具管理菜单 --> 装载编码套餐到工具 \
    \--> 管理 MCP 服务（可选） --> 完整配置，启动编码工具
  </Step>
</Steps>

![Description](https://cdn.bigmodel.cn/markdown/1764741445765coding-tool-helper.gif?attname=coding-tool-helper.gif)

## 其它相关

### 命令列表

> 除了支持交互式向导外，Coding Tool Helper 还支持通过命令行 `coding-helper` 或 `chelper` 加参数直接执行各项功能：

```bash  theme={null}
# 运行初始化向导
coding-helper init

# 语言管理
coding-helper lang show              # 显示当前语言
coding-helper lang set zh_CN         # 设置为中文
coding-helper lang --help            # 查看语言命令帮助

# API 密钥管理
coding-helper auth                   # 交互式设置密钥
coding-helper auth glm_coding_plan_china <token>     # 直接选择 China 套餐并设置密钥
coding-helper auth revoke            # 删除已保存的密钥
coding-helper auth reload claude     # 将最新套餐信息加载至Claude Code工具
coding-helper auth --help            # 查看认证命令帮助

coding-helper doctor                 # 检查系统配置和工具状态
coding-helper --help                 # 显示帮助信息
coding-helper --version              # 显示版本
```

### 问题排查

遇到问题可以先使用 `coding-helper doctor` 命令进行健康检查，排查常见问题。

<AccordionGroup>
  <Accordion title="网络错误，请检查网络连接" defaultOpen="true">
    **问题：** 保存校验 API KEY 或其它网络操作时，报错 Network Error 等网络错误

    **解决方案：**

    1. 请检查网络链接或配置代理
    2. 注意若您需使用代理才能访问外部网络，NodeJs 程序本身并不会自动使用系统代理配置，请配置环境变量 `HTTP_PROXY` 和 `HTTPS_PROXY` 来让 NodeJs 使用代理

    ```shell  theme={null}
    # 参考如下
    export HTTP_PROXY=http://your.proxy.server:port
    export HTTPS_PROXY=http://your.proxy.server:port
    ```
  </Accordion>

  <Accordion title="网络超时">
    **问题：** 运行或安装编码工具时，报错 timeout 等网络超时

    **解决方案：**

    1. 请检查网络链接或配置代理
    2. 或切换NPM源为国内源
  </Accordion>

  <Accordion title="Factory Droid 安装失败">
    **问题：** 运行安装 Factory Droid 后，执行 `droid` 命令报错 command not found

    **解决方案：**

    1. 请留意安装过程结束后的信息，根据环境有可能需要手动将 Factory Droid 可执行文件路径添加到系统 PATH 中
  </Accordion>

  <Accordion title="Claude Code 插件市场里插件状态不对">
    **问题：** 使用 Claude Code 插件市场时，发现插件状态不对，如显示未安装但实际上已安装等

    **解决方案：**

    1. 请执行 `claude update` 升级 Claude Code 至最新版本, 2.0.70+
  </Accordion>

  <Accordion title="权限不足 EACCES: permission denied">
    **问题：** 运行 npm install -g 报错 EACCES: permission denied 权限不足

    **解决方案：**

    1. 使用 sudo 提升权限后重试（MacOS / Linux）
    2. 以管理员身份运行命令行（Windows）
    3. 使用 npx 方式直接启动 `npx @z_ai/coding-helper`
    4. 推荐使用 nvm 工具管理 Node.js 版本，避免全局权限问题
  </Accordion>

  <Accordion title="API Key 无效">
    **问题：** 收到 API Key 无效的错误

    **解决方案：**

    1. 确认 API Key 是否正确复制
    2. 检查 API Key 对应账户是否有足够的余额
  </Accordion>

  <Accordion title="连接超时">
    **问题：** 服务连接超时

    **解决方案：**

    1. 检查网络连接
    2. 确认防火墙设置
    3. 确认 Node.js 与网络环境已就绪
  </Accordion>
</AccordionGroup>
