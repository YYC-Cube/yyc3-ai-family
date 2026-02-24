# GLM in Excel（Beta）

> ## Documentation Index
>
> Fetch the complete documentation index at: <https://docs.bigmodel.cn/llms.txt>
> Use this file to discover all available pages before exploring further.

# GLM in Excel（Beta）

## 产品概述

GLM in Excel 是适配 Excel 官方的 AI 插件，以侧边栏集成和展示，通过自然语言交互赋能表格工作流，实现 **数据解释、公式生成、图表可视化、公式错误检测与修复、跨sheet页查询** 等任务的自动化执行。

核心由 GLM-5 模型、Agent SDK/Agent loop、Skills等模块驱动，适配 Microsoft 365 的 Excel 环境，其核心交互与能力如下：

* **自然语言驱动**：在侧边栏输入指令（如 “制作可视化图表”“修复 #REF! 错误”），GLM 直接解析并操作表格，生成可追溯的单元格级引用。
* **闭环执行流程**：Agent 拆解任务 → 调用相应的 tools → Agent Loop 校验结果 → 在 Excel 中直接修改并高亮变更，全程不离开表格环境

<Tip>
  GLM in Excel 插件目前仅支持 GLM-5 配置及调用。
</Tip>

<video className="m-0 p-1" src="https://cdn.bigmodel.cn/static/platform/docs/GLM_in_Excel.mp4" controls />

<Info>
  视频展示功能点：

  **1. 图表生成：** 一键生成可视化并美化

  **2. 错误修复：** 自动检测并修复公式错误

  **3. 多 Sheet 导航/vlookup：** 跨工作表自动操作
</Info>

## 优势亮点

* **长上下文深度解析**：依托 GLM-5大上下文，支持十万级单元格与跨表 / 跨文件依赖解析，提供单元格级引用溯源。
* **精准公式与排错**：自然语言生成 / 修改公式，诊断 #REF!、#VALUE!、循环引用等并给修复方案，更新假设时保留公式依赖，降低人工校验成本。
* **工具调用（Tool Use）** ：一次指令同时触发「读取数据→分析结构→选择图表类型→配色→插入图表」多步操作链，体现模型的多步规划与执行能力（Agentic Planning）。
* **语义级理解（Semantic Understanding）** ：不是简单的「数据→图」映射，而是理解「厂商」是分类维度、「ELO分数」是排序指标、「投票数」是置信度指标，从而自主决定图表类型和配色策略。
* **跨上下文结构理解（Cross-context Structure Parsing）** ：模型需要同时理解 3 个 Sheet 的表结构，识别「产品编码」是跨表连接键，判断哪些字段该用 VLOOKUP（一对一查询）、哪些该用 SUMIF（一对多汇总）。这要求模型具备数据建模级别的理解能力。

## 适用场景

<Tabs>
  <Tab title="企业财务（FP&A / 会计 / 审计）">
    * **预算与预测：** 多部门预算自动分摊，支持假设场景切换，生成动态预算表。
    * **财务审计：** 追踪单元格引用，定位公式错误，生成审计线索，确保数据可追溯。
    * **数据治理：** 批量清洗 ERP 导出数据，统一格式，自动识别异常值并标注。
  </Tab>

  <Tab title="零售与电商（运营 / 供应链）">
    * **销售复盘：** 整合多平台订单数据，生成区域 / 渠道 / 产品维度的可视化报表。
    * **库存优化：** 分析历史消耗数据，计算安全库存阈值，生成补货公式与预警。
    * **促销效果模拟：** 模拟价格 / 折扣调整对利润影响，输出敏感性分析与瀑布图。
  </Tab>

  <Tab title="咨询与专业服务">
    * **客户数据中台：** 合并多源 Excel 数据，按客户 ID 对齐，生成行业对标看板。
    * **项目交付提效：** 批量处理客户报表，自动生成 PPT 可用的图表与结论，缩短交付周期。
    * **模型复用：** 将方法论固化为 Excel 模板，用自然语言一键生成定制化分析报告。
  </Tab>

  <Tab title="制造业与供应链">
    * **生产排程优化：** 基于订单 / 产能数据，生成最优排程表，支持多场景模拟。
    * **成本核算：** 自动分摊直接 / 间接成本，生成成本分析表，定位降本空间。
    * **供应链风控：** 分析供应商数据，识别交付风险，生成风险评级与备选方案。
  </Tab>
</Tabs>

## 配置步骤

