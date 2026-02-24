# AutoGLM-OpenClaw

> ## Documentation Index
>
> Fetch the complete documentation index at: <https://docs.bigmodel.cn/llms.txt>
> Use this file to discover all available pages before exploring further.

# AutoGLM-OpenClaw

<Note>
  本权益仅限 **Coding Plan Pro** 及 **Coding Plan Max** 用户领取，普通用户如需体验可以使用AutoGLM积分进行兑换。
  提供**一对一专属云电脑**，设备**24小时不关机**。👉[点击领取](https://bigmodel.cn/usercenter/glm-coding/overview)
</Note>

## 产品简介

AutoGLM-OpenClaw 是一款强大的 AI Agent 执行工具，可在云端运行的个人 AI 助手与自动化执行代理。它能够将大语言模型接入飞书平台，并帮助用户自动完成多类型任务，例如：

* **个人信息简报**：汇总您关注的邮件、日历安排及新闻动态。
* **研究与内容撰写**：快速完成资料调研、内容摘要，以及邮件或文档初稿撰写。
* **提醒与任务跟进**：支持定时任务或周期提醒，帮助管理待办事项。
* **浏览器自动化**：自动填写表单、采集数据，并重复执行网页操作流程。
* **跨设备协同**：可通过手机下发任务，由服务器端网关执行，并在聊天中返回结果。

<Info>
  需要注意的是，AutoGLM-OpenClaw 拥有较高的系统访问权限，同时支持开放插件生态，存在潜在安全风险。安装和配置时请务必谨慎，确保使用环境安全可靠。
</Info>

## 活动及权益时间

1. 领取时间：**2月10日—3月10日**；
2. 使用时长：**31天**（3月10日领取也可享完整31天，**4月10日**前用完即可）；
3. Plan续费入口：**4月10日**下线。

## 权益领取流程及注意事项

<Steps>
  <Step title="在 BigModel 平台订阅 GLM Coding Plan - Max/Pro 套餐的用户可点击下方链接进行领取。">
    👉[点击领取](https://bigmodel.cn/usercenter/glm-coding/overview)

    ![Description](https://cdn.bigmodel.cn/markdown/1770794210779img_v3_02uq_04f7a594-860f-43ac-858d-f2dff3d414dg.jpg?attname=img_v3_02uq_04f7a594-860f-43ac-858d-f2dff3d414dg.jpg)
  </Step>

  <Step title="Coding Plan 用户兑换前需授权（用手机号核实会员权益）">
    ![Description](https://cdn.bigmodel.cn/markdown/1770891055101image.png?attname=image.png)
    ![Description](https://cdn.bigmodel.cn/markdown/1770891107016image.png?attname=image.png)
  </Step>

  <Step title="会员符合条件、权益有余量即可领取" />

  <Step title="首次可领1天，配置完成后可续费">
    ![Description](https://cdn.bigmodel.cn/markdown/1770891193911image.png?attname=image.png)
  </Step>
</Steps>

## 配置安装

为了让您能够在 AutoGLM 云机中通过飞书便捷地使用 OpenClaw 能力，请仔细阅读本教程，并按照步骤完成配置。

<Tabs>
  <Tab title="方案 A：托管配置">
    <Steps>
      <Step title="环境初始化">
        前往 [AutoGLM](https://autoglm.zhipuai.cn) 官网 ，点击【一键配置】，在右侧云机界面中，扫码登录您的 飞书开放平台账号。
        ![Description](https://cdn.bigmodel.cn/markdown/1770715238831image.png?attname=image.png)
      </Step>

      <Step title="填写模型信息">
        在左侧配置表单中完成以下内容：

        * 模型BASE URL：`https://open.bigmodel.cn/api/coding/paas/v4`
        * 模型名字：`glm-4.7`
        * 模型请求格式：`OpenAI`
        * API KEI：`你的API KEY`

        <Warning>
          请妥善保管您的 API Key，不要泄露给他人，也不要直接硬编码在代码中。
        </Warning>
      </Step>

      <Step title="系统自动配置">
        完成填写后，系统将自动帮您：创建飞书应用 ➡️开启机器人能力 ➡️自动填写飞书 App ID 与 Secret。
      </Step>

      <Step title="系启动使用">
        当页面提示 “配置已就绪” 后，即表示部署完成，您可前往飞书体验。
      </Step>
    </Steps>
  </Tab>

  <Tab title="方案 B：手动配置">
    本教程将引导您完成三部分操作，可直接查看下方视频教程：

    <video src="https://cdn.bigmodel.cn/static/openclaw/OpenClaw飞书配置（新）.mp4" controls />

    <Steps>
      <Step title="获取飞书 ID 和 Key">
        电脑端访问 飞书开放平台 并登录您的飞书账号，创建飞书应用并获取凭证。

        1. 进入“开发者后台”，点击 “创建企业自建应用”。
        2. 填写 应用名称（建议填写 OpenClaw助手 或类似名称），上传应用图标，点击 “创建”。
        3. 在左侧导航栏点击 “添加应用能力”，选择 “机器人” 并点击 “添加”。
        4. 在左侧导航栏进入 “凭据与基础信息” 页面：

        * App ID → 对应 AutoGLM 配置页面的 飞书 ID
        * App Secret → 对应 AutoGLM 配置页面的 飞书 KEY
        * 请妥善保存这两个值，稍后需填入 AutoGLM。
          ![Description](https://cdn.bigmodel.cn/markdown/1770716597670eb629ced2a4db09ce7d1819d3c985dea.png?attname=eb629ced2a4db09ce7d1819d3c985dea.png)
          ![Description](https://cdn.bigmodel.cn/markdown/17707166636982d2baf534cd673f96634a38b37c36db3.png?attname=2d2baf534cd673f96634a38b37c36db3.png)
      </Step>

      <Step title="前往 AutoGLM 平台配置">
        <Tip>
          注意需要先前往 [AutoGLM](https://autoglm.zhipuai.cn) 官网，用积分兑换权益（建议在Chrome浏览器中打开）
        </Tip>

        回到 AutoGLM 配置页面，将准备好的信息填入对应字段：

        1. 模型配置

        请填入您希望 AutoGLM-OpenClaw 使用的大模型服务信息：

        * 模型BASE URL：`https://open.bigmodel.cn/api/coding/paas/v4`
        * 模型名字：`glm-4.7`
        * 模型请求格式：`OpenAI`
        * API KEI：`你的API KEY`

        <Warning>
          请妥善保管您的 API Key，不要泄露给他人，也不要直接硬编码在代码中。
        </Warning>

        2. 飞书配置

        填入在第一步中获取的凭证：

        * 飞书 ID：填入飞书开发者后台的 `App ID`。
        * 飞书 KEY：填入飞书开发者后台的 `App Secret`。
          确认所有信息无误后，点击 “提交配置”。

        <Warning>
          请妥善保管您的 API Key，不要泄露给他人，也不要直接硬编码在代码中。
        </Warning>
      </Step>

      <Step title="配置飞书权限">
        AutoGLM配置成功后，回到飞书开放平台，完成下列配置：

        <Steps>
          <Step title="配置事件订阅">
            1. 在左侧导航栏进入 “事件与回调”。
            2. 配置订阅方式：选择 “长连接”，并点击 “保存”（AutoGLM\*OpenClaw 云端版通过长连接接收消息，无需配置公网 IP）。
            3. 添加事件（以接收群组消息为例，可按需自行添加）：

            * 点击 “添加事件”。
            * 选择 “消息与群组” 分类。
            * 勾选 “接收消息” (im.message.receive\_v1)。
            * 点击确认添加，完成订阅。
              ![Description](https://cdn.bigmodel.cn/markdown/1770717459381image.png?attname=image.png)
          </Step>

          <Step title="配置权限">
            1. 在左侧导航栏进入 “开发配置” -> “权限管理”。
            2. 点击 “批量导入权限”。
            3. 复制以下 JSON 代码，粘贴到输入框中并点击 “导入”

            ```
            {
                "scopes": {
                "tenant": [
                "contact:user.base:readonly",
                "contact:user.employee_id:readonly",
                "contact:user.id:readonly",
                "im:chat",
                "im:chat.access_event.bot_p2p_chat:read",
                "im:chat.members:read",
                "im:chat.moderation:read",
                "im:chat.tabs:read",
                "im:chat.tabs:write_only",
                "im:chat.top_notice:write_only",
                "im:chat:moderation:write_only",
                "im:chat:operate_as_owner",
                "im:chat:read",
                "im:chat:readonly",
                "im:chat:update",
                "im:message",
                "im:message.group_at_msg:readonly",
                "im:message.group_msg",
                "im:message.p2p_msg:readonly",
                "im:message.pins:read",
                "im:message.pins:write_only",
                "im:message.reactions:read",
                "im:message.reactions:write_only",
                "im:message.urgent",
                "im:message.urgent.status:write",
                "im:message:readonly",
                "im:message:send_as_bot",
                "im:message:send_multi_depts",
                "im:message:send_multi_users",
                "im:message:send_sys_msg",
                "im:message:update",
                "im:resource",
                "im:url_preview.update",
                "im:user_agent:read",
                "passport:session_mask:readonly"
                ],
                "user": []
            }
            }
            ```

            <Tip>
              请注意，本代码默认打开全部权限，您可按需进行删减
            </Tip>

            ![Description](https://cdn.bigmodel.cn/markdown/1770717670208image.png?attname=image.png)
          </Step>

          <Step title="发布应用">
            1. 在左侧导航栏进入 “应用发布” -> “版本管理与发布”。
            2. 点击 “创建版本”。
            3. 填写版本号（如 1.0.0）和更新说明。
            4. “可见范围”：建议初期选择 “仅自己” 或指定部门进行测试。
            5. 点击 “保存” 并 “确认发布”（如是企业自建应用，管理员审核通过后即可生效；如果是个人测试租户通常自动通过）。
               ![Description](https://cdn.bigmodel.cn/markdown/1770717755175image.png?attname=image.png)
               ![Description](https://cdn.bigmodel.cn/markdown/1770717768837image.png?attname=image.png)
          </Step>
        </Steps>
      </Step>

      <Step title="连接与验证">
        配置保存成功后，AutoGLM-OpenClaw 将在 AutoGLM 云端自动启动网关。

        1. 打开飞书 APP（手机或电脑端）。
        2. 在“开发者小助手”聊天中点击“打开应用”，或在“工作台”中搜索您刚才发布的 “OpenClaw 助手”
        3. 进入聊天窗口，发送任意消息（例如：“你好”）。
        4. 如果收到机器人的回复，即代表配置成功！
           ![Description](https://cdn.bigmodel.cn/markdown/177071806874930e0e7cd0f43ad955938dbc95ec8e1a1.png?attname=30e0e7cd0f43ad955938dbc95ec8e1a1.png)
           ![Description](https://cdn.bigmodel.cn/markdown/1770718077114ef63dd4221034eac5cbb45a419ab66c8.png?attname=ef63dd4221034eac5cbb45a419ab66c8.png)
      </Step>
    </Steps>
  </Tab>

  <Tab title="常用任务指令">
    | 类型         | 指令               | 功能                                |
    | ---------- | ---------------- | --------------------------------- |
    | 基础与状态      | `/help`          | 显示可用指令                            |
    | 基础与状态      | `/commands`      | 列出所有斜杠指令                          |
    | 基础与状态      | `/status`        | 显示当前状态                            |
    | 基础与状态      | `/whoami`        | 显示你的发送者 ID                        |
    | 基础与状态      | `/usage`         | 显量用截图或成本摘要                        |
    | 基础与状态      | `/weather`       | 获取当前天气和预报（无需 API key）             |
    | 会话管理       | `/new`           | 开始一个新会话                           |
    | 会话管理       | `/reset`         | 重置当前会话                            |
    | 会话管理       | `/stop`          | 停止当前运行                            |
    | 会话管理       | `/restart`       | 重启 Clawdbot                       |
    | 会话管理       | `/compact`       | 压缩会话上下文                           |
    | 会话管理       | `/context`       | 解释上下文是如何构建和使用的                    |
    | 会话管理       | `/model`         | 显示或设置模型                           |
    | 会话管理       | `/models`        | 列出模型提供商或具体模型                      |
    | AI 行为与模型配置 | `/think`         | 设置思考等级（Thinking Level）            |
    | AI 行为与模型配置 | `/reasoning`     | 切换推理过程的可见性                        |
    | AI 行为与模型配置 | `/verbose`       | 切换详细模式                            |
    | AI 行为与模型配置 | `/tts`           | 配置文字转语音（TTS）                      |
    | AI 行为与模型配置 | `/activation`    | 设置群组激活模式                          |
    | AI 行为与模型配置 | `/send`          | 设置发送策略                            |
    | AI 行为与模型配置 | `/queue`         | 调整队列设置                            |
    | 权限与安全      | `/allowlist`     | 列出/添加/移除白名单条目                     |
    | 权限与安全      | `/approve`       | 批准或拒绝执行请求                         |
    | 权限与安全      | `/elevated`      | 切换提权模式（Elevated Mode）             |
    | 权限与安全      | `/exec`          | 设置当前会话的执行默认值                      |
    | 外部集成与工具    | `/github`        | 使用 gh CLI 与 GitHub 交互（issue、pr 等） |
    | 外部集成与工具    | `/gemini`        | 使用 Gemini CLI 进行一次性问答/生成          |
    | 外部集成与工具    | `/notion`        | 使用 Notion API 管理页面和数据库            |
    | 外部集成与工具    | `/slack`         | 通过 Clawdbot 控制 Slack（如发送消息）       |
    | 外部集成与工具    | `/bluebubbles`   | 构建或更新 BlueBubbles 插件              |
    | 外部集成与工具    | `/video_frames`  | 使用 ffmpeg 从视频提取帧或片段               |
    | 技能与代理      | `/skill`         | 按名称运行一项技能                         |
    | 技能与代理      | `/skill_creator` | 创建或更新 AgentSkills                 |
    | 技能与代理      | `/subagents`     | 列出/停止/记录子代理运行情况                   |
  </Tab>
</Tabs>

## 用户案例

<Tabs>
  <Tab title="股票资讯定时任务">
    ![Description](https://cdn.bigmodel.cn/markdown/17707188793926981fb17b406b563f32c09327ddcf032.png?attname=6981fb17b406b563f32c09327ddcf032.png)
  </Tab>

  <Tab title="调研文档">
    ![Description](https://cdn.bigmodel.cn/markdown/17707189016052f1b4cbd6542e48fdded8c3eeb378b12.png?attname=2f1b4cbd6542e48fdded8c3eeb378b12.png)
  </Tab>

  <Tab title="发布社媒内容">
    ![Description](https://cdn.bigmodel.cn/markdown/1770718924632a712c3e09d2828e7c400eb1c71c3788f.png?attname=a712c3e09d2828e7c400eb1c71c3788f.png)
  </Tab>
</Tabs>

## 权益续费规则

1. 续费为**单日续费**，点击即可完成；
2. 账号内可用权益天数**最多累计7天**；
3. 可用天数不足7天时，可点击续费补至7天，所有续费天数累计，总时长不超过31天（即完整权益时长）。

## 温馨提示

1. **设置领取门槛**（如首次仅可领1天），核心目的是避免资源被领取后闲置浪费，确保有限的专属云电脑资源，能精准给到有实际使用需求的用户。
2. **续费相关说明**：即使中途未及时续费、出现断续情况，再次续费时，您的**用户信息、使用上下文、相关配置**都会与账号绑定，不会丢失；续费时系统会重新启动云电脑，重启后所有历史信息均可正常查看、继续使用。

## 常见问题

我们会不定期更新常见问题，您可以点击下方链接进行查看，也可随时咨询相关客服，及时为您解答。

👉 [全部问题请点击](https://zhipu-ai.feishu.cn/wiki/LBl8w3vqqiIbgIko0FFcH01enLb)
