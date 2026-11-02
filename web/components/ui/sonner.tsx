"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  // This Toaster loads after hydration (ToasterLauncher). Sonner keeps toasts
  // raised before it subscribed but never delivers them, so publish those once.
  // Sonner's own effect runs first, as a child, so it is listening by now.
  useEffect(() => {
    for (const pending of toast.getToasts()) {
      if ("dismiss" in pending) continue
      toast.message(pending.title, pending)
    }
  }, [])

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border/60 group-[.toaster]:shadow-sm group-[.toaster]:rounded group-[.toaster]:font-sans",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:font-medium",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
