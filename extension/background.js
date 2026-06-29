const ACTIVITY_KEY = "crmLastBrowserActivity";
const HEARTBEAT_KEY = "crmExtensionHeartbeat";

const SESSION_ACTIVE_KEY = "crmSessionActive";
const SESSION_AGENT_ID_KEY = "crmSessionAgentId";
const SESSION_STARTED_AT_KEY = "crmSessionStartedAt";

function saveActivity(source = "background") {
  const now = Date.now();

  chrome.storage.local.set({
    [ACTIVITY_KEY]: now,
    [HEARTBEAT_KEY]: now,
    crmActivitySource: source,
  });
}

function setSession(active, agentId = "") {
  chrome.storage.local.set({
    [SESSION_ACTIVE_KEY]: Boolean(active),
    [SESSION_AGENT_ID_KEY]: active ? String(agentId || "") : "",
    [SESSION_STARTED_AT_KEY]: active ? Date.now() : 0,
  });
}

chrome.runtime.onInstalled.addListener(() => {
  saveActivity("installed");
  setSession(false);
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

  if (message?.type === "CRM_SET_SESSION") {
    setSession(Boolean(message.active), message.agentId || "");
    sendResponse({ success: true });
    return true;
  }

  if (message?.type === "CRM_GET_ACTIVITY") {
    chrome.storage.local.get(
      [
        ACTIVITY_KEY,
        HEARTBEAT_KEY,
        "crmActivitySource",
        SESSION_ACTIVE_KEY,
        SESSION_AGENT_ID_KEY,
        SESSION_STARTED_AT_KEY,
      ],
      (data) => {
        sendResponse({
          success: true,
          lastActivity: data[ACTIVITY_KEY] || 0,
          heartbeat: data[HEARTBEAT_KEY] || 0,
          source: data.crmActivitySource || "",
          sessionActive: Boolean(data[SESSION_ACTIVE_KEY]),
          sessionAgentId: data[SESSION_AGENT_ID_KEY] || "",
          sessionStartedAt: data[SESSION_STARTED_AT_KEY] || 0,
        });
      }
    );

    return true;
  }

  return false;
});