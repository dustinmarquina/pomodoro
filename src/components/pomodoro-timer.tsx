import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  History,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  addSession,
  getSettings,
  saveSettings,
  type PomodoroSettings,
} from "@/lib/storage";
import {
  requestNotificationPermission,
  scheduleNotification,
  triggerHaptic,
  showDialog,
  isNative,
} from "@/lib/capacitor-utils";
import { ImpactStyle } from "@capacitor/haptics";
import SettingsPanel from "./settings-panel";
import HistoryPanel from "./history-panel";
import { LocalNotifications } from "@capacitor/local-notifications";
import { App as CapacitorApp } from "@capacitor/app";
import type { PluginListenerHandle } from "@capacitor/core";

type TimerMode = "work" | "break" | "longBreak";

const NOTIF_ID = 1001; // single scheduled notification id

export default function PomodoroTimer() {
  const [settings, setSettings] = useState<PomodoroSettings | null>(null);
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(false);
  const [targetAt, setTargetAt] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  useEffect(() => {
    const loadedSettings = getSettings();
    setSettings(loadedSettings);
    setTimeLeft(loadedSettings.workDuration * 60);

    requestNotificationPermission().then((granted) => {
      setHasNotificationPermission(granted);
      if (!granted && isNative) {
        console.warn("[v0] Notification permission not granted");
      }
    });

    if (
      !isNative &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // restore pending target time if any (from localStorage)
    const saved = localStorage.getItem("pomodoro_targetAt");
    if (saved) {
      const ts = Number(saved);
      if (!Number.isNaN(ts)) {
        setTargetAt(ts);
        const remaining = Math.max(0, Math.floor((ts - Date.now()) / 1000));
        if (remaining > 0 && settings) {
          setTimeLeft(remaining);
          setIsRunning(true);
        }
      }
    }

    let handle: PluginListenerHandle | undefined;

    (async () => {
      handle = await CapacitorApp.addListener(
        "appStateChange",
        ({ isActive }) => {
          if (isActive && targetAt) {
            const remaining = Math.max(
              0,
              Math.floor((targetAt - Date.now()) / 1000)
            );
            setTimeLeft(remaining);
            if (remaining <= 0) {
              handleTimerComplete();
            }
          }
        }
      );
    })();

    return () => {
      handle?.remove();
    };
  }, [settings, targetAt]);

  useEffect(() => {
    if (!isRunning || !settings) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("pomodoro_targetAt");
          setTargetAt(null);
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, settings]);

  const handleTimerComplete = async () => {
    setIsRunning(false);

    try {
      await LocalNotifications.cancel({ notifications: [{ id: NOTIF_ID }] });
    } catch {}
    localStorage.removeItem("pomodoro_targetAt");
    setTargetAt(null);

    await triggerHaptic(ImpactStyle.Heavy);

    if (settings?.soundEnabled) {
      playCompletionSound();
    }

    if (settings) {
      const duration =
        mode === "work"
          ? settings.workDuration
          : mode === "break"
          ? settings.breakDuration
          : settings.longBreakDuration;

      addSession({
        type: mode === "work" ? "work" : "break",
        duration,
      });
    }

    let nextMode: TimerMode = "work";
    let message = "";

    if (mode === "work") {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);

      if (
        settings &&
        newCompletedSessions % settings.sessionsUntilLongBreak === 0
      ) {
        nextMode = "longBreak";
        message = `Tuyệt vời! Bạn đã hoàn thành ${newCompletedSessions} phiên. Hãy nghỉ ngơi dài!`;
      } else {
        nextMode = "break";
        message = "Phiên làm việc hoàn thành! Hãy nghỉ ngơi một chút.";
      }
    } else {
      nextMode = "work";
      message = "Đã nghỉ xong! Sẵn sàng cho phiên làm việc tiếp theo.";
    }

    if (hasNotificationPermission || !isNative) {
      await scheduleNotification(
        mode === "work" ? "Phiên làm việc hoàn thành!" : "Đã hết giờ nghỉ!",
        message,
        0
      );
    }

    await showDialog(
      mode === "work" ? "Phiên làm việc hoàn thành!" : "Đã hết giờ nghỉ!",
      message
    );

    switchMode(nextMode);
  };

  const playCompletionSound = () => {
    try {
      const audio = new Audio("/notification.mp3");
      audio.play().catch((error) => {
        console.warn("[v0] Could not play sound:", error);
      });
    } catch (error) {
      console.warn("[v0] Audio not supported:", error);
    }
  };

  const switchMode = (newMode: TimerMode) => {
    if (!settings) return;

    setMode(newMode);
    setIsRunning(false);

    const duration =
      newMode === "work"
        ? settings.workDuration
        : newMode === "break"
        ? settings.breakDuration
        : settings.longBreakDuration;

    // clear any pending target when switching modes
    localStorage.removeItem("pomodoro_targetAt");
    setTargetAt(null);

    setTimeLeft(duration * 60);
  };

  const toggleTimer = async () => {
    await triggerHaptic(ImpactStyle.Light);
    if (!settings) return;

    if (!isRunning) {
      // starting the timer: compute target timestamp and schedule a local notification
      const endTs = Date.now() + timeLeft * 1000;
      setTargetAt(endTs);
      localStorage.setItem("pomodoro_targetAt", String(endTs));

      // schedule a fire-at notification so iOS/Android can alert in background
      try {
        const title =
          mode === "work" ? "Phiên làm việc hoàn thành!" : "Đã hết giờ nghỉ!";
        const body =
          mode === "work"
            ? "Hết giờ làm việc. Nghỉ ngơi một chút nhé."
            : mode === "break"
            ? "Hết giờ nghỉ. Cùng quay lại làm việc!"
            : "Hết giờ nghỉ dài. Bắt đầu phiên làm việc mới nào!";
        await LocalNotifications.schedule({
          notifications: [
            {
              id: NOTIF_ID,
              title,
              body,
              schedule: { at: new Date(endTs) },
            },
          ],
        });
      } catch (e) {
        console.warn("Failed to schedule background notification", e);
      }

      setIsRunning(true);
    } else {
      // pausing: cancel scheduled notification and keep remaining time
      try {
        await LocalNotifications.cancel({ notifications: [{ id: NOTIF_ID }] });
      } catch {}
      localStorage.removeItem("pomodoro_targetAt");
      setTargetAt(null);
      setIsRunning(false);
    }
  };

  const resetTimer = async () => {
    if (!settings) return;

    await triggerHaptic(ImpactStyle.Medium);
    setIsRunning(false);

    try {
      await LocalNotifications.cancel({ notifications: [{ id: NOTIF_ID }] });
    } catch {}
    localStorage.removeItem("pomodoro_targetAt");
    setTargetAt(null);

    const duration =
      mode === "work"
        ? settings.workDuration
        : mode === "break"
        ? settings.breakDuration
        : settings.longBreakDuration;

    setTimeLeft(duration * 60);
  };

  const adjustDuration = async (minutes: number) => {
    if (!settings || isRunning) return;

    await triggerHaptic(ImpactStyle.Light);

    const currentDuration =
      mode === "work"
        ? settings.workDuration
        : mode === "break"
        ? settings.breakDuration
        : settings.longBreakDuration;

    const newDuration = Math.max(1, Math.min(60, currentDuration + minutes));

    const updatedSettings = {
      ...settings,
      [mode === "work"
        ? "workDuration"
        : mode === "break"
        ? "breakDuration"
        : "longBreakDuration"]: newDuration,
    };

    setSettings(updatedSettings);
    saveSettings(updatedSettings);
    setTimeLeft(newDuration * 60);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const progress = settings
    ? timeLeft /
      (mode === "work"
        ? settings.workDuration * 60
        : mode === "break"
        ? settings.breakDuration * 60
        : settings.longBreakDuration * 60)
    : 1;

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="relative h-dvh flex flex-col pt-[calc(env(safe-area-inset-top)-8px)] overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-semibold">Pomodoro Timer</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(true)}
            className="rounded-full"
          >
            <History className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            className="rounded-full"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Timer */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        {/* Mode Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 md:mb-12">
          <Button
            variant={mode === "work" ? "default" : "outline"}
            onClick={() => switchMode("work")}
            disabled={isRunning}
            className="rounded-full px-5"
          >
            Làm việc
          </Button>
          <Button
            variant={mode === "break" ? "default" : "outline"}
            onClick={() => switchMode("break")}
            disabled={isRunning}
            className="rounded-full px-5"
          >
            Nghỉ ngắn
          </Button>
          <Button
            variant={mode === "longBreak" ? "default" : "outline"}
            onClick={() => switchMode("longBreak")}
            disabled={isRunning}
            className="rounded-full px-5"
          >
            Nghỉ dài
          </Button>
        </div>

        {/* Quick Duration Adjustment Buttons */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustDuration(-5)}
            disabled={isRunning}
            className="rounded-full h-9 w-9 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="text-sm text-muted-foreground min-w-[80px] text-center">
            {mode === "work"
              ? `${settings?.workDuration} phút`
              : mode === "break"
              ? `${settings?.breakDuration} phút`
              : `${settings?.longBreakDuration} phút`}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustDuration(5)}
            disabled={isRunning}
            className="rounded-full h-9 w-9 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Timer Circle */}
        <div className="relative mb-6 md:mb-10 w-[min(74vw,50vh)] aspect-square">
          <svg viewBox="0 0 300 300" className="w-full h-full -rotate-90">
            {/* Background circle */}
            <circle
              cx="150"
              cy="150"
              r="140"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx="150"
              cy="150"
              r="140"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 140}`}
              strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress)}`}
              className={cn(
                "transition-all duration-1000 ease-linear",
                mode === "work" ? "text-primary" : "text-chart-2",
                isRunning && "animate-pulse-ring"
              )}
              strokeLinecap="round"
            />
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-bold tabular-nums leading-none text-[clamp(40px,12vw,64px)]">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {mode === "work"
                ? "Tập trung làm việc"
                : mode === "break"
                ? "Nghỉ ngơi"
                : "Nghỉ dài"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button
            size="lg"
            onClick={toggleTimer}
            className="rounded-full w-20 h-20"
          >
            {isRunning ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={resetTimer}
            className="rounded-full w-16 h-16 bg-transparent"
          >
            <RotateCcw className="h-6 w-6" />
          </Button>
        </div>

        {/* Session Counter */}
        <div className="mt-8 text-center">
          <div className="text-sm text-muted-foreground">
            Phiên đã hoàn thành
          </div>
          <div className="text-2xl font-semibold mt-1">{completedSessions}</div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(newSettings) => {
            setSettings(newSettings);
            setShowSettings(false);
            const duration =
              mode === "work"
                ? newSettings.workDuration
                : mode === "break"
                ? newSettings.breakDuration
                : newSettings.longBreakDuration;
            setTimeLeft(duration * 60);
            setIsRunning(false);
          }}
        />
      )}

      {/* History Panel */}
      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
    </div>
  );
}
