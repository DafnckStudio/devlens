import type { ConsoleError, ElementInfo, MessageType } from '../types';

// Capture console errors
const consoleErrors: ConsoleError[] = [];

const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  captureConsoleMessage('error', args);
  originalError.apply(console, args);
};

console.warn = (...args) => {
  captureConsoleMessage('warn', args);
  originalWarn.apply(console, args);
};

function captureConsoleMessage(type: 'error' | 'warn' | 'info', args: unknown[]) {
  const error: ConsoleError = {
    type,
    message: args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '),
    timestamp: new Date().toISOString(),
  };

  consoleErrors.push(error);

  // Send to background
  chrome.runtime.sendMessage({ type: 'CONSOLE_ERRORS', errors: [error] } as MessageType);
}

// Listen for uncaught errors
window.addEventListener('error', (event) => {
  const error: ConsoleError = {
    type: 'error',
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
    timestamp: new Date().toISOString(),
  };

  consoleErrors.push(error);
  chrome.runtime.sendMessage({ type: 'CONSOLE_ERRORS', errors: [error] } as MessageType);
});

// Listen for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const error: ConsoleError = {
    type: 'error',
    message: `Unhandled Promise Rejection: ${event.reason}`,
    timestamp: new Date().toISOString(),
  };

  consoleErrors.push(error);
  chrome.runtime.sendMessage({ type: 'CONSOLE_ERRORS', errors: [error] } as MessageType);
});

// Element picker
let pickerActive = false;
let highlightOverlay: HTMLDivElement | null = null;
let selectedElement: Element | null = null;

chrome.runtime.onMessage.addListener((message: MessageType, _sender, sendResponse) => {
  switch (message.type) {
    case 'START_ELEMENT_PICKER':
      startElementPicker();
      sendResponse({ success: true });
      break;

    case 'STOP_ELEMENT_PICKER':
      stopElementPicker();
      sendResponse({ success: true });
      break;

    case 'GET_CONSOLE_ERRORS':
      sendResponse({ errors: consoleErrors });
      break;

    default:
      sendResponse({ success: false });
  }

  return true;
});

function startElementPicker() {
  if (pickerActive) return;
  pickerActive = true;

  // Create highlight overlay
  highlightOverlay = document.createElement('div');
  highlightOverlay.id = 'devlens-highlight';
  highlightOverlay.style.cssText = `
    position: fixed;
    pointer-events: none;
    background: rgba(99, 102, 241, 0.2);
    border: 2px solid #6366F1;
    border-radius: 4px;
    z-index: 2147483647;
    transition: all 0.1s ease;
  `;
  document.body.appendChild(highlightOverlay);

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('click', handleClick, true);
  document.addEventListener('keydown', handleKeyDown);

  // Change cursor
  document.body.style.cursor = 'crosshair';
}

function stopElementPicker() {
  if (!pickerActive) return;
  pickerActive = false;

  if (highlightOverlay) {
    highlightOverlay.remove();
    highlightOverlay = null;
  }

  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('click', handleClick, true);
  document.removeEventListener('keydown', handleKeyDown);

  document.body.style.cursor = '';
  selectedElement = null;
}

function handleMouseMove(e: MouseEvent) {
  const element = document.elementFromPoint(e.clientX, e.clientY);
  if (!element || element === highlightOverlay) return;

  selectedElement = element;
  const rect = element.getBoundingClientRect();

  if (highlightOverlay) {
    highlightOverlay.style.top = `${rect.top}px`;
    highlightOverlay.style.left = `${rect.left}px`;
    highlightOverlay.style.width = `${rect.width}px`;
    highlightOverlay.style.height = `${rect.height}px`;
  }
}

function handleClick(e: MouseEvent) {
  if (!pickerActive || !selectedElement) return;

  e.preventDefault();
  e.stopPropagation();

  const elementInfo = getElementInfo(selectedElement);

  chrome.runtime.sendMessage({
    type: 'ELEMENT_PICKED',
    element: elementInfo,
  } as MessageType);

  stopElementPicker();
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    stopElementPicker();
  }
}

function getElementInfo(element: Element): ElementInfo {
  const rect = element.getBoundingClientRect();
  const computedStyles = window.getComputedStyle(element);

  return {
    tagName: element.tagName.toLowerCase(),
    className: element.className,
    id: element.id,
    innerText: element instanceof HTMLElement ? element.innerText?.slice(0, 200) : undefined,
    rect: {
      x: rect.x + window.scrollX,
      y: rect.y + window.scrollY,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      toJSON: rect.toJSON,
    },
    xpath: getXPath(element),
    computedStyles: {
      color: computedStyles.color,
      backgroundColor: computedStyles.backgroundColor,
      fontSize: computedStyles.fontSize,
      fontFamily: computedStyles.fontFamily,
      display: computedStyles.display,
      position: computedStyles.position,
    },
  };
}

function getXPath(element: Element): string {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }

  const parts: string[] = [];
  let current: Element | null = element;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let index = 1;
    let sibling = current.previousElementSibling;

    while (sibling) {
      if (sibling.tagName === current.tagName) {
        index++;
      }
      sibling = sibling.previousElementSibling;
    }

    const tagName = current.tagName.toLowerCase();
    const part = index > 1 ? `${tagName}[${index}]` : tagName;
    parts.unshift(part);

    current = current.parentElement;
  }

  return `/${parts.join('/')}`;
}

console.log('DevLens content script loaded');
