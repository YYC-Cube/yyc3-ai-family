> ## Documentation Index
>
> Fetch the complete documentation index at: <https://docs.bigmodel.cn/llms.txt>
> Use this file to discover all available pages before exploring further.

# 常见问题

## 一、套餐详情

**Q：GLM Coding Plan 是否已支持 GLM-5 ？如何切换使用的模型？**

**A：** **当前 Max 与 Pro 套餐均已支持 GLM-5**，后续待新老模型资源迭代完成，Lite 也将支持 GLM-5。所有套餐均支持 GLM-4.7 及历史文本模型，现阶段调用 GLM-5 会占用比历史模型更多的套餐额度。

<Tip>
  Claude Code 内部模型环境变量与 GLM 模型对应关系，默认配置如下：

* `ANTHROPIC_DEFAULT_OPUS_MODEL`：`GLM-4.7`
* `ANTHROPIC_DEFAULT_SONNET_MODEL`：`GLM-4.7`
* `ANTHROPIC_DEFAULT_HAIKU_MODEL`：`GLM-4.5-Air`

  注：套餐已支持的用户使用 GLM-5，需要在自定义配置（如 Claude Code 中的 `~/.claude/settings.json`）中，手动修改模型为 "glm-5"。
</Tip>

***

**Q: 为什么调用 GLM-5 时额度消耗更快？有没有节省额度的方式？**

**A:** 由于 GLM-5 的参数规模相比上一代模型扩展了两倍之多，模型能力显著提升的同时，也会占用更多算力资源。**调用 GLM-5 时用量将按照 "高峰期 3 倍，非高峰期 2 倍" 进行计算抵扣；** 我们推荐您在复杂任务上切换至 GLM-5 处理，普通任务上继续使用 GLM-4.7，以避免套餐用量额度消耗过快。注：高峰期为每日的 14:00～18:00 （UTC+8）。

**更节省额度的使用建议:**

* GLM-4.7 对标 Claude 的 Sonnet 级模型，日常开发与常规任务使用 GLM-4.7 即可
* GLM-5 对标 Claude 的 Opus 级模型，复杂推理、大型工程任务等高难度场景再切换至 GLM-5
  通过合理搭配不同模型能力层级，可以在保证效果的同时，更高效地控制额度消耗。

**建议配置（以 Claude Code 为例）：**

* 编辑或新增 `settings.json` 文件
* MacOS & Linux 为 `~/.claude/settings.json`
* Windows 为用户目录`/.claude/settings.json`
* 新增或修改里面的`env` 字段
* 注意替换里面的 `your_zhipu_api_key` 为您上一步获取到的 API Key

```
{
    "env": {
        "ANTHROPIC_AUTH_TOKEN": "your_zhipu_api_key",
        "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
        "API_TIMEOUT_MS": "3000000",
        "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": 1,
        "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5",
        "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7",
        "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air"
    }
}

```

***

**Q：为什么限量购买？要限制到什么时候？**

**A：** 近期用户量激增，大家的热情超出了我们的预期，也因此有部分用户出现高峰期并发报错的情况。为了保障用户体验，我们不得不短期进行限售处理。

**限售从1月23日10:00开启，后续每日10:00（UTC+8）释放新库存，Lite、Pro、Max 套餐每日可售数量相同。**

**开启续订或在订阅有效期内升级套餐的用户不受限售影响。**

我们也正在最高优协调资源，待缓解后会取消限售，感谢理解！

***

**Q：套餐的用量额度大概有多少？**

**A:** 为了管理资源并确保所有用户的公平访问，我们进行每 5 小时的限额和每周使用额度限制，您可以在 [用量统计](https://www.bigmodel.cn/usercenter/glm-coding/usage) 中查看您的额度消耗进展。一次prompt指一次提问，每次 prompt 预计可调用模型 15-20 次。

**每月可用额度按 API 定价折算，相当于月订阅费用的 15–30 倍（已计入周限额影响）。**

|   套餐类型  | 每 5 小时限额 | 每周限额 |
| :-----: | :----: | :----: |
| Lite 套餐 | 最多约 80 次 prompts | 最多约 400 次 prompts |
|  Pro 套餐 | 最多约 400 次 prompts | 最多约 2000 次 prompts |
|  Max 套餐 | 最多约 1600 次 prompts | 最多约 8000 次 prompts |

***

## 二、调用 MCP

**Q：哪个套餐包含视觉理解、联网搜索、网页读取 MCP 工具？**

**A：** 所有等级套餐都支持，但 Lite 套餐仅包含少量额度尝鲜。

***

## 三、管理订阅

**Q: 我的订阅会自动续费吗？**

**A:** 会。订阅将在每个计费周期结束时自动续费，费用会从您绑定的支付方式中扣除。

***

## 四、套餐升级

**Q: 如何升级我的套餐？**

**A:** 在订阅管理中选择"升级"，支付差额后即可立即生效。

***

## 五、使用问题

**Q：为什么购买了编码套餐还报错"1113余额不足"？**

**A：** 需满足 GLM Coding Plan 编码套餐的使用条件：

1. 只能在支持的编码工具中使用
2. 配置特定的 baseurl 地址：

* Claude Code: `https://open.bigmodel.cn/api/anthropic`
* Cherry Studio: `https://open.bigmodel.cn/api/coding/paas/v4/`
* 其他工具: `https://open.bigmodel.cn/api/coding/paas/v4`
