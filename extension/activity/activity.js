const ACTIVITY_THROTTLE = 3000;

let lastSent = 0;

export function trackActivity(source = "activity") {
  const now = Date.now();

  if (now - lastSent < ACTIVITY_THROTTLE) return;

  lastSent = now;

  chrome.runtime.sendMessage({
    type: "CRM_BROWSER_ACTIVITY",
    source,
    timestamp: now,
  });
}