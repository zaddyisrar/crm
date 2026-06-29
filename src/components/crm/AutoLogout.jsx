"use client";

import { useEffect } from "react";
import { sheetsPost } from "@/lib/sheetsApi";

const AUTO_LOGOUT_ENABLED = true;

const INACTIVITY_LIMIT = 5 * 60 * 1000;
const WARNING_BEFORE_LOGOUT = 30 * 1000;

const ACTIVITY_CHECK_INTERVAL = 15 * 1000;
const SHIFT_CHECK_INTERVAL = 30 * 1000;

function normalizeTime(value) {
  if (!value) return "";

  const raw = String(value).trim();
  if (!raw || raw === "-") return "";

  const date = new Date(raw);

  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return raw;
}

function parseTimeToMinutes(value) {
  const time = normalizeTime(value);
  if (!time) return null;

  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridian = match[3]?.toUpperCase();

  if (meridian === "PM" && hour !== 12) hour += 12;
  if (meridian === "AM" && hour === 12) hour = 0;

  return hour * 60 + minute;
}

function buildTodayDateAtMinutes(minutes) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setMinutes(minutes);
  return date;
}

function getCurrentShiftWindow(shiftStart, shiftEnd) {
  const startMinutes = parseTimeToMinutes(shiftStart);
  const endMinutes = parseTimeToMinutes(shiftEnd);

  if (startMinutes === null || endMinutes === null) return null;

  const now = new Date();

  let start = buildTodayDateAtMinutes(startMinutes);
  let end = buildTodayDateAtMinutes(endMinutes);

  if (startMinutes < endMinutes) {
    return { start, end };
  }

  if (now.getTime() <= end.getTime()) {
    start.setDate(start.getDate() - 1);
  } else {
    end.setDate(end.getDate() + 1);
  }

  return { start, end };
}

function hasShiftEnded(shiftStart, shiftEnd) {
  const window = getCurrentShiftWindow(shiftStart, shiftEnd);
  if (!window) return false;

  return new Date() >= window.end;
}

function getTimeNow() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function canUseNotification() {
  return typeof window !== "undefined" && "Notification" in window;
}

