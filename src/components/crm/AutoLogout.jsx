"use client";

import { useEffect } from "react";
import { sheetsPost } from "@/lib/sheetsApi";

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

  if (meridian === "PM" && hour !== 12) {
    hour += 12;
  }

  if (meridian === "AM" && hour === 12) {
    hour = 0;
  }

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

  if (startMinutes === null || endMinutes === null) {
    return null;
  }

  const now = new Date();

  let start = buildTodayDateAtMinutes(startMinutes);
  let end = buildTodayDateAtMinutes(endMinutes);

  // Day shift, example: 08:30 AM → 05:30 PM
  if (startMinutes < endMinutes) {
    return {
      start,
      end,
    };
  }

  // Overnight shift, example: 07:00 PM → 04:00 AM
  if (now.getTime() <= end.getTime()) {
    start.setDate(start.getDate() - 1);
  } else {
    end.setDate(end.getDate() + 1);
  }

  return {
    start,
    end,
  };
}

function hasShiftEnded(shiftStart, shiftEnd) {
  const shiftWindow = getCurrentShiftWindow(shiftStart, shiftEnd);

  if (!shiftWindow) return false;

  return new Date() >= shiftWindow.end;
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

  if (Notification.permission === "granted") {
    return true;
  }

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

function setExtensionSession(active, agentId = "") {
  try {
    window.postMessage(
      {
        type: "CRM_SET_EXTENSION_SESSION",
        active: Boolean(active),
        agentId: active ? agentId : "",
      },
      "*"
    );
  } catch (error) {
    // Extension may not be installed.
  }
}

export default function AutoLogout() {
  useEffect(() => {
    const role = localStorage.getItem("crmRole");
    const userId = localStorage.getItem("crmUserId");
    const userName = localStorage.getItem("crmUserName");

    if (role !== "agent" || !userId) {
      return;
    }

    // Keep extension aware that an agent session is active.
    // Inactivity logout is no longer handled by this component.
    setExtensionSession(true, userId);

    let shiftTimer;

    let shiftStartTime = "";
    let shiftEndTime = "";

    let shiftCheckoutStarted = false;

    requestNotificationPermission();

    async function loadAgentShift() {
      try {
        const response = await sheetsPost({
          action: "getAgents",
        });

        const agents = response?.data || [];

        const currentAgent = agents.find((agent) => {
          return (
            String(agent.AgentID || "").trim().toUpperCase() ===
            String(userId || "").trim().toUpperCase()
          );
        });

        shiftStartTime =
          currentAgent?.ShiftStart ||
          currentAgent?.EntryTime ||
          "07:00 PM";

        shiftEndTime = currentAgent?.ShiftEnd || "";
      } catch (error) {
        console.error("Shift time load failed:", error);
      }
    }

    function getCurrentStatus() {
      return (
        localStorage.getItem(`crmCurrentStatus:${userId}`) || "Active"
      );
    }

    function clearLoginStorage() {
      localStorage.removeItem("crmRole");
      localStorage.removeItem("crmUserId");
      localStorage.removeItem("crmUserName");
    }

    function stopShiftTimer() {
      clearInterval(shiftTimer);
    }

    async function autoCheckoutByShiftEnd() {
      if (shiftCheckoutStarted) return;

      const status = getCurrentStatus();

      if (status === "Checked Out") return;
      if (!shiftStartTime || !shiftEndTime) return;
      if (!hasShiftEnded(shiftStartTime, shiftEndTime)) return;

      shiftCheckoutStarted = true;

      const logoutTime = getTimeNow();

      // Instant local UI update
      localStorage.setItem(
        `crmCurrentStatus:${userId}`,
        "Checked Out"
      );

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

      stopShiftTimer();
      setExtensionSession(false);
      clearLoginStorage();

      setTimeout(() => {
        window.location.href = "/login?reason=shift-ended";
      }, 1200);
    }

    loadAgentShift().then(() => {
      autoCheckoutByShiftEnd();

      shiftTimer = setInterval(() => {
        autoCheckoutByShiftEnd();
      }, SHIFT_CHECK_INTERVAL);
    });

    return () => {
      stopShiftTimer();
    };
  }, []);

  return null;
}