"use client";

import { useEffect } from "react";
import { sheetsPost } from "@/lib/sheetsApi";

const AUTO_LOGOUT_ENABLED = true;
const INACTIVITY_LIMIT = 5 * 60 * 1000;
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

function getCurrentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function hasShiftEnded(shiftEnd) {
  const shiftEndMinutes = parseTimeToMinutes(shiftEnd);
  if (shiftEndMinutes === null) return false;

  const nowMinutes = getCurrentMinutes();

  return nowMinutes >= shiftEndMinutes;
}

function getTimeNow() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AutoLogout() {
  useEffect(() => {
    if (!AUTO_LOGOUT_ENABLED) return;

    const role = localStorage.getItem("crmRole");
    const userId = localStorage.getItem("crmUserId");
    const userName = localStorage.getItem("crmUserName");

    if (role !== "agent" || !userId) return;

    let inactivityTimer;
    let shiftTimer;
    let shiftEndTime = "";
    let shiftCheckoutStarted = false;
    let autoLogoutStarted = false;

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

        shiftEndTime = currentAgent?.ShiftEnd || "";
      } catch (error) {
        console.error("Shift time load failed:", error);
      }
    }

    function getCurrentStatus() {
      return (
        localStorage.getItem(`crmCurrentStatus:${userId}`) ||
        "Active"
      );
    }

    function clearLoginStorage() {
      localStorage.removeItem("crmRole");
      localStorage.removeItem("crmUserId");
      localStorage.removeItem("crmUserName");
    }

    async function autoCheckoutByShiftEnd() {
      if (shiftCheckoutStarted) return;

      const status = getCurrentStatus();

      if (status === "Checked Out") return;
      if (!shiftEndTime) return;
      if (!hasShiftEnded(shiftEndTime)) return;

      shiftCheckoutStarted = true;

      const logoutTime = getTimeNow();

      localStorage.setItem(`crmCurrentStatus:${userId}`, "Checked Out");
      window.dispatchEvent(new Event("crm-status-change"));

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

      clearTimeout(inactivityTimer);
      clearInterval(shiftTimer);

      clearLoginStorage();

      window.location.href = "/login?reason=shift-ended";
    }

    async function autoLogoutByInactivity() {
      if (autoLogoutStarted || shiftCheckoutStarted) return;

      const status = getCurrentStatus();

      if (status !== "Active") {
        resetInactivityTimer();
        return;
      }

      autoLogoutStarted = true;

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

      window.location.href = "/login?reason=inactive";
    }

    function resetInactivityTimer() {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(autoLogoutByInactivity, INACTIVITY_LIMIT);
    }

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    loadAgentShift().then(() => {
      autoCheckoutByShiftEnd();

      shiftTimer = setInterval(() => {
        autoCheckoutByShiftEnd();
      }, SHIFT_CHECK_INTERVAL);
    });

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      clearInterval(shiftTimer);

      events.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, []);

  return null;
}