# HTTP API 集成示例

> 使用 HTTP API 调用 GLM Coding Plan 的完整示例。

## Python 示例

### 基础调用

```python
import requests
import json

class GLMCodingClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://open.bigmodel.cn/api/coding/paas/v4"
    
    def chat(self, model: str, messages: list, stream: bool = False):
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": messages,
            "stream": stream
        }
        
        if stream:
            return self._stream_request(url, headers, data)
        else:
            return self._sync_request(url, headers, data)
    
    def _sync_request(self, url: str, headers: dict, data: dict):
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"API 调用失败: {response.status_code} - {response.text}")
    
    def _stream_request(self, url: str, headers: dict, data: dict):
        response = requests.post(url, headers=headers, json=data, stream=True)
        for line in response.iter_lines():
            if line.startswith(b"data: "):
                try:
                    data = json.loads(line[6:])
                    if data.get("choices"):
                        yield data
                except json.JSONDecodeError:
                    continue

# 使用示例
client = GLMCodingClient(api_key="your_api_key")

# 同步调用
result = client.chat(
    model="glm-5",
    messages=[
        {"role": "user", "content": "你好"}
    ]
)
print(result['choices'][0]['message']['content'])

# 流式调用
for chunk in client.chat(
    model="glm-5",
    messages=[{"role": "user", "content": "写一个 Python 函数"}],
    stream=True
):
    if chunk.get("choices") and chunk["choices"][0].get("delta", {}).get("content"):
        print(chunk["choices"][0]["delta"]["content"], end="", flush=True)
```

### 完整的代码助手

```python
import requests
from typing import List, Dict, Optional

class GLMCodeAssistant:
    def __init__(self, api_key: str, model: str = "glm-5"):
        self.api_key = api_key
        self.model = model
        self.base_url = "https://open.bigmodel.cn/api/coding/paas/v4"
    
    def generate_code(self, prompt: str, language: str = "python") -> str:
        """生成代码"""
        system_prompt = f"你是一个专业的 {language} 编程助手。请提供高质量、可运行的代码。"
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
        
        response = self._chat(messages)
        return response
    
    def debug_code(self, error: str, code: str) -> str:
        """调试代码"""
        system_prompt = "你是一个专业的调试助手。请分析错误并提供修复方案。"
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"错误信息：\n{error}\n\n代码：\n{code}"}
        ]
        
        response = self._chat(messages)
        return response
    
    def review_code(self, code: str) -> str:
        """代码审查"""
        system_prompt = "你是一个专业的代码审查助手。请审查代码并提供改进建议。"
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": code}
        ]
        
        response = self._chat(messages)
        return response
    
    def explain_code(self, code: str) -> str:
        """解释代码"""
        system_prompt = "你是一个专业的代码解释助手。请用清晰易懂的语言解释代码。"
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": code}
        ]
        
        response = self._chat(messages)
        return response
    
    def _chat(self, messages: List[Dict]) -> str:
        """内部聊天方法"""
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.6
        }
        
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        else:
            raise Exception(f"API 调用失败: {response.status_code}")

# 使用示例
assistant = GLMCodeAssistant(api_key="your_api_key", model="glm-5")

# 生成代码
code = assistant.generate_code("写一个快速排序算法")
print(code)

# 调试代码
error = "TypeError: unsupported operand type(s) for +: 'int' and 'str'"
code_snippet = "def add(a, b): return a + b\nresult = add(1, '2')"
debug_result = assistant.debug_code(error, code_snippet)
print(debug_result)

# 代码审查
review_result = assistant.review_code("def foo():\n    x = 1\n    y = 2\n    return x + y")
print(review_result)

# 解释代码
explain_result = assistant.explain_code("def factorial(n):\n    if n == 0: return 1\n    return n * factorial(n-1)")
print(explain_result)
```

## JavaScript/Node.js 示例

### 基础调用

```javascript
const axios = require('axios');

class GLMCodingClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://open.bigmodel.cn/api/coding/paas/v4';
    }
    
    async chat(model, messages, stream = false) {
        const url = `${this.baseURL}/chat/completions`;
        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
        const data = {
            model,
            messages,
            stream
        };
        
        const response = await axios.post(url, data, { headers });
        return response.data;
    }
}

// 使用示例
const client = new GLMCodingClient('your_api_key');

async function main() {
    const result = await client.chat(
        'glm-5',
        [
            { role: 'user', content: '你好' }
        ]
    );
    
    console.log(result.choices[0].message.content);
}

main().catch(console.error);
```

### 流式调用

```javascript
const axios = require('axios');

class GLMCodingClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://open.bigmodel.cn/api/coding/paas/v4';
    }
    
    async chatStream(model, messages, onChunk) {
        const url = `${this.baseURL}/chat/completions`;
        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
        const data = {
            model,
            messages,
            stream: true
        };
        
        const response = await axios.post(url, data, {
            headers,
            responseType: 'stream'
        });
        
        response.data.on('data', (chunk) => {
            const lines = chunk.toString().split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.choices && data.choices[0].delta?.content) {
                            onChunk(data.choices[0].delta.content);
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }
        });
    }
}

// 使用示例
const client = new GLMCodingClient('your_api_key');

client.chatStream(
    'glm-5',
    [
        { role: 'user', content: '写一个 Python 函数' }
    ],
    (content) => {
        process.stdout.write(content);
    }
);
```

## Go 示例

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

type Message struct {
    Role    string `json:"role"`
    Content string `json:"content"`
}

type Request struct {
    Model    string    `json:"model"`
    Messages []Message `json:"messages"`
    Stream   bool      `json:"stream"`
}

type Response struct {
    Choices []struct {
        Message struct {
            Content string `json:"content"`
        } `json:"message"`
    } `json:"choices"`
}

