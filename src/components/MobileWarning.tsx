"use client";

export default function MobileWarning() {
  return (
    <div className="lg:hidden fixed inset-0 z-[100] bg-background flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-sm">
        <svg
          className="mx-auto text-accent"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
        <h2 className="text-xl font-semibold text-white">
          Best experienced on desktop
        </h2>
        <p className="text-sm text-muted">
          Script-to-Video Studio is a production tool designed for desktop
          screens (1024px+). Please switch to a larger screen for the best
          experience.
        </p>
      </div>
    </div>
  );
}