async function requestNotificationPermission() {
  if (!canUseNotification()) return false;

  if (Notification.permission === "granted") return true;

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

function sendBrowserNotification(title, body) {
  if (!canUseNotification()) return;
  if (Notification.permission !== "granted") return;

  try {
    new Notification(title, {
      body,
      icon: "/crm-logo.png",
      badge: "/crm-logo.png",
    });
  } catch (error) {
    console.error("Browser notification failed:", error);
  }
}

function sendWindowAlert(message) {
  try {
    window.dispatchEvent(
      new CustomEvent("crm-system-notification", {
        detail: {
          message,
          time: getTimeNow(),
        },
      })
    );
  } catch (error) {
    console.error("CRM notification event failed:", error);
  }
}

function getExtensionActivity() {
  return new Promise((resolve) => {
    try {
      const timeout = setTimeout(() => {
        window.removeEventListener("message", handleMessage);

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

export default function AutoLogout() {
  useEffect(() => {
    if (!AUTO_LOGOUT_ENABLED) return;

    const role = localStorage.getItem("crmRole");
    const userId = localStorage.getItem("crmUserId");
    const userName = localStorage.getItem("crmUserName");

    if (role !== "agent" || !userId) return;

    let warningTimer;
    let fallbackInactivityTimer;
    let activityCheckTimer;
    let shiftTimer;

    let shiftStartTime = "";
    let shiftEndTime = "";

    let shiftCheckoutStarted = false;
    let autoLogoutStarted = false;
    let warningShown = false;

    let fallbackLastActivity = Date.now();

    requestNotificationPermission();

    async function loadAgentShift() {
      try {
        const response = await sheetsPost({
          action: "getAgents",
        });

        const agents = response?.data || [];

        const currentAgent = agents.find(
          (agent) =>
            String(agent.AgentID || "").toUpperCase() ===
            String(userId || "").toUpperCase()
        );

        shiftStartTime =
          currentAgent?.ShiftStart || currentAgent?.EntryTime || "07:00 PM";
        shiftEndTime = currentAgent?.ShiftEnd || "";
      } catch (error) {
        console.error("Shift time load failed:", error);
      }
    }

    function getCurrentStatus() {
      return localStorage.getItem(`crmCurrentStatus:${userId}`) || "Active";
    }

    function clearLoginStorage() {
      localStorage.removeItem("crmRole");
      localStorage.removeItem("crmUserId");
      localStorage.removeItem("crmUserName");
    }

    function showInactivityWarning() {
      if (warningShown || autoLogoutStarted || shiftCheckoutStarted) return;

      const status = getCurrentStatus();

      if (status !== "Active") return;

      warningShown = true;

      sendBrowserNotification(
        "CRM Auto Logout Warning",
        "You will be auto logged out in 30 seconds due to browser inactivity."
      );

      sendWindowAlert(
        "You will be auto logged out in 30 seconds due to browser inactivity."
      );
    }

    async function autoCheckoutByShiftEnd() {
      if (shiftCheckoutStarted) return;

      const status = getCurrentStatus();

      if (status === "Checked Out") return;
      if (!shiftStartTime || !shiftEndTime) return;
      if (!hasShiftEnded(shiftStartTime, shiftEndTime)) return;

      shiftCheckoutStarted = true;

      const logoutTime = getTimeNow();

      localStorage.setItem(`crmCurrentStatus:${userId}`, "Checked Out");
      window.dispatchEvent(new Event("crm-status-change"));

      sendBrowserNotification(
        "Shift Ended",
        "Your shift has ended. CRM has checked you out automatically."
      );

      sendWindowAlert(
        "Your shift has ended. CRM has checked you out automatically."
      );

      try {
        await sheetsPost({
          action: "autoCheckout",
          agentId: userId,
          agentName: userName || userId,
          logoutTime,
        });
      } catch (error) {
        console.error("Shift auto checkout failed:", error);
      }

      clearTimeout(warningTimer);
      clearTimeout(fallbackInactivityTimer);
      clearInterval(activityCheckTimer);
      clearInterval(shiftTimer);

      clearLoginStorage();

      setTimeout(() => {
        window.location.href = "/login?reason=shift-ended";
      }, 1200);
    }

    async function autoLogoutByInactivity() {
      if (autoLogoutStarted || shiftCheckoutStarted) return;

      const status = getCurrentStatus();

      if (status !== "Active") {
        warningShown = false;
        return;
      }

      autoLogoutStarted = true;

      sendBrowserNotification(
        "CRM Auto Logout",
        "You have been logged out due to browser inactivity."
      );

      sendWindowAlert("You have been logged out due to browser inactivity.");

      try {
        await sheetsPost({
          action: "autoLogout",
          agentId: userId,
          agentName: userName || userId,
        });
      } catch (error) {
        console.error("Auto logout failed:", error);
      }

      clearLoginStorage();

      setTimeout(() => {
        window.location.href = "/login?reason=inactive";
      }, 1200);
    }

    function resetFallbackTimer() {
      if (autoLogoutStarted || shiftCheckoutStarted) return;

      fallbackLastActivity = Date.now();
      warningShown = false;

      clearTimeout(warningTimer);
      clearTimeout(fallbackInactivityTimer);

      warningTimer = setTimeout(
        showInactivityWarning,
        INACTIVITY_LIMIT - WARNING_BEFORE_LOGOUT
      );

      fallbackInactivityTimer = setTimeout(
        autoLogoutByInactivity,
        INACTIVITY_LIMIT
      );
    }

    async function checkBrowserActivity() {
      if (autoLogoutStarted || shiftCheckoutStarted) return;

      const status = getCurrentStatus();

      if (status !== "Active") {
        warningShown = false;
        clearTimeout(warningTimer);
        return;
      }

      const extension = await getExtensionActivity();

      const lastActivity = extension.connected
        ? extension.lastActivity
        : fallbackLastActivity;

      if (extension.connected) {
      clearTimeout(fallbackInactivityTimer);

      if (extension.lastActivity && Date.now() - extension.lastActivity < INACTIVITY_LIMIT) {
      clearTimeout(warningTimer);
      warningShown = false;
      }
       }

      if (!lastActivity) {
        resetFallbackTimer();
        return;
      }

      const inactiveFor = Date.now() - lastActivity;
      const warningAt = INACTIVITY_LIMIT - WARNING_BEFORE_LOGOUT;

      if (inactiveFor < warningAt) {
        warningShown = false;
        clearTimeout(warningTimer);
        return;
      }

      if (inactiveFor >= warningAt && inactiveFor < INACTIVITY_LIMIT) {
        showInactivityWarning();
        return;
      }

      if (inactiveFor >= INACTIVITY_LIMIT) {
        await autoLogoutByInactivity();
      }
    }

    const fallbackEvents = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
      "focus",
    ];

    fallbackEvents.forEach((event) => {
      window.addEventListener(event, resetFallbackTimer);
    });

    loadAgentShift().then(() => {
      autoCheckoutByShiftEnd();

      shiftTimer = setInterval(() => {
        autoCheckoutByShiftEnd();
      }, SHIFT_CHECK_INTERVAL);
    });

    resetFallbackTimer();

    activityCheckTimer = setInterval(() => {
      checkBrowserActivity();
    }, ACTIVITY_CHECK_INTERVAL);

    checkBrowserActivity();

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(fallbackInactivityTimer);
      clearInterval(activityCheckTimer);
      clearInterval(shiftTimer);

      fallbackEvents.forEach((event) => {
        window.removeEventListener(event, resetFallbackTimer);
      });
    };
  }, []);

  return null;
}