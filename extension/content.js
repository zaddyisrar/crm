console.log("[CRM EXT] content script loaded");

const ACTIVITY_THROTTLE = 3000;
const IDLE_POPUP_AFTER = 30 * 1000;
const AUTO_LOGOUT_LIMIT = 5 * 60 * 1000;
const POPUP_CHECK_INTERVAL = 1000;

let lastSent = 0;
let popupInterval = null;

function sendActivity(source) {
  const now = Date.now();

  if (now - lastSent < ACTIVITY_THROTTLE) return;

  lastSent = now;

  try {
    chrome.runtime.sendMessage(
      {
        type: "CRM_BROWSER_ACTIVITY",
        source,
        timestamp: now,
      },
      () => {}
    );
  } catch (error) {
    // Extension reloaded while page was open. Safe to ignore.
  }

  hideIdlePopup();
}

function sendActivityResponse() {
  try {
    chrome.runtime.sendMessage({ type: "CRM_GET_ACTIVITY" }, (response) => {
      window.postMessage(
        {
          type: "CRM_EXTENSION_ACTIVITY_RESPONSE",
          payload: response || { success: false },
        },
        window.location.origin
      );
    });
  } catch (error) {
    window.postMessage(
      {
        type: "CRM_EXTENSION_ACTIVITY_RESPONSE",
        payload: { success: false },
      },
      window.location.origin
    );
  }
}

function setSessionFromPage(active, agentId = "") {
  try {
    chrome.runtime.sendMessage(
      {
        type: "CRM_SET_SESSION",
        active: Boolean(active),
        agentId,
      },
      () => {}
    );
  } catch (error) {
    // Safe to ignore if extension context refreshed.
  }
}

function getActivity(callback) {
  try {
    chrome.runtime.sendMessage({ type: "CRM_GET_ACTIVITY" }, (response) => {
      callback(response || null);
    });
  } catch (error) {
    callback(null);
  }
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function createIdlePopup() {
  if (document.getElementById("crm-extension-idle-popup")) return;

  const popup = document.createElement("div");
  popup.id = "crm-extension-idle-popup";

  popup.innerHTML = `
    <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#67e8f9;margin-bottom:6px;">
      CRM Inactivity Warning
    </div>
    <div style="font-size:14px;font-weight:800;color:white;margin-bottom:8px;">
      No browser activity detected
    </div>
    <div style="font-size:12px;color:#94a3b8;margin-bottom:12px;">
      Move mouse, type, scroll, or switch tabs to reset.
    </div>
    <div id="crm-extension-idle-timer" style="font-size:28px;font-weight:900;color:#22d3ee;text-shadow:0 0 18px rgba(34,211,238,.6);">
      04:30
    </div>
  `;

  popup.style.cssText = `
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 2147483647;
    width: 310px;
    padding: 18px;
    border-radius: 22px;
    border: 1px solid rgba(34,211,238,.35);
    background: rgba(3, 6, 11, .94);
    box-shadow: 0 0 45px rgba(34,211,238,.22);
    backdrop-filter: blur(16px);
    font-family: Arial, sans-serif;
  `;

  document.documentElement.appendChild(popup);
}

function updateIdlePopup(remainingMs) {
  createIdlePopup();

  const timer = document.getElementById("crm-extension-idle-timer");
  if (timer) timer.textContent = formatCountdown(remainingMs);
}

function hideIdlePopup() {
  const popup = document.getElementById("crm-extension-idle-popup");
  if (popup) popup.remove();
}

function startIdlePopupWatcher() {
  if (popupInterval) clearInterval(popupInterval);

  popupInterval = setInterval(() => {
    getActivity((activity) => {
      if (!activity?.sessionActive) {
        hideIdlePopup();
        return;
      }

      const lastActivity = Number(activity?.lastActivity || 0);

      if (!lastActivity) {
        hideIdlePopup();
        return;
      }

      const idleFor = Date.now() - lastActivity;

      if (idleFor < IDLE_POPUP_AFTER) {
        hideIdlePopup();
        return;
      }

      const remaining = AUTO_LOGOUT_LIMIT - idleFor;

      if (remaining <= 0) {
        updateIdlePopup(0);
        return;
      }

      updateIdlePopup(remaining);
    });
  }, POPUP_CHECK_INTERVAL);
}

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data?.type === "CRM_GET_EXTENSION_ACTIVITY") {
    sendActivityResponse();
  }

  if (event.data?.type === "CRM_SET_EXTENSION_SESSION") {
    setSessionFromPage(event.data.active, event.data.agentId || "");
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
startIdlePopupWatcher();