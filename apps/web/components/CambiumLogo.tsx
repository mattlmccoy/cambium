// ─── Cambium Logo Mark ──────────────────────────────────────────
// Stylized tree cross-section (growth rings) representing the cambium layer.
// Used alongside the "CAMBIUM" wordmark for brand identity.

export function CambiumLogoMark({
  size = 24,
  className = "",
  color = "currentColor",
}: {
  size?: number;
  className?: string;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-label="Cambium logo"
    >
      {/* Outer bark */}
      <circle cx="16" cy="16" r="14" stroke={color} strokeWidth="1.5" opacity="0.25" />
      {/* Growth rings */}
      <circle cx="16" cy="16" r="10.5" stroke={color} strokeWidth="1" opacity="0.35" />
      <circle cx="16" cy="16" r="7" stroke={color} strokeWidth="1" opacity="0.5" />
      <circle cx="16" cy="16" r="4" stroke={color} strokeWidth="1" opacity="0.7" />
      {/* Heartwood center */}
      <circle cx="16" cy="16" r="1.5" fill={color} opacity="0.9" />
    </svg>
  );
}

export function CambiumWordmark({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <CambiumLogoMark size={22} />
      <span className="text-lg font-light tracking-[0.15em] text-stone-900">
        CAMBIUM
      </span>
    </span>
  );
}
