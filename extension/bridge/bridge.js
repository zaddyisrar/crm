export function getBrowserActivity() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "CRM_GET_ACTIVITY" }, (response) => {
      resolve(
        response || {
          success: false,
          lastActivity: 0,
          heartbeat: 0,
          source: "",
        }
      );
    });
  });
}