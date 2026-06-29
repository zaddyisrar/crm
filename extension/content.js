function getExtensionActivity() {
  return new Promise((resolve) => {
    try {
      const timeout = setTimeout(() => {
        resolve({
          connected: false,
          lastActivity: 0,
          heartbeat: 0,
          source: "",
        });
      }, 700);

      function handleMessage(event) {
        if (event.source !== window) return;
        if (event.data?.type !== "CRM_EXTENSION_ACTIVITY_RESPONSE") return;

        clearTimeout(timeout);
        window.removeEventListener("message", handleMessage);

        const payload = event.data.payload || {};

        resolve({
          connected: Boolean(payload.lastActivity || payload.heartbeat),
          lastActivity: Number(payload.lastActivity || 0),
          heartbeat: Number(payload.heartbeat || 0),
          source: payload.source || "",
        });
      }

      window.addEventListener("message", handleMessage);

      window.postMessage(
        {
          type: "CRM_GET_EXTENSION_ACTIVITY",
        },
        "*"
      );
    } catch (error) {
      resolve({
        connected: false,
        lastActivity: 0,
        heartbeat: 0,
        source: "",
      });
    }
  });
}