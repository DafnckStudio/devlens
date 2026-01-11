export async function captureVisibleTab(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(
      undefined,
      { format: 'png', quality: 100 },
      (dataUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (dataUrl) {
          resolve(dataUrl);
        } else {
          reject(new Error('Failed to capture screenshot'));
        }
      }
    );
  });
}

export async function captureElement(
  tabId: number,
  selector: string
): Promise<string> {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: captureElementInPage,
    args: [selector],
  });

  if (results[0]?.result) {
    return results[0].result;
  }

  throw new Error('Failed to capture element');
}

function captureElementInPage(selector: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (!element) {
      reject(new Error(`Element not found: ${selector}`));
      return;
    }

    // Use html2canvas if available, otherwise return element bounds
    // @ts-ignore - html2canvas loaded via content script
    if (typeof html2canvas !== 'undefined') {
      // @ts-ignore
      html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      })
        .then((canvas: HTMLCanvasElement) => {
          resolve(canvas.toDataURL('image/png'));
        })
        .catch(reject);
    } else {
      // Fallback: return element info for server-side processing
      const rect = element.getBoundingClientRect();
      resolve(
        JSON.stringify({
          type: 'bounds',
          x: rect.x + window.scrollX,
          y: rect.y + window.scrollY,
          width: rect.width,
          height: rect.height,
        })
      );
    }
  });
}

export function getViewportInfo(): { width: number; height: number } {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}
