import type { MessageType, FeedbackData, ConsoleError } from '../types';
import { captureVisibleTab } from '../services/screenshot';
import { submitFeedback } from '../services/api';

// Store console errors per tab
const tabErrors = new Map<number, ConsoleError[]>();

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((message: MessageType, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse);
  return true; // Keep channel open for async response
});

async function handleMessage(
  message: MessageType,
  sender: chrome.runtime.MessageSender
): Promise<unknown> {
  switch (message.type) {
    case 'CAPTURE_SCREENSHOT': {
      try {
        const screenshot = await captureVisibleTab();
        return { success: true, screenshot };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Capture failed',
        };
      }
    }

    case 'GET_CONSOLE_ERRORS': {
      const tabId = sender.tab?.id;
      if (tabId) {
        return { errors: tabErrors.get(tabId) || [] };
      }
      return { errors: [] };
    }

    case 'SUBMIT_FEEDBACK': {
      const data = (message as { type: 'SUBMIT_FEEDBACK'; data: FeedbackData }).data;
      return await submitFeedback(data);
    }

    case 'CONSOLE_ERRORS': {
      const tabId = sender.tab?.id;
      const errors = (message as { type: 'CONSOLE_ERRORS'; errors: ConsoleError[] }).errors;
      if (tabId && errors) {
        const existing = tabErrors.get(tabId) || [];
        tabErrors.set(tabId, [...existing, ...errors].slice(-100)); // Keep last 100
      }
      return { success: true };
    }

    default:
      return { success: false, error: 'Unknown message type' };
  }
}

// Clear errors when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabErrors.delete(tabId);
});

// Clear errors on navigation
chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId === 0) {
    tabErrors.delete(details.tabId);
  }
});

// Context menu for quick capture
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'devlens-capture',
    title: 'Capture with DevLens',
    contexts: ['page', 'image', 'selection'],
  });

  chrome.contextMenus.create({
    id: 'devlens-capture-element',
    title: 'Capture this element',
    contexts: ['all'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === 'devlens-capture') {
    const screenshot = await captureVisibleTab();
    // Open popup with screenshot
    await chrome.storage.session.set({ pendingScreenshot: screenshot });
    chrome.action.openPopup();
  }

  if (info.menuItemId === 'devlens-capture-element') {
    // Start element picker mode
    await chrome.tabs.sendMessage(tab.id, { type: 'START_ELEMENT_PICKER' });
  }
});

console.log('DevLens background script loaded');
