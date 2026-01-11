/**
 * DevLens Claude Code Plugin
 *
 * Integrates visual feedback from the DevLens Chrome extension
 * into Claude Code workflow for automated bug fixing.
 */

export interface DevLensConfig {
  apiKey: string;
  projectId?: string;
  apiUrl?: string;
}

export interface Feedback {
  id: string;
  url: string;
  screenshotUrl: string;
  comment?: string;
  status: 'pending' | 'in_progress' | 'resolved';
  consoleErrors: ConsoleError[];
  selectedElement?: ElementInfo;
  viewport: {
    width: number;
    height: number;
  };
  userAgent: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface ConsoleError {
  type: 'error' | 'warn' | 'info';
  message: string;
  source?: string;
  line?: number;
  column?: number;
  timestamp: string;
}

export interface ElementInfo {
  tagName: string;
  className: string;
  id: string;
  innerText?: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  xpath: string;
  computedStyles?: Record<string, string>;
}

const DEFAULT_API_URL = 'https://devlens.vercel.app/api';

export class DevLensClient {
  private apiKey: string;
  private projectId?: string;
  private apiUrl: string;

  constructor(config: DevLensConfig) {
    this.apiKey = config.apiKey;
    this.projectId = config.projectId;
    this.apiUrl = config.apiUrl || DEFAULT_API_URL;
  }

  /**
   * List feedback items with optional filters
   */
  async listFeedback(options?: {
    status?: Feedback['status'];
    limit?: number;
    offset?: number;
  }): Promise<Feedback[]> {
    const params = new URLSearchParams();

    if (this.projectId) {
      params.set('projectId', this.projectId);
    }
    if (options?.status) {
      params.set('status', options.status);
    }
    if (options?.limit) {
      params.set('limit', options.limit.toString());
    }
    if (options?.offset) {
      params.set('offset', options.offset.toString());
    }

    const response = await this.request(`/feedback?${params.toString()}`);
    return response.data;
  }

  /**
   * Get a specific feedback item by ID
   */
  async getFeedback(id: string): Promise<Feedback> {
    const response = await this.request(`/feedback/${id}`);
    return response.data;
  }

  /**
   * Update feedback status
   */
  async updateFeedback(
    id: string,
    update: {
      status?: Feedback['status'];
      resolutionNote?: string;
    }
  ): Promise<Feedback> {
    const response = await this.request(`/feedback/${id}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    });
    return response.data;
  }

  /**
   * Mark feedback as resolved
   */
  async resolveFeedback(id: string, note?: string): Promise<Feedback> {
    return this.updateFeedback(id, {
      status: 'resolved',
      resolutionNote: note,
    });
  }

  /**
   * List projects
   */
  async listProjects(): Promise<
    Array<{
      id: string;
      name: string;
      urlPatterns: string[];
      feedbackCount: number;
    }>
  > {
    const response = await this.request('/projects');
    return response.data;
  }

  private async request(
    path: string,
    options?: RequestInit
  ): Promise<{ data: any; error?: string }> {
    const url = `${this.apiUrl}${path}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }
}

/**
 * Create a DevLens client from environment variables
 */
export function createClientFromEnv(): DevLensClient {
  const apiKey = process.env.DEVLENS_API_KEY;

  if (!apiKey) {
    throw new Error(
      'DEVLENS_API_KEY environment variable is required. ' +
        'Get your API key from the DevLens dashboard.'
    );
  }

  return new DevLensClient({
    apiKey,
    projectId: process.env.DEVLENS_PROJECT_ID,
    apiUrl: process.env.DEVLENS_API_URL,
  });
}

/**
 * Format feedback for display in Claude Code
 */
export function formatFeedbackList(feedbacks: Feedback[]): string {
  if (feedbacks.length === 0) {
    return 'No feedback items found.';
  }

  return feedbacks
    .map((fb, i) => {
      const errorCount = fb.consoleErrors?.length || 0;
      const age = getRelativeTime(new Date(fb.createdAt));

      return `${i + 1}. [#${fb.id}] ${fb.comment || 'No comment'}
   - URL: ${fb.url}
   - Console errors: ${errorCount}
   - Viewport: ${fb.viewport.width}x${fb.viewport.height}
   - ${age}
   - Status: ${fb.status}`;
    })
    .join('\n\n');
}

/**
 * Format detailed feedback view
 */
export function formatFeedbackDetail(fb: Feedback): string {
  const sections: string[] = [];

  // Header
  sections.push(`# Feedback #${fb.id}`);
  sections.push(`Status: ${fb.status}`);
  sections.push(`URL: ${fb.url}`);
  sections.push(`Created: ${new Date(fb.createdAt).toLocaleString()}`);

  // Comment
  if (fb.comment) {
    sections.push(`\n## User Comment\n${fb.comment}`);
  }

  // Screenshot
  sections.push(`\n## Screenshot\n![Screenshot](${fb.screenshotUrl})`);

  // Viewport
  sections.push(
    `\n## Viewport\n- Width: ${fb.viewport.width}px\n- Height: ${fb.viewport.height}px\n- User Agent: ${fb.userAgent}`
  );

  // Console errors
  if (fb.consoleErrors && fb.consoleErrors.length > 0) {
    sections.push(`\n## Console Errors (${fb.consoleErrors.length})`);
    fb.consoleErrors.forEach((err, i) => {
      sections.push(
        `${i + 1}. [${err.type.toUpperCase()}] ${err.message}${
          err.source ? `\n   Source: ${err.source}:${err.line}:${err.column}` : ''
        }`
      );
    });
  }

  // Selected element
  if (fb.selectedElement) {
    const el = fb.selectedElement;
    sections.push(`\n## Selected Element`);
    sections.push(`- Tag: ${el.tagName}`);
    if (el.id) sections.push(`- ID: ${el.id}`);
    if (el.className) sections.push(`- Class: ${el.className}`);
    sections.push(`- XPath: ${el.xpath}`);
    sections.push(
      `- Position: (${el.rect.x}, ${el.rect.y}) ${el.rect.width}x${el.rect.height}`
    );

    if (el.computedStyles) {
      sections.push(`- Styles:`);
      Object.entries(el.computedStyles).forEach(([key, value]) => {
        sections.push(`  - ${key}: ${value}`);
      });
    }
  }

  // Resolution
  if (fb.status === 'resolved' && fb.resolvedAt) {
    sections.push(`\n## Resolution`);
    sections.push(`Resolved: ${new Date(fb.resolvedAt).toLocaleString()}`);
    if (fb.resolutionNote) {
      sections.push(`Note: ${fb.resolutionNote}`);
    }
  }

  return sections.join('\n');
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}
