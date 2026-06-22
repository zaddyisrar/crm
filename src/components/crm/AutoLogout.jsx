"use client";

import { useEffect } from "react";
import { sheetsPost } from "@/lib/sheetsApi";

const AUTO_LOGOUT_ENABLED = true;

// Production: 3 minutes
const INACTIVITY_LIMIT = 5 * 60 * 1000;

export default function AutoLogout() {
  useEffect(() => {
    if (!AUTO_LOGOUT_ENABLED) return;

    const role = localStorage.getItem("crmRole");
    const userId = localStorage.getItem("crmUserId");
    const userName = localStorage.getItem("crmUserName");

    if (role !== "agent" || !userId) return;

    let timer;

    const logoutUser = async () => {
      try {
        await sheetsPost({
          action: "autoLogout",
          agentId: userId,
          agentName: userName || userId,
        });
      } catch (error) {
        console.error("Auto logout failed:", error);
      }

      localStorage.removeItem("crmRole");
      localStorage.removeItem("crmUserId");
      localStorage.removeItem("crmUserName");

      window.location.href = "/login?reason=inactive";
    };

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(logoutUser, INACTIVITY_LIMIT);
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(timer);

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return null;
}