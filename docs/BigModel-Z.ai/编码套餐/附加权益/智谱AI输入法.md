# 智谱AI输入法

> ## Documentation Index
>
> Fetch the complete documentation index at: <https://docs.bigmodel.cn/llms.txt>
> Use this file to discover all available pages before exploring further.

# 智谱AI输入法

## 产品简介

<Tip>
  智谱AI输入法是一款基于先进AI技术的智能语音输入助手，通过简单的Fn快捷键操作，即可将您的语音实时转换为高质量文字。产品可在微信、飞书、Word、代码编辑器等各类输入框中使用，无论是日常聊天、工作文档还是专业术语，都能准确识别并转换，大幅提升您的输入效率。**（现已同时支持 macOS 与 Windows 系统）**
</Tip>

<Note>
  当前智谱AI输入法已面向公众永久免费使用，所有 GLM Coding Plan 的用户每月首次【使用智谱 AI 输入法】时可获得 1000 积分，积分可用于 [AutoGLM 网页端](https://autoglm.zhipuai.cn/) 视频总结等高阶功能。
</Note>

<CardGroup cols={3}>
  <Card title="精准识别" icon={<svg style={{maskImage: "url(/resource/icon/shield-check.svg)", WebkitMaskImage: "url(/resource/icon/shield-check.svg)", maskRepeat: "no-repeat", maskPosition: "center center",}} className={"h-6 w-6 bg-primary dark:bg-primary-light !m-0 shrink-0"} />}>
    错误率极低，专属词汇、中英混合、行业术语识别表现优异
  </Card>

  <Card title="内置多重人设" icon={<svg style={{maskImage: "url(/resource/icon/stars.svg)", WebkitMaskImage: "url(/resource/icon/stars.svg)", maskRepeat: "no-repeat", maskPosition: "center center",}} className={"h-6 w-6 bg-primary dark:bg-primary-light !m-0 shrink-0"} />}>
    在菜单栏一键切换不同内置人设，适应不同对话场景
  </Card>

  <Card title="语音召唤AI" icon={<svg style={{maskImage: "url(/resource/icon/headset.svg)", WebkitMaskImage: "url(/resource/icon/headset.svg)", maskRepeat: "no-repeat", maskPosition: "center center",}} className={"h-6 w-6 bg-primary dark:bg-primary-light !m-0 shrink-0"} />}>
    选中文本或轻呼 “小凹”，即可唤醒GLM模型，通过语音直接下达复杂任务指令
  </Card>
</CardGroup>

## 使用方法

### 1. 安装与设置

<Info>
  现已同时支持 macOS 与 Windows 系统
</Info>

* 访问[智谱AI输入法](https://autoglm.zhipuai.cn/autotyper/)官网下载并安装应用
* 使用与 GLM Coding Plan 套餐相同手机号登录
* 完成新手引导，了解基本操作（新手引导很重要！）
* 设置偏好人设和语音输入快捷键
* 设置专属热词： 在设置菜单中找到“词典”，添加您常用的专属名词，让识别更默契。

![Description](https://cdn.bigmodel.cn/markdown/1764643928622Gemini_Generated_Image_utwr2xutwr2xutwr.png?attname=Gemini_Generated_Image_utwr2xutwr2xutwr.png)

### 2. 基本操作

* 在任意输入框中，按住 Fn键(MAC)/右Control或者Alt+空格(Win) 激活语音输入
* 说话内容将实时转换为文字
* 松开 Fn键(MAC)/右Control或者Alt+空格(Win)，文字自动输入到光标位置

### 3. 高级功能

* 切换不同人设，适应不同场景
* 选中文本，按住 Fn键(MAC)/右Control或者Alt+空格(Win) 激活语音输入，发出指令
* 按住 Fn键(MAC)/右Control或者Alt+空格(Win)，语音唤起“小凹”，随后发出指令，立即解决任务；（“小凹，给我做一个北京3天的旅游攻略”）
* 使用历史记录查看和管理之前的输入

## Voice Coding 场景案例

<Note>
  在「人设」页选中「命令行大神」即可复现以下CASE。
</Note>

### 一、 运维与监控：高频操作零延迟

<Tip>
  解决痛点：日常敲击次数最多、最枯燥的指令，用语音瞬间完成。
</Tip>

<Tabs>
  <Tab title="Case 1：进程与资源监控">
    * 语音指令：“显示所有 python 进程。”
    * 智谱AI输入法：`ps aux | grep python`
    * 语音指令：“查看当前文件夹硬盘占用。”
    * 智谱AI输入法：`du -sh` .
  </Tab>

  <Tab title="Case 2：可视化依赖分析">
    * 语音指令：“树形结构显示进程间依赖。”
    * 智谱AI输入法：`ps -ef --forest` (或 `pstree`)
  </Tab>
</Tabs>

### 二、 复杂命令与工具：告别参数记忆

<Tip>
  解决痛点：工具极其强大，但参数极其难记，手写极易出错。
</Tip>

<Tabs>
  <Tab title="Case 3：多媒体黑科技（🌟 重点推荐）">
    * 语音指令：“把 demo.mp4 转成 GIF，只要前 3 秒，宽度缩放到 320。”
    * 智谱AI输入法：`ffmpeg -i demo.mp4 -t 3 -vf scale=320:-1 output.gif`
  </Tab>

  <Tab title="Case 4：Python 环境管理">
    * 语音指令：“pip 安装 transformer库”
    * 智谱AI输入法： `pip install transformers`
  </Tab>
</Tabs>

### 三、 数据库查询

<Tip>
  解决痛点：跳过样板代码，直接将业务逻辑转换为 SQL 语句
</Tip>

<Tabs>
  <Tab title="Case 5：MySQL">
    * 语音指令：“查询用户表中年龄大于 30 且部门是‘技术部’的人。”
    * 智谱AI输入法：
      `SELECT * FROM employees WHERE age > 30 AND department = '技术部';`
  </Tab>
</Tabs>

### 四、 趣味与实用

<Tip>
  好玩，爱玩
</Tip>

<Tabs>
  <Tab title="Case 6：一句话查天气">
    * 语音指令：“查一下北京今天的天气。”
    * 智谱AI输入法：`curl wttr.in/beijing`
  </Tab>

  <Tab title="Case 7：一句话查汇率">
    * 语音指令：“查询一下人民币对美元的汇率”
    * 智谱AI输入法：`curl -s "https://api.exchangerate-api.com/v4/latest/CNY" | grep -o '"USD":[0-9.]*' | cut -d: -f2`
  </Tab>
</Tabs>
