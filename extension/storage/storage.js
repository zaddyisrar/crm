export const ACTIVITY_KEY = "crmLastBrowserActivity";
export const HEARTBEAT_KEY = "crmExtensionHeartbeat";

export function getActivity(callback) {
  chrome.storage.local.get([ACTIVITY_KEY, HEARTBEAT_KEY], callback);
}

export function setActivity(source = "storage") {
  const now = Date.now();

  chrome.storage.local.set({
    [ACTIVITY_KEY]: now,
    [HEARTBEAT_KEY]: now,
    crmActivitySource: source,
  });
}