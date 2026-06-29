const ACTIVITY_KEY = "crmLastBrowserActivity";
const HEARTBEAT_KEY = "crmExtensionHeartbeat";

function saveActivity(source = "background") {
  const now = Date.now();

  chrome.storage.local.set({
    [ACTIVITY_KEY]: now,
    [HEARTBEAT_KEY]: now,
    crmActivitySource: source,
  });
}

chrome.runtime.onInstalled.addListener(() => {
  saveActivity("installed");
});

chrome.runtime.onStartup.addListener(() => {
  saveActivity("startup");
});

chrome.tabs.onActivated.addListener(() => {
  saveActivity("tab-activated");
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    saveActivity("window-focus");
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "CRM_BROWSER_ACTIVITY") {
    saveActivity(message.source || "content");
    sendResponse({ success: true });
    return true;
  }

  if (message?.type === "CRM_GET_ACTIVITY") {
    chrome.storage.local.get(
      [ACTIVITY_KEY, HEARTBEAT_KEY, "crmActivitySource"],
      (data) => {
        sendResponse({
          success: true,
          lastActivity: data[ACTIVITY_KEY] || 0,
          heartbeat: data[HEARTBEAT_KEY] || 0,
          source: data.crmActivitySource || "",
        });
      }
    );

    return true;
  }

  return false;
});