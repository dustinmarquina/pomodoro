export interface PomodoroSession {
  id: string
  type: "work" | "break"
  duration: number
  completedAt: string
}

const STORAGE_KEY = "pomodoro_sessions"
const SETTINGS_KEY = "pomodoro_settings"

export interface PomodoroSettings {
  workDuration: number
  breakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
  soundEnabled: boolean
}

export const defaultSettings: PomodoroSettings = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  soundEnabled: true,
}

export function getSessions(): PomodoroSession[] {
  if (typeof window === "undefined") return []

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function addSession(session: Omit<PomodoroSession, "id" | "completedAt">): void {
  const sessions = getSessions()
  const newSession: PomodoroSession = {
    ...session,
    id: Date.now().toString(),
    completedAt: new Date().toISOString(),
  }

  sessions.unshift(newSession)

  // Keep only last 100 sessions
  if (sessions.length > 100) {
    sessions.splice(100)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

export function clearSessions(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getSettings(): PomodoroSettings {
  if (typeof window === "undefined") return defaultSettings

  try {
    const data = localStorage.getItem(SETTINGS_KEY)
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings: PomodoroSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function getTodayStats() {
  const sessions = getSessions()
  const today = new Date().toDateString()

  const todaySessions = sessions.filter((s) => new Date(s.completedAt).toDateString() === today)

  const workSessions = todaySessions.filter((s) => s.type === "work").length
  const totalMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0)

  return {
    workSessions,
    totalMinutes,
    sessions: todaySessions,
  }
}
