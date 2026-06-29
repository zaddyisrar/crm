const ACTIVITY_THROTTLE = 3000;
let lastSent = 0;

function sendActivity(source) {
  const now = Date.now();

  if (now - lastSent < ACTIVITY_THROTTLE) return;

  lastSent = now;

  try {
    chrome.runtime.sendMessage({
      type: "CRM_BROWSER_ACTIVITY",
      source,
      timestamp: now,
    });
  } catch (error) {}
}

function sendActivityResponse() {
  try {
    chrome.runtime.sendMessage({ type: "CRM_GET_ACTIVITY" }, (response) => {
      window.postMessage(
        {
          type: "CRM_EXTENSION_ACTIVITY_RESPONSE",
          payload: response || { success: false },
        },
        "*"
      );
    });
  } catch (error) {
    window.postMessage(
      {
        type: "CRM_EXTENSION_ACTIVITY_RESPONSE",
        payload: { success: false },
      },
      "*"
    );
  }
}

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data?.type === "CRM_GET_EXTENSION_ACTIVITY") {
    sendActivityResponse();
  }
});

[
  "mousemove",
  "mousedown",
  "mouseup",
  "keydown",
  "keyup",
  "scroll",
  "wheel",
  "touchstart",
  "focus",
].forEach((eventName) => {
  window.addEventListener(eventName, () => sendActivity(eventName), {
    passive: true,
  });
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) sendActivity("visibilitychange");
});

sendActivity("content-loaded");