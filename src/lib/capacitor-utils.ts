import { Capacitor } from "@capacitor/core"
import { LocalNotifications } from "@capacitor/local-notifications"
import { Haptics, ImpactStyle } from "@capacitor/haptics"
import { Dialog } from "@capacitor/dialog"

export const isNative = Capacitor.isNativePlatform()

// Request notification permissions
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNative) return true

  try {
    const result = await LocalNotifications.requestPermissions()
    return result.display === "granted"
  } catch (error) {
    console.error("Error requesting notification permission:", error)
    return false
  }
}

// Schedule a notification
export async function scheduleNotification(title: string, body: string, delayInSeconds: number) {
  if (!isNative) {
    // Fallback for web
    if ("Notification" in window && Notification.permission === "granted") {
      setTimeout(() => {
        new Notification(title, { body })
      }, delayInSeconds * 1000)
    }
    return
  }

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + delayInSeconds * 1000) },
          sound: undefined,
          attachments: undefined,
          actionTypeId: "",
          extra: null,
        },
      ],
    })
  } catch (error) {
    console.error("Error scheduling notification:", error)
  }
}

// Cancel all notifications
export async function cancelAllNotifications() {
  if (!isNative) return

  try {
    await LocalNotifications.cancel({ notifications: [] })
  } catch (error) {
    console.error("Error canceling notifications:", error)
  }
}

// Trigger haptic feedback
export async function triggerHaptic(style: ImpactStyle = ImpactStyle.Medium) {
  if (!isNative) return

  try {
    await Haptics.impact({ style })
  } catch (error) {
    console.error("Error triggering haptic:", error)
  }
}

// Show dialog
export async function showDialog(title: string, message: string, buttonTitle = "OK"): Promise<void> {
  if (!isNative) {
    alert(`${title}\n\n${message}`)
    return
  }

  try {
    await Dialog.alert({
      title,
      message,
      buttonTitle,
    })
  } catch (error) {
    console.error("Error showing dialog:", error)
  }
}

// Show confirm dialog
export async function showConfirm(title: string, message: string): Promise<boolean> {
  if (!isNative) {
    return confirm(`${title}\n\n${message}`)
  }

  try {
    const result = await Dialog.confirm({
      title,
      message,
      okButtonTitle: "Có",
      cancelButtonTitle: "Không",
    })
    return result.value
  } catch (error) {
    console.error("Error showing confirm:", error)
    return false
  }
}
