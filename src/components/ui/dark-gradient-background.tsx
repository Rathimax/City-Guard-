import type React from "react"

interface GradientBackgroundProps {
  children?: React.ReactNode
  className?: string
}

export function GradientBackground({ children, className = "" }: GradientBackgroundProps) {
  return (
    <div className={`relative min-h-screen w-full ${className}`}>
      {/* Main gradient background */}
      <div
        className="fixed inset-0 transition-colors duration-500"
        style={{
          background: `linear-gradient(180deg, var(--bg-gradient-top) 0%, var(--bg-gradient-bottom) 100%)`,
        }}
      />

      {/* Geometric grid overlay (fixed to not scroll with content) */}
      <div
        className="fixed inset-0 transition-all duration-500 pointer-events-none"
        style={{
          opacity: 'var(--grid-opacity)',
          backgroundImage: `
            linear-gradient(var(--grid-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  )
}