<Tabs>
  <Tab title="Windows 配置步骤">
    **第一步：确认已安装 Microsoft Excel**

    在开始安装插件前，请确保：

    * 电脑已安装 **Microsoft Excel（Microsoft 365 或 Office 2016 及以上版本）**
    * Excel 可以正常打开
    * 当前账户具有本机文件读写权限

    如果尚未安装 Excel，请先安装 Microsoft Office 后再继续以下步骤。

    **第二步：下载清单文件**

    请在浏览器中打开以下地址：`https://office-addin.bigmodel.cn/manifest.prod.xml` ，下载文件：`manifest.prod.xml`。

    下载完成后，请确认：

    * 文件名称为 `manifest.prod.xml`

    **第三步：将文件放入 Wef 文件夹并开启共享**

    **1. 打开 Wef 文件夹**

    按下：`Win + R` ，在运行窗口中输入：`%LOCALAPPDATA%\Microsoft\Office\16.0\Wef` ，按回车键。

    ![Description](https://cdn.bigmodel.cn/markdown/1770815630641image.png?attname=image.png)

    **2. 放入清单文件**

    将：`manifest.prod.xml` 复制到：`Wef 文件夹根目录`。

    ![Description](https://cdn.bigmodel.cn/markdown/1770815639076image.png?attname=image.png)

    <Tip>
      **注意事项：**

      * 不要放入子文件夹
      * 文件后缀必须为 `.xml`
      * 不要修改文件名
    </Tip>

    **3. 配置共享**

    1. 右键点击 **Wef 文件夹**

    2. 选择 **属性**

    ![Description](https://cdn.bigmodel.cn/markdown/1770815644423image.png?attname=image.png)

    3. 切换到 **共享** 选项卡

    ![Description](https://cdn.bigmodel.cn/markdown/1770815650607image.png?attname=image.png)

    4. 点击：`共享(S)...` `添加`

    5. 将权限级别改为：`读取/写入`

    6. 点击：`共享`

    ![Description](https://cdn.bigmodel.cn/markdown/1770815655779image.png?attname=image.png)

    共享成功后，会显示类似如下的网络路径：`\你的电脑名\Wef` ，请记录该路径，后续需要使用。

    ![Description](https://cdn.bigmodel.cn/markdown/1770815660667image.png?attname=image.png)

    **第四步：在 Excel 中信任共享路径**

    完成共享后，需要在 Excel 中将该网络路径添加为“受信任的加载项目录”。

    **1. 打开信任中心**

    在 Excel 中依次点击：`文件 → 选项 → 信任中心 → 信任中心设置(T)...`

    ![Description](https://cdn.bigmodel.cn/markdown/1770815667692image.png?attname=image.png)

    ![Description](https://cdn.bigmodel.cn/markdown/1770815683731image.png?attname=image.png)

    **2. 添加受信任的加载项目录**

    1. 在左侧选择：`受信任的加载项目录`。
    2. 在 “目录 URL(U)” 输入框中填写共享路径，例如：`\DESKTOP-XXXX\Wef`（请替换为你实际的电脑名称）。
    3. 点击：`添加目录(D)`。
    4. 勾选：`在菜单中显示`。
    5. 点击确定保存设置。

    ![Description](https://cdn.bigmodel.cn/markdown/1770815690494image.png?attname=image.png)

    **3. 重启 Excel**

    关闭 Excel，然后重新打开。 Excel 需要重启才能识别新的加载目录。

    **第五步：在 Excel 中加载插件**

    重新打开 Excel 后：

    1. 点击顶部菜单：`插入`
    2. 点击：`我的加载项`
    3. 在弹出窗口顶部选择：`共享文件夹`
    4. 找到插件
    5. 点击：`添加`

    插件加载完成后，即可在 Excel 中使用。
  </Tab>

  <Tab title="Mac配置步骤">
    **第一步：确认已安装 Microsoft Excel**

    在开始安装插件前，请确保：

    * 已安装 **Microsoft Excel for Mac（Microsoft 365 或 Office 2019 及以上版本）**
    * Excel 可以正常启动
    * 当前用户账户具有文件读写权限

    如果尚未安装 Excel，请先完成 Office 安装后再继续以下步骤。

    **第二步：下载清单文件**

    请在浏览器中打开以下地址： `https://office-addin.bigmodel.cn/manifest.prod.xml` ，下载文件：`manifest.prod.xml`。

    下载完成后请确认：

    * 文件名称为 `manifest.prod.xml`

    **第三步：打开 Mac 上的 Wef 文件夹**

    在 macOS 上，Wef 目录通常位于： `~/Library/Containers/com.microsoft.Excel/Data/Documents/wef/` ，如未找到 **wef** 文件夹，请按以下步骤打开目录并创建：

    1. 打开 **Finder**
    2. 点击顶部菜单 **前往 → 前往文件夹…**
    3. 输入：`~/Library/Containers/com.microsoft.Excel/Data/Documents/`
    4. 若没有 `wef` 文件夹，请新建一个名为 **wef**（全小写）的文件夹

    **第四步：复制 manifest 文件**

    将下载好的：`manifest.prod.xml` ，复制到：`wef 文件夹根目录`。

    <Tip>
      **注意事项：**

      * 不要放入子文件夹
      * 不要修改文件名
      * 文件后缀必须为 `.xml`
    </Tip>

    ![Description](https://cdn.bigmodel.cn/markdown/1770816426210image.png?attname=image.png)

    **第五步：重新启动 Excel**

    1. 完全退出 Excel
    2. 重新打开 Excel 后：点击顶部菜单：`插入`
    3. 点击：`我的加载项`的下拉项
    4. 找到插件
    5. 点击：`添加`

    插件加载完成后，即可在 Excel 中使用。
  </Tab>
</Tabs>
