import type { FeedbackData, ApiResponse, StorageData } from '../types';

const DEFAULT_ENDPOINT = 'https://devlens.vercel.app/api';

async function getConfig(): Promise<{ apiKey: string; endpoint: string }> {
  const result = await chrome.storage.sync.get(['apiKey', 'apiEndpoint']) as Partial<StorageData>;

  if (!result.apiKey) {
    throw new Error('API key not configured. Please set your API key in the extension settings.');
  }

  return {
    apiKey: result.apiKey,
    endpoint: result.apiEndpoint || DEFAULT_ENDPOINT,
  };
}

export async function submitFeedback(data: FeedbackData): Promise<ApiResponse<{ id: string }>> {
  const { apiKey, endpoint } = await getConfig();

  try {
    const response = await fetch(`${endpoint}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      return {
        success: false,
        error: error.error || `HTTP ${response.status}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export async function validateApiKey(apiKey: string, endpoint?: string): Promise<boolean> {
  const url = endpoint || DEFAULT_ENDPOINT;

  try {
    const response = await fetch(`${url}/feedback`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function saveConfig(config: Partial<StorageData>): Promise<void> {
  await chrome.storage.sync.set(config);
}

export async function getStoredConfig(): Promise<StorageData> {
  const defaults: StorageData = {
    captureConsoleErrors: true,
    autoCapture: false,
    theme: 'system',
  };

  const stored = await chrome.storage.sync.get(defaults) as StorageData;
  return { ...defaults, ...stored };
}
