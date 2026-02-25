# Hooks 使用指南

> BigModel-Z.ai SDK React Hooks 详细使用说明、技巧指南和错误解决

## 📚 目录

- [useBigModel](#usebigmodel)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

---

## useBigModel

### 📖 使用说明

`useBigModel` 是一个 React Hook，用于在 React 组件中方便地使用 BigModel-Z.ai SDK。

#### 基础用法

```typescript
import { useBigModel } from '@bigmodel-z/sdk/hooks'

function ChatComponent() {
  const { chat, loading, error } = useBigModel({
    apiKey: 'your-api-key',
    assistantId: '65940acff94777010aa6b796',
  })

  const handleSendMessage = async (message: string) => {
    const response = await chat([
      { role: 'user', content: message },
    ])
    console.log(response.choices[0].message.content)
  }

  return (
    <div>
      {loading && <p>加载中...</p>}
      {error && <p>错误: {error.message}</p>}
      <button onClick={() => handleSendMessage('你好')}>
        发送消息
      </button>
    </div>
  )
}
```

#### 流式对话

```typescript
function StreamingChatComponent() {
  const { chatStream, loading, error } = useBigModel({
    apiKey: 'your-api-key',
    assistantId: '65940acff94777010aa6b796',
  })

  const [streamText, setStreamText] = useState('')

  const handleStreamMessage = async (message: string) => {
    setStreamText('')
    const stream = await chatStream([
      { role: 'user', content: message },
    ])

    for await (const chunk of stream) {
      setStreamText(prev => prev + chunk)
    }
  }

  return (
    <div>
      <p>{streamText}</p>
      <button onClick={() => handleStreamMessage('介绍一下你自己')}>
        开始流式对话
      </button>
    </div>
  )
}
```

### 💡 技巧指南

#### 1. 环境变量配置

使用环境变量管理配置：

```typescript
import { useBigModel } from '@bigmodel-z/sdk/hooks'

function ChatComponent() {
  const { chat } = useBigModel({
    apiKey: process.env.NEXT_PUBLIC_BIGMODEL_API_KEY,
    assistantId: process.env.NEXT_PUBLIC_ASSISTANT_ID,
  })

  // ...
}
```

#### 2. 错误边界

使用错误边界捕获错误：

```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>出错了</h2>
          <p>{this.state.error?.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  return (
    <ErrorBoundary>
      <ChatComponent />
    </ErrorBoundary>
  )
}
```

#### 3. 消息历史管理

管理对话历史：

```typescript
function ChatWithHistory() {
  const { chat } = useBigModel({
    apiKey: 'your-api-key',
    assistantId: '65940acff94777010aa6b796',
  })

  const [messages, setMessages] = useState<any[]>([])

  const handleSendMessage = async (userMessage: string) => {
    const newMessages = [
      ...messages,
      { role: 'user', content: userMessage },
    ]
    setMessages(newMessages)

    const response = await chat(newMessages)
    setMessages([
      ...newMessages,
      { role: 'assistant', content: response.choices[0].message.content },
    ])
  }

  return (
    <div>
      {messages.map((msg, index) => (
        <div key={index}>
          <strong>{msg.role}:</strong> {msg.content}
        </div>
      ))}
      <input
        type="text"
        onKeyPress={e => {
          if (e.key === 'Enter') {
            handleSendMessage(e.currentTarget.value)
          }
        }}
      />
    </div>
  )
}
```

#### 4. 防抖处理

使用防抖优化频繁请求：

```typescript
import { useDebounce } from 'use-debounce'

function DebouncedChat() {
  const { chat } = useBigModel({
    apiKey: 'your-api-key',
    assistantId: '65940acff94777010aa6b796',
  })

  const [input, setInput] = useState('')
  const [debouncedInput] = useDebounce(input, 500)

  useEffect(() => {
    if (debouncedInput) {
      chat([{ role: 'user', content: debouncedInput }])
    }
  }, [debouncedInput, chat])

  return (
    <input
      type="text"
      value={input}
      onChange={e => setInput(e.target.value)}
      placeholder="输入消息（自动防抖）"
    />
  )
}
```

#### 5. 请求取消

使用 AbortController 取消请求：

```typescript
function CancellableChat() {
  const { chat } = useBigModel({
    apiKey: 'your-api-key',
    assistantId: '65940acff94777010aa6b796',
  })

  const [controller, setController] = useState<AbortController | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSendMessage = async (message: string) => {
    // 取消之前的请求
    if (controller) {
      controller.abort()
    }

    const newController = new AbortController()
    setController(newController)
    setLoading(true)

    try {
      const response = await chat(
        [{ role: 'user', content: message }],
        { signal: newController.signal },
      )
      console.log(response.choices[0].message.content)
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('请求失败:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={() => handleSendMessage('你好')}>
        发送消息
      </button>
      {loading && (
        <button onClick={() => controller?.abort()}>
          取消
        </button>
      )}
    </div>
  )
}
```

### ❌ 常见错误及解决

#### 错误 1: Hook called outside of component

**原因：** Hook 在组件外部调用

**解决方法：**
```typescript
// ❌ 错误
const { chat } = useBigModel(config)

// ✅ 正确
function Component() {
  const { chat } = useBigModel(config)
  return <div>...</div>
}
```

#### 错误 2: Too many re-renders

**原因：** 配置对象在每次渲染时重新创建

**解决方法：**
```typescript
// ❌ 错误
function Component() {
  const { chat } = useBigModel({
    apiKey: 'your-api-key',
    assistantId: '65940acff94777010aa6b796',
  })
  return <div>...</div>
}

// ✅ 正确
function Component() {
  const config = useMemo(() => ({
    apiKey: 'your-api-key',
    assistantId: '65940acff94777010aa6b796',
  }), [])

  const { chat } = useBigModel(config)
  return <div>...</div>
}
```

#### 错误 3: API Key is undefined

**原因：** API Key 未设置或环境变量未加载

**解决方法：**
```typescript
function Component() {
  const apiKey = process.env.NEXT_PUBLIC_BIGMODEL_API_KEY

  if (!apiKey) {
    return <div>错误: API Key 未设置</div>
  }

  const { chat } = useBigModel({ apiKey })
  return <div>...</div>
}
```

#### 错误 4: Memory leak

**原因：** 组件卸载后仍在更新状态

**解决方法：**
```typescript
function Component() {
  const { chat } = useBigModel(config)
  const [response, setResponse] = useState('')
  const mountedRef = useRef(true)

  const handleSendMessage = async (message: string) => {
    const result = await chat([{ role: 'user', content: message }])

    // 检查组件是否已卸载
    if (mountedRef.current) {
      setResponse(result.choices[0].message.content)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  return <div>{response}</div>
}
```

---

## 最佳实践

### 1. 配置管理

使用 Context API 管理全局配置：

```typescript
import { createContext, useContext } from 'react'

const BigModelConfigContext = createContext({
  apiKey: '',
  assistantId: '',
})

export function BigModelConfigProvider({
  apiKey,
  assistantId,
  children,
}: {
  apiKey: string
  assistantId: string
  children: React.ReactNode
}) {
  return (
    <BigModelConfigContext.Provider value={{ apiKey, assistantId }}>
      {children}
    </BigModelConfigContext.Provider>
  )
}

export function useBigModelConfig() {
  return useContext(BigModelConfigContext)
}

function ChatComponent() {
  const { apiKey, assistantId } = useBigModelConfig()
  const { chat } = useBigModel({ apiKey, assistantId })

  return <div>...</div>
}
```

### 2. 类型安全

使用 TypeScript 类型定义：

```typescript
interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

function TypedChatComponent() {
  const { chat } = useBigModel<ChatResponse>(config)

  const handleSendMessage = async (message: string) => {
    const response: ChatResponse = await chat([
      { role: 'user', content: message } as Message,
    ])
    console.log(response.choices[0].message.content)
  }

  return <div>...</div>
}
```

### 3. 性能优化

使用 React.memo 和 useMemo 优化性能：

```typescript
const MessageItem = React.memo(({ message }: { message: Message }) => {
  return (
    <div>
      <strong>{message.role}:</strong> {message.content}
    </div>
  )
})

function OptimizedChatComponent() {
  const { chat } = useBigModel(config)
  const [messages, setMessages] = useState<Message[]>([])

  const messageList = useMemo(() => {
    return messages.map((msg, index) => (
      <MessageItem key={index} message={msg} />
    ))
  }, [messages])

  return <div>{messageList}</div>
}
```

### 4. 加载状态

提供更好的加载体验：

```typescript
function LoadingChatComponent() {
  const { chat, loading } = useBigModel(config)
  const [response, setResponse] = useState('')

  const handleSendMessage = async (message: string) => {
    setResponse('')
    const result = await chat([{ role: 'user', content: message }])
    setResponse(result.choices[0].message.content)
  }

  return (
    <div>
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>AI 正在思考...</p>
        </div>
      )}
      <p>{response}</p>
      <button onClick={() => handleSendMessage('你好')}>
        发送消息
      </button>
    </div>
  )
}
```

### 5. 错误处理

实现完善的错误处理：

```typescript
function ErrorHandlingChatComponent() {
  const { chat, error } = useBigModel(config)
  const [localError, setLocalError] = useState<Error | null>(null)

  const handleSendMessage = async (message: string) => {
    try {
      setLocalError(null)
      const result = await chat([{ role: 'user', content: message }])
      console.log(result.choices[0].message.content)
    } catch (err) {
      setLocalError(err as Error)
    }
  }

  return (
    <div>
      {error && <div className="error">配置错误: {error.message}</div>}
      {localError && <div className="error">请求错误: {localError.message}</div>}
      <button onClick={() => handleSendMessage('你好')}>
        发送消息
      </button>
    </div>
  )
}
```

---

## 常见问题

### Q1: 如何在 Next.js 中使用？

**A:** 在 Next.js 中使用时，需要确保 API Key 在客户端可用：

```typescript
// .env.local
NEXT_PUBLIC_BIGMODEL_API_KEY=your-api-key
NEXT_PUBLIC_ASSISTANT_ID=65940acff94777010aa6b796

// components/Chat.tsx
'use client'

import { useBigModel } from '@bigmodel-z/sdk/hooks'

export default function Chat() {
  const { chat } = useBigModel({
    apiKey: process.env.NEXT_PUBLIC_BIGMODEL_API_KEY!,
    assistantId: process.env.NEXT_PUBLIC_ASSISTANT_ID!,
  })

  return <div>...</div>
}
```

### Q2: 如何实现多轮对话？

**A:** 维护消息历史：

```typescript
function MultiTurnChat() {
  const { chat } = useBigModel(config)
  const [messages, setMessages] = useState<Message[]>([])

  const handleSendMessage = async (userMessage: string) => {
    const newMessages = [
      ...messages,
      { role: 'user', content: userMessage },
    ]
    setMessages(newMessages)

    const response = await chat(newMessages)
    setMessages([
      ...newMessages,
      { role: 'assistant', content: response.choices[0].message.content },
    ])
  }

  return (
    <div>
      {messages.map((msg, index) => (
        <div key={index}>
          <strong>{msg.role}:</strong> {msg.content}
        </div>
      ))}
      <input
        type="text"
        onKeyPress={e => {
          if (e.key === 'Enter') {
            handleSendMessage(e.currentTarget.value)
          }
        }}
      />
    </div>
  )
}
```

### Q3: 如何处理流式响应？

**A:** 使用流式对话并更新状态：

```typescript
function StreamingChat() {
  const { chatStream } = useBigModel(config)
  const [streamText, setStreamText] = useState('')

  const handleStreamMessage = async (message: string) => {
    setStreamText('')
    const stream = await chatStream([{ role: 'user', content: message }])

    for await (const chunk of stream) {
      setStreamText(prev => prev + chunk)
    }
  }

  return (
    <div>
      <p>{streamText}</p>
      <button onClick={() => handleStreamMessage('介绍一下你自己')}>
        开始流式对话
      </button>
    </div>
  )
}
```

### Q4: 如何实现请求重试？

**A:** 实现重试逻辑：

```typescript
function RetryChat() {
  const { chat } = useBigModel(config)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  const handleSendMessage = async (message: string) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await chat([{ role: 'user', content: message }])
        console.log(response.choices[0].message.content)
        setRetryCount(0)
        return
      } catch (error) {
        if (i === maxRetries - 1) {
          console.error('重试失败:', error)
          return
        }
        setRetryCount(i + 1)
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, i) * 1000)
        )
      }
    }
  }

  return (
    <div>
      <button onClick={() => handleSendMessage('你好')}>
        发送消息
      </button>
      {retryCount > 0 && <p>重试中... ({retryCount}/{maxRetries})</p>}
    </div>
  )
}
```

### Q5: 如何监控 API 使用量？

**A:** 记录使用量：

```typescript
function UsageMonitoringChat() {
  const { chat } = useBigModel(config)
  const [totalTokens, setTotalTokens] = useState(0)

  const handleSendMessage = async (message: string) => {
    const response = await chat([{ role: 'user', content: message }])
    
    const tokens = response.usage?.total_tokens || 0
    setTotalTokens(prev => prev + tokens)
    
    console.log('本次使用:', tokens, 'tokens')
    console.log('总计使用:', totalTokens + tokens, 'tokens')
  }

  return (
    <div>
      <p>总计使用: {totalTokens} tokens</p>
      <button onClick={() => handleSendMessage('你好')}>
        发送消息
      </button>
    </div>
  )
}
```

---

## 🔗 相关文档

- [BigModel-Z.ai SDK README](../README.md)
- [Core 模块文档](../core/README.md)
- [Examples 使用指南](../examples/README.md)
- [MCP 集成文档](../mcp/README.md)
