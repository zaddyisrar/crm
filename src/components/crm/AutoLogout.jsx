"use client";

import { useEffect } from "react";
import { sheetsPost } from "@/lib/sheetsApi";

export default function AutoLogout() {
  useEffect(() => {
    const role = localStorage.getItem("crmRole");
    const userId = localStorage.getItem("crmUserId");
    const userName = localStorage.getItem("crmUserName");

    if (role !== "agent" || !userId) return;

    let timer;

    const logoutUser = async () => {
      try {
        await sheetsPost({
          action: "checkOut",
          agentId: userId,
          name: userName || userId,
        });
      } catch (error) {
        console.error("Auto logout checkout failed:", error);
      }

      localStorage.removeItem("crmRole");
      localStorage.removeItem("crmUserId");
      localStorage.removeItem("crmUserName");

      window.location.href = "/login";
    };

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(logoutUser, 2 * 60 * 1000);
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