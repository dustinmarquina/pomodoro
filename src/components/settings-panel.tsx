import { useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { saveSettings, type PomodoroSettings } from "@/lib/storage";

interface SettingsPanelProps {
  settings: PomodoroSettings;
  onClose: () => void;
  onSave: (settings: PomodoroSettings) => void;
}

export default function SettingsPanel({
  settings,
  onClose,
  onSave,
}: SettingsPanelProps) {
  const [localSettings, setLocalSettings] =
    useState<PomodoroSettings>(settings);

  const handleSave = () => {
    saveSettings(localSettings);
    onSave(localSettings);
  };

  const updateSetting = <K extends keyof PomodoroSettings>(
    key: K,
    value: PomodoroSettings[K]
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col pt-[calc(env(safe-area-inset-top)-16px)]">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">Cài đặt</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className="rounded-full"
          >
            <Check className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Timer Durations */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Thời gian
          </h3>

          {/* Work Duration */}
          <div className="space-y-2">
            <Label htmlFor="work-duration">Thời gian làm việc (phút)</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  updateSetting(
                    "workDuration",
                    Math.max(1, localSettings.workDuration - 5)
                  )
                }
                className="rounded-full"
              >
                -
              </Button>
              <div className="flex-1 text-center">
                <input
                  id="work-duration"
                  type="number"
                  min="1"
                  max="60"
                  value={localSettings.workDuration}
                  onChange={(e) =>
                    updateSetting(
                      "workDuration",
                      Number.parseInt(e.target.value) || 1
                    )
                  }
                  className="w-full text-center text-2xl font-semibold bg-transparent border-none outline-none"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  updateSetting(
                    "workDuration",
                    Math.min(60, localSettings.workDuration + 5)
                  )
                }
                className="rounded-full"
              >
                +
              </Button>
            </div>
          </div>

          {/* Break Duration */}
          <div className="space-y-2">
            <Label htmlFor="break-duration">Thời gian nghỉ ngắn (phút)</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  updateSetting(
                    "breakDuration",
                    Math.max(1, localSettings.breakDuration - 1)
                  )
                }
                className="rounded-full"
              >
                -
              </Button>
              <div className="flex-1 text-center">
                <input
                  id="break-duration"
                  type="number"
                  min="1"
                  max="30"
                  value={localSettings.breakDuration}
                  onChange={(e) =>
                    updateSetting(
                      "breakDuration",
                      Number.parseInt(e.target.value) || 1
                    )
                  }
                  className="w-full text-center text-2xl font-semibold bg-transparent border-none outline-none"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  updateSetting(
                    "breakDuration",
                    Math.min(30, localSettings.breakDuration + 1)
                  )
                }
                className="rounded-full"
              >
                +
              </Button>
            </div>
          </div>

          {/* Long Break Duration */}
          <div className="space-y-2">
            <Label htmlFor="long-break-duration">
              Thời gian nghỉ dài (phút)
            </Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  updateSetting(
                    "longBreakDuration",
                    Math.max(1, localSettings.longBreakDuration - 5)
                  )
                }
                className="rounded-full"
              >
                -
              </Button>
              <div className="flex-1 text-center">
                <input
                  id="long-break-duration"
                  type="number"
                  min="1"
                  max="60"
                  value={localSettings.longBreakDuration}
                  onChange={(e) =>
                    updateSetting(
                      "longBreakDuration",
                      Number.parseInt(e.target.value) || 1
                    )
                  }
                  className="w-full text-center text-2xl font-semibold bg-transparent border-none outline-none"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  updateSetting(
                    "longBreakDuration",
                    Math.min(60, localSettings.longBreakDuration + 5)
                  )
                }
                className="rounded-full"
              >
                +
              </Button>
            </div>
          </div>

          {/* Sessions Until Long Break */}
          <div className="space-y-2">
            <Label htmlFor="sessions-until-long-break">
              Số phiên trước khi nghỉ dài
            </Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  updateSetting(
                    "sessionsUntilLongBreak",
                    Math.max(1, localSettings.sessionsUntilLongBreak - 1)
                  )
                }
                className="rounded-full"
              >
                -
              </Button>
              <div className="flex-1 text-center">
                <input
                  id="sessions-until-long-break"
                  type="number"
                  min="1"
                  max="10"
                  value={localSettings.sessionsUntilLongBreak}
                  onChange={(e) =>
                    updateSetting(
                      "sessionsUntilLongBreak",
                      Number.parseInt(e.target.value) || 1
                    )
                  }
                  className="w-full text-center text-2xl font-semibold bg-transparent border-none outline-none"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  updateSetting(
                    "sessionsUntilLongBreak",
                    Math.min(10, localSettings.sessionsUntilLongBreak + 1)
                  )
                }
                className="rounded-full"
              >
                +
              </Button>
            </div>
          </div>
        </div>

        {/* Sound Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Âm thanh
          </h3>

          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div>
              <Label htmlFor="sound-enabled" className="text-base">
                Âm báo
              </Label>
              <p className="text-sm text-muted-foreground">
                Phát âm thanh khi hết phiên
              </p>
            </div>
            <Switch
              id="sound-enabled"
              checked={localSettings.soundEnabled}
              onCheckedChange={(checked) =>
                updateSetting("soundEnabled", checked)
              }
            />
          </div>
        </div>

        {/* Info */}
        <div className="p-4 rounded-lg bg-muted/30 border">
          <h3 className="font-medium mb-2">Về Pomodoro Timer</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Kỹ thuật Pomodoro giúp bạn tập trung làm việc hiệu quả bằng cách
            chia nhỏ công việc thành các phiên 25 phút, xen kẽ với thời gian
            nghỉ ngắn.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="p-4 border-t">
        <Button onClick={handleSave} className="w-full rounded-full" size="lg">
          Lưu cài đặt
        </Button>
      </div>
    </div>
  );
}
