export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const result = await Notification.requestPermission();
  return result === "granted";
};

export const scheduleReminderNotification = (hourStr) => {
  // Save preferred reminder time to localStorage
  localStorage.setItem("ps_reminder_hour", hourStr);
  // Start daily check
  startReminderCheck();
};

export const cancelReminder = () => {
  localStorage.removeItem("ps_reminder_hour");
  localStorage.removeItem("ps_reminder_last");
};

export const getReminderHour = () =>
  localStorage.getItem("ps_reminder_hour") || null;

export const startReminderCheck = () => {
  // Check every minute if it's time to remind
  setInterval(() => {
    const hour = localStorage.getItem("ps_reminder_hour");
    if (!hour || Notification.permission !== "granted") return;

    const now       = new Date();
    const [h, m]    = hour.split(":").map(Number);
    const lastFired = localStorage.getItem("ps_reminder_last");
    const todayKey  = now.toDateString() + "-" + hour;

    if (now.getHours() === h && now.getMinutes() === m && lastFired !== todayKey) {
      localStorage.setItem("ps_reminder_last", todayKey);
      new Notification("Practice Studio 🎵", {
        body: "Time to practice. Even 20 minutes makes a difference.",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
      });
    }
  }, 60 * 1000);
};