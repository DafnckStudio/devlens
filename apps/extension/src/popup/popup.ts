import type { MessageType, FeedbackData, StorageData } from '../types';

// DOM Elements
const elements = {
  // Views
  mainView: document.getElementById('main-view')!,
  settingsView: document.getElementById('settings-view')!,

  // Header
  settingsBtn: document.getElementById('settings-btn')!,
  backBtn: document.getElementById('back-btn')!,

  // Screenshot
  screenshotContainer: document.getElementById('screenshot-container')!,
  screenshotPreview: document.getElementById('screenshot-preview') as HTMLImageElement,

  // Actions
  captureBtn: document.getElementById('capture-btn')!,
  pickElementBtn: document.getElementById('pick-element-btn')!,

  // Comment
  commentInput: document.getElementById('comment') as HTMLTextAreaElement,

  // Error count
  errorCount: document.getElementById('error-count')!,
  errorNumber: document.getElementById('error-number')!,

  // Submit
  submitBtn: document.getElementById('submit-btn') as HTMLButtonElement,
  status: document.getElementById('status')!,

  // Settings
  apiKeyInput: document.getElementById('api-key') as HTMLInputElement,
  apiEndpointInput: document.getElementById('api-endpoint') as HTMLInputElement,
  captureErrorsCheckbox: document.getElementById('capture-errors') as HTMLInputElement,
  saveSettingsBtn: document.getElementById('save-settings-btn')!,
};

// State
let currentScreenshot: string | null = null;
let consoleErrors: unknown[] = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadPendingScreenshot();
  await loadConsoleErrors();
  setupEventListeners();
});

function setupEventListeners() {
  // View navigation
  elements.settingsBtn.addEventListener('click', () => showView('settings'));
  elements.backBtn.addEventListener('click', () => showView('main'));

  // Actions
  elements.captureBtn.addEventListener('click', captureScreenshot);
  elements.pickElementBtn.addEventListener('click', startElementPicker);
  elements.submitBtn.addEventListener('click', submitFeedback);

  // Settings
  elements.saveSettingsBtn.addEventListener('click', saveSettings);
}

function showView(view: 'main' | 'settings') {
  elements.mainView.classList.toggle('active', view === 'main');
  elements.settingsView.classList.toggle('active', view === 'settings');
}

async function loadSettings() {
  const config = await chrome.storage.sync.get([
    'apiKey',
    'apiEndpoint',
    'captureConsoleErrors',
  ]) as Partial<StorageData>;

  elements.apiKeyInput.value = config.apiKey || '';
  elements.apiEndpointInput.value = config.apiEndpoint || '';
  elements.captureErrorsCheckbox.checked = config.captureConsoleErrors !== false;
}

async function saveSettings() {
  const config: Partial<StorageData> = {
    apiKey: elements.apiKeyInput.value.trim(),
    apiEndpoint: elements.apiEndpointInput.value.trim() || undefined,
    captureConsoleErrors: elements.captureErrorsCheckbox.checked,
  };

  await chrome.storage.sync.set(config);
  showStatus('Settings saved', 'success');
  setTimeout(() => showView('main'), 1000);
}

async function loadPendingScreenshot() {
  const { pendingScreenshot } = await chrome.storage.session.get('pendingScreenshot');
  if (pendingScreenshot) {
    setScreenshot(pendingScreenshot);
    await chrome.storage.session.remove('pendingScreenshot');
  }
}

async function loadConsoleErrors() {
  const response = await chrome.runtime.sendMessage({ type: 'GET_CONSOLE_ERRORS' } as MessageType);
  if (response?.errors) {
    consoleErrors = response.errors;
    updateErrorCount();
  }
}

async function captureScreenshot() {
  elements.captureBtn.disabled = true;
  showStatus('Capturing...', 'loading');

  try {
    const response = await chrome.runtime.sendMessage({ type: 'CAPTURE_SCREENSHOT' } as MessageType);

    if (response.success && response.screenshot) {
      setScreenshot(response.screenshot);
      hideStatus();
    } else {
      showStatus(response.error || 'Failed to capture screenshot', 'error');
    }
  } catch (error) {
    showStatus('Failed to capture screenshot', 'error');
  } finally {
    elements.captureBtn.disabled = false;
  }
}

function setScreenshot(dataUrl: string) {
  currentScreenshot = dataUrl;
  elements.screenshotPreview.src = dataUrl;
  elements.screenshotPreview.classList.remove('hidden');

  // Hide placeholder
  const placeholder = elements.screenshotContainer.querySelector('.screenshot-placeholder');
  if (placeholder) {
    placeholder.classList.add('hidden');
  }

  updateSubmitButton();
}

async function startElementPicker() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await chrome.tabs.sendMessage(tab.id, { type: 'START_ELEMENT_PICKER' } as MessageType);
    window.close(); // Close popup to allow element picking
  }
}

function updateErrorCount() {
  const count = consoleErrors.length;
  if (count > 0) {
    elements.errorNumber.textContent = count.toString();
    elements.errorCount.classList.remove('hidden');
  } else {
    elements.errorCount.classList.add('hidden');
  }
}

function updateSubmitButton() {
  const hasApiKey = elements.apiKeyInput.value.trim().length > 0;
  const hasScreenshot = currentScreenshot !== null;

  elements.submitBtn.disabled = !hasApiKey || !hasScreenshot;
}

async function submitFeedback() {
  if (!currentScreenshot) {
    showStatus('Please capture a screenshot first', 'error');
    return;
  }

  elements.submitBtn.disabled = true;
  showStatus('Sending feedback...', 'loading');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const feedbackData: FeedbackData = {
      screenshot: currentScreenshot,
      url: tab?.url || '',
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      userAgent: navigator.userAgent,
      consoleErrors: consoleErrors as FeedbackData['consoleErrors'],
      comment: elements.commentInput.value.trim() || undefined,
    };

    const response = await chrome.runtime.sendMessage({
      type: 'SUBMIT_FEEDBACK',
      data: feedbackData,
    } as MessageType);

    if (response.success) {
      showStatus('Feedback sent successfully!', 'success');
      // Reset form
      currentScreenshot = null;
      elements.screenshotPreview.src = '';
      elements.screenshotPreview.classList.add('hidden');
      elements.commentInput.value = '';

      const placeholder = elements.screenshotContainer.querySelector('.screenshot-placeholder');
      if (placeholder) {
        (placeholder as HTMLElement).classList.remove('hidden');
      }

      updateSubmitButton();
    } else {
      showStatus(response.error || 'Failed to send feedback', 'error');
    }
  } catch (error) {
    showStatus('Failed to send feedback', 'error');
  } finally {
    elements.submitBtn.disabled = false;
  }
}

function showStatus(message: string, type: 'success' | 'error' | 'loading') {
  elements.status.textContent = message;
  elements.status.className = `status ${type}`;
  elements.status.classList.remove('hidden');
}

function hideStatus() {
  elements.status.classList.add('hidden');
}

// Listen for settings changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.apiKey) {
    updateSubmitButton();
  }
});
