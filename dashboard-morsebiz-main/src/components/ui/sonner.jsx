"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="top-center"
      duration={3000}
      closeButton={true}
      richColors={true}
      expand={true}
      visibleToasts={5}
      gap={16}
      offset={32}
      toastOptions={{
        duration: 2500,
        closeButton: false,
        dismissible: true,
        className: 'toast-with-progress',
        style: {
          background: 'var(--popover)',
          color: 'var(--popover-foreground)',
          border: '1px solid var(--border)',
        }
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--close-button-hover-bg": "var(--muted)",
          "--close-button-hover-border": "var(--border)"
        }
      }
      {...props} />
  );
}

export { Toaster }
