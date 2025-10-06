import { useState, useEffect } from "react";
import { X, Trash2, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getSessions,
  clearSessions,
  getTodayStats,
  type PomodoroSession,
} from "@/lib/storage";
import { showConfirm } from "@/lib/capacitor-utils";

interface HistoryPanelProps {
  onClose: () => void;
}

export default function HistoryPanel({ onClose }: HistoryPanelProps) {
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [todayStats, setTodayStats] = useState({
    workSessions: 0,
    totalMinutes: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSessions(getSessions());
    setTodayStats(getTodayStats());
  };

  const handleClearHistory = async () => {
    const confirmed = await showConfirm(
      "Xóa lịch sử",
      "Bạn có chắc chắn muốn xóa toàn bộ lịch sử phiên làm việc?"
    );

    if (confirmed) {
      clearSessions();
      loadData();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hôm qua";
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupSessionsByDate = () => {
    const groups: { [key: string]: PomodoroSession[] } = {};

    sessions.forEach((session) => {
      const dateKey = new Date(session.completedAt).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(session);
    });

    return Object.entries(groups).map(([dateKey, sessions]) => ({
      date: dateKey,
      sessions,
    }));
  };

  const groupedSessions = groupSessionsByDate();

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col pt-[calc(env(safe-area-inset-top)-16px)] pb-[env(safe-area-inset-bottom)]">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">Lịch sử</h2>
        <div className="flex items-center gap-2">
          {sessions.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearHistory}
              className="rounded-full"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
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

      {/* Stats */}
      <div className="p-4 border-b bg-muted/30">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background rounded-lg p-4 border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Hôm nay</span>
            </div>
            <div className="text-2xl font-bold">{todayStats.workSessions}</div>
            <div className="text-xs text-muted-foreground">phiên làm việc</div>
          </div>
          <div className="bg-background rounded-lg p-4 border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Tổng thời gian</span>
            </div>
            <div className="text-2xl font-bold">{todayStats.totalMinutes}</div>
            <div className="text-xs text-muted-foreground">phút</div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-muted-foreground mb-2">Chưa có lịch sử</div>
            <div className="text-sm text-muted-foreground">
              Hoàn thành phiên đầu tiên để xem lịch sử
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {groupedSessions.map((group) => (
              <div key={group.date}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {formatDate(group.sessions[0].completedAt)}
                </h3>
                <div className="space-y-2">
                  {group.sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            session.type === "work"
                              ? "bg-primary"
                              : "bg-chart-2"
                          }`}
                        />
                        <div>
                          <div className="font-medium">
                            {session.type === "work" ? "Làm việc" : "Nghỉ ngơi"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {session.duration} phút
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(session.completedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
