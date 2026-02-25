// ============================================================
// BigModel-Z.ai SDK - React Hooks
// ============================================================

import { useState, useCallback, useEffect } from 'react';

import BigModelSDK from '../BigModelSDK';
import { AssistantMessage, AssistantResponse } from '../core/BigModelClient';

export interface UseBigModelOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export function useBigModel(options: UseBigModelOptions) {
  const [sdk] = useState(() => BigModelSDK.create(options));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return {
    sdk,
    loading,
    error,
    setLoading,
    setError,
  };
}

export interface UseChatOptions {
  assistantId: string;
  initialMessages?: AssistantMessage[];
}

export function useChat(options: UseChatOptions) {
  const { sdk, loading, error, setLoading, setError } = useBigModel({
    apiKey: 'your-api-key',
  });
  const [messages, setMessages] = useState<AssistantMessage[]>(options.initialMessages || []);
  const [response, setResponse] = useState<AssistantResponse | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      setLoading(true);
      setError(null);

      try {
        const userMessage: AssistantMessage = {
          role: 'user',
          content,
          timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMessage]);

        const chatResponse = await sdk.client.chat(options.assistantId, [...messages, userMessage]);

        const assistantMessage: AssistantMessage = {
          role: 'assistant',
          content: chatResponse.choices[0].message.content,
          timestamp: Date.now(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        setResponse(chatResponse);

        return chatResponse;
      } catch (err) {
        const errAsError = err as Error;

        setError(errAsError);
        throw errAsError;
      } finally {
        setLoading(false);
      }
    },
    [sdk, options.assistantId, messages, setLoading, setError],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setResponse(null);
  }, []);

  return {
    messages,
    response,
    loading,
    error,
    sendMessage,
    clearMessages,
  };
}

export interface UseChatStreamOptions {
  assistantId: string;
  initialMessages?: AssistantMessage[];
  onChunk?: (chunk: string) => void;
}

export function useChatStream(options: UseChatStreamOptions) {
  const { sdk, loading, error, setLoading, setError } = useBigModel({
    apiKey: 'your-api-key',
  });
  const [messages, setMessages] = useState<AssistantMessage[]>(options.initialMessages || []);
  const [streaming, setStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');

  const sendMessage = useCallback(
    async (content: string) => {
      setLoading(true);
      setStreaming(true);
      setError(null);
      setCurrentResponse('');

      try {
        const userMessage: AssistantMessage = {
          role: 'user',
          content,
          timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMessage]);

        const stream = sdk.client.chatStream(options.assistantId, [...messages, userMessage]);

        let fullResponse = '';

        for await (const chunk of stream) {
          fullResponse += chunk;
          setCurrentResponse(fullResponse);
          options.onChunk?.(chunk);
        }

        const assistantMessage: AssistantMessage = {
          role: 'assistant',
          content: fullResponse,
          timestamp: Date.now(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        setCurrentResponse('');

        return fullResponse;
      } catch (err) {
        const errAsError = err as Error;

        setError(errAsError);
        throw errAsError;
      } finally {
        setLoading(false);
        setStreaming(false);
      }
    },
    [sdk, options, messages, setLoading, setError],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentResponse('');
  }, []);

  return {
    messages,
    currentResponse,
    loading,
    streaming,
    error,
    sendMessage,
    clearMessages,
  };
}

export interface UseAssistantsOptions {
  apiKey: string;
}

export function useAssistants(options: UseAssistantsOptions) {
  const { sdk, loading, error, setLoading, setError } = useBigModel(options);
  const [assistants, setAssistants] = useState<unknown[]>([]);

  const loadAssistants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await sdk.assistants.listAssistants();

      setAssistants(data);

      return data;
    } catch (err) {
      const errAsError = err as Error;

      setError(errAsError);
      throw errAsError;
    } finally {
      setLoading(false);
    }
  }, [sdk, setLoading, setError]);

  useEffect(() => {
    loadAssistants();
  }, [loadAssistants]);

  return {
    assistants,
    loading,
    error,
    loadAssistants,
  };
}

export interface UseFilesOptions {
  apiKey: string;
}

export function useFiles(options: UseFilesOptions) {
  const { sdk, loading, error, setLoading, setError } = useBigModel(options);
  const [files, setFiles] = useState<unknown[]>([]);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await sdk.files.listFiles();

      setFiles(data);

      return data;
    } catch (err) {
      const errAsError = err as Error;

      setError(errAsError);
      throw errAsError;
    } finally {
      setLoading(false);
    }
  }, [sdk, setLoading, setError]);

  const uploadFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);

      try {
        const data = await sdk.files.uploadFile(file);

        setFiles(prev => [...prev, data]);

        return data;
      } catch (err) {
        const errAsError = err as Error;

        setError(errAsError);
        throw errAsError;
      } finally {
        setLoading(false);
      }
    },
    [sdk, setLoading, setError],
  );

  const deleteFile = useCallback(
    async (fileId: string) => {
      setLoading(true);
      setError(null);

      try {
        await sdk.files.deleteFile(fileId);

        setFiles(prev => prev.filter(f => (f as { id: string }).id !== fileId));
      } catch (err) {
        const errAsError = err as Error;

        setError(errAsError);
        throw errAsError;
      } finally {
        setLoading(false);
      }
    },
    [sdk, setLoading, setError],
  );

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  return {
    files,
    loading,
    error,
    loadFiles,
    uploadFile,
    deleteFile,
  };
}

export interface UseKnowledgeBaseOptions {
  apiKey: string;
  knowledgeBaseId?: string;
}

export function useKnowledgeBase(options: UseKnowledgeBaseOptions) {
  const { sdk, loading, error, setLoading, setError } = useBigModel(options);
  const [knowledgeBases, setKnowledgeBases] = useState<unknown[]>([]);
  const [documents, setDocuments] = useState<unknown[]>([]);

  const loadKnowledgeBases = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await sdk.knowledge.listKnowledgeBases();

      setKnowledgeBases(data);

      return data;
    } catch (err) {
      const errAsError = err as Error;

      setError(errAsError);
      throw errAsError;
    } finally {
      setLoading(false);
    }
  }, [sdk, setLoading, setError]);

  const loadDocuments = useCallback(
    async (kbId: string) => {
      setLoading(true);
      setError(null);

      try {
        const data = await sdk.knowledge.listDocuments(kbId);

        setDocuments(data);

        return data;
      } catch (err) {
        const errAsError = err as Error;

        setError(errAsError);
        throw errAsError;
      } finally {
        setLoading(false);
      }
    },
    [sdk, setLoading, setError],
  );

  const search = useCallback(
    async (kbId: string, query: string) => {
      setLoading(true);
      setError(null);

      try {
        const data = await sdk.knowledge.search(kbId, { query });

        return data;
      } catch (err) {
        const errAsError = err as Error;

        setError(errAsError);
        throw errAsError;
      } finally {
        setLoading(false);
      }
    },
    [sdk, setLoading, setError],
  );

  useEffect(() => {
    loadKnowledgeBases();
  }, [loadKnowledgeBases]);

  useEffect(() => {
    if (options.knowledgeBaseId) {
      loadDocuments(options.knowledgeBaseId);
    }
  }, [options.knowledgeBaseId, loadDocuments]);

  return {
    knowledgeBases,
    documents,
    loading,
    error,
    loadKnowledgeBases,
    loadDocuments,
    search,
  };
}
