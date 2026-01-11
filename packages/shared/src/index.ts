export * from './types';

// Utility functions

/**
 * Generate a unique API key
 */
export function generateApiKey(prefix = 'dl'): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const segments = [
    Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
  ];
  return `${prefix}_${segments.join('-')}`;
}

/**
 * Match a URL against a list of domain patterns
 */
export function matchUrlToProject(
  url: string,
  projects: Array<{ id: string; domains: string[] }>
): string | null {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    const port = parsedUrl.port;

    for (const project of projects) {
      for (const pattern of project.domains) {
        // Exact match
        if (pattern === hostname) return project.id;

        // With port (e.g., "localhost:3000")
        if (pattern === `${hostname}:${port}`) return project.id;

        // Wildcard subdomain (e.g., "*.example.com")
        if (pattern.startsWith('*.')) {
          const baseDomain = pattern.slice(2);
          if (hostname.endsWith(baseDomain)) return project.id;
        }

        // Contains match (e.g., "example" matches "example.vercel.app")
        if (hostname.includes(pattern)) return project.id;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate feedback markdown for Claude Code
 */
export function generateFeedbackMarkdown(
  feedback: Array<{
    id: string;
    project: string;
    page: string;
    description: string;
    screenshotUrl: string;
    consoleErrors: string[];
    createdAt: string;
  }>
): string {
  if (feedback.length === 0) {
    return '# DevLens Feedback\n\nNo pending feedback.';
  }

  const lines = ['# DevLens Feedback\n'];

  for (const item of feedback) {
    lines.push(`## ${item.id} - ${truncate(item.description, 50)}\n`);
    lines.push(`**Project:** ${item.project}`);
    lines.push(`**Page:** ${item.page}`);
    lines.push(`**Date:** ${item.createdAt}`);
    lines.push(`**Screenshot:** ${item.screenshotUrl}`);

    if (item.consoleErrors.length > 0) {
      lines.push('\n**Console Errors:**');
      for (const error of item.consoleErrors) {
        lines.push(`- ${error}`);
      }
    }

    lines.push(`\n**Description:**\n${item.description}\n`);
    lines.push('---\n');
  }

  return lines.join('\n');
}
