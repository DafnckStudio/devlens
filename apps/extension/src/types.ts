export interface FeedbackData {
  screenshot: string;
  url: string;
  timestamp: string;
  viewport: {
    width: number;
    height: number;
  };
  userAgent: string;
  consoleErrors: ConsoleError[];
  selectedElement?: ElementInfo;
  annotation?: AnnotationData;
  comment?: string;
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
  rect: DOMRect;
  xpath: string;
  computedStyles?: Record<string, string>;
}

export interface AnnotationData {
  type: 'arrow' | 'rectangle' | 'circle' | 'text';
  points: { x: number; y: number }[];
  color: string;
  text?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface StorageData {
  apiKey?: string;
  apiEndpoint?: string;
  captureConsoleErrors: boolean;
  autoCapture: boolean;
  theme: 'light' | 'dark' | 'system';
}

export type MessageType =
  | { type: 'CAPTURE_SCREENSHOT' }
  | { type: 'CAPTURE_ELEMENT'; selector?: string }
  | { type: 'GET_CONSOLE_ERRORS' }
  | { type: 'START_ELEMENT_PICKER' }
  | { type: 'STOP_ELEMENT_PICKER' }
  | { type: 'ELEMENT_PICKED'; element: ElementInfo }
  | { type: 'SUBMIT_FEEDBACK'; data: FeedbackData }
  | { type: 'SCREENSHOT_CAPTURED'; screenshot: string }
  | { type: 'CONSOLE_ERRORS'; errors: ConsoleError[] };