type GLMClient struct {
    APIKey  string
    BaseURL string
}

func NewGLMClient(apiKey string) *GLMClient {
    return &GLMClient{
        APIKey:  apiKey,
        BaseURL: "https://open.bigmodel.cn/api/coding/paas/v4",
    }
}

func (c *GLMClient) Chat(model string, messages []Message) (string, error) {
    req := Request{
        Model:    model,
        Messages: messages,
        Stream:   false,
    }
    
    reqBody, err := json.Marshal(req)
    if err != nil {
        return "", err
    }
    
    httpReq, err := http.NewRequest("POST", c.BaseURL+"/chat/completions", bytes.NewBuffer(reqBody))
    if err != nil {
        return "", err
    }
    
    httpReq.Header.Set("Authorization", "Bearer "+c.APIKey)
    httpReq.Header.Set("Content-Type", "application/json")
    
    client := &http.Client{}
    resp, err := client.Do(httpReq)
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()
    
    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return "", err
    }
    
    var response Response
    err = json.Unmarshal(body, &response)
    if err != nil {
        return "", err
    }
    
    if len(response.Choices) == 0 {
        return "", fmt.Errorf("no response")
    }
    
    return response.Choices[0].Message.Content, nil
}

func main() {
    client := NewGLMClient("your_api_key")
    
    messages := []Message{
        {Role: "user", Content: "你好"},
    }
    
    response, err := client.Chat("glm-5", messages)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    fmt.Println(response)
}
```

## Java 示例

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;

class Message {
    private String role;
    private String content;
    
    public Message(String role, String content) {
        this.role = role;
        this.content = content;
    }
    
    // Getters and Setters
    public String getRole() { return role; }
    public String getContent() { return content; }
}

class Request {
    private String model;
    private List<Message> messages;
    private boolean stream;
    
    public Request(String model, List<Message> messages, boolean stream) {
        this.model = model;
        this.messages = messages;
        this.stream = stream;
    }
    
    // Getters
    public String getModel() { return model; }
    public List<Message> getMessages() { return messages; }
    public boolean isStream() { return stream; }
}

class Choice {
    private Message message;
    
    // Getter
    public Message getMessage() { return message; }
}

class Response {
    private List<Choice> choices;
    
    // Getter
    public List<Choice> getChoices() { return choices; }
}

public class GLMClient {
    private final String apiKey;
    private final String baseURL;
    private final HttpClient client;
    private final ObjectMapper mapper;
    
    public GLMClient(String apiKey) {
        this.apiKey = apiKey;
        this.baseURL = "https://open.bigmodel.cn/api/coding/paas/v4";
        this.client = HttpClient.newHttpClient();
        this.mapper = new ObjectMapper();
    }
    
    public String chat(String model, List<Message> messages) throws Exception {
        Request request = new Request(model, messages, false);
        String requestBody = mapper.writeValueAsString(request);
        
        HttpRequest httpRequest = HttpRequest.newBuilder()
            .uri(URI.create(baseURL + "/chat/completions"))
            .header("Authorization", "Bearer " + apiKey)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build();
        
        HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        
        Response responseBody = mapper.readValue(response.body(), Response.class);
        return responseBody.getChoices().get(0).getMessage().getContent();
    }
    
    public static void main(String[] args) throws Exception {
        GLMClient client = new GLMClient("your_api_key");
        
        List<Message> messages = List.of(
            new Message("user", "你好")
        );
        
        String response = client.chat("glm-5", messages);
        System.out.println(response);
    }
}
```

## cURL 示例

### 基础调用

```bash
curl -X POST "https://open.bigmodel.cn/api/coding/paas/v4/chat/completions" \
  -H "Authorization: Bearer your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5",
    "messages": [
      {
        "role": "user",
        "content": "你好"
      }
    ],
    "temperature": 0.6
  }'
```

### 代码生成

```bash
curl -X POST "https://open.bigmodel.cn/api/coding/paas/v4/chat/completions" \
  -H "Authorization: Bearer your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5",
    "messages": [
      {
        "role": "system",
        "content": "你是一个专业的 Python 编程助手。"
      },
      {
        "role": "user",
        "content": "写一个快速排序函数"
      }
    ],
    "temperature": 0.2
  }'
```

### 流式调用

```bash
curl -X POST "https://open.bigmodel.cn/api/coding/paas/v4/chat/completions" \
  -H "Authorization: Bearer your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5",
    "messages": [
      {
        "role": "user",
        "content": "写一个 Python 函数"
      }
    ],
    "stream": true
  }'
```

## 错误处理

### Python 错误处理

```python
import requests
from requests.exceptions import RequestException

def safe_chat(client, model, messages, max_retries=3):
    """带重试的 API 调用"""
    for attempt in range(max_retries):
        try:
            return client.chat(model, messages)
        except RequestException as e:
            if attempt == max_retries - 1:
                raise
            print(f"请求失败，重试 {attempt + 1}/{max_retries}...")
            time.sleep(2 ** attempt)
    except Exception as e:
        print(f"API 调用失败: {e}")
        raise
```

### JavaScript 错误处理

```javascript
async function safeChat(client, model, messages, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await client.chat(model, messages);
        } catch (error) {
            if (attempt === maxRetries - 1) {
                throw error;
            }
            console.log(`请求失败，重试 ${attempt + 1}/${maxRetries}...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
    }
}
```

## 相关链接

- [BigModel API 文档](../BigModel/开发指南/HTTP-API%20调用.md)
- [Python SDK 文档](../BigModel/开发指南/官方-Python%20SDK.md)
- [Java SDK 文档](../BigModel/开发指南/官方-Java%20SDK.md)
