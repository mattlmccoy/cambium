// ─── Product Silhouette Illustrations ─────────────────────────────
// Minimal line-art SVGs for each product type, used on landing page cards.
// Drawn in a consistent style: thin white strokes, slightly transparent.

const STROKE_PROPS = {
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

export function SideTableIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className}>
      {/* Table top — round */}
      <ellipse cx="60" cy="38" rx="38" ry="10" {...STROKE_PROPS} />
      {/* Legs */}
      <line x1="35" y1="44" x2="30" y2="100" {...STROKE_PROPS} />
      <line x1="85" y1="44" x2="90" y2="100" {...STROKE_PROPS} />
      <line x1="60" y1="48" x2="60" y2="100" {...STROKE_PROPS} />
      {/* Cross stretcher */}
      <line x1="34" y1="80" x2="86" y2="80" {...STROKE_PROPS} strokeOpacity={0.5} />
    </svg>
  );
}

export function TableIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className}>
      {/* Table top — rectangular, perspective */}
      <path d="M12 34 L60 24 L108 34 L60 44 Z" {...STROKE_PROPS} />
      {/* Top thickness */}
      <path d="M12 34 L12 38 L60 48 L108 38 L108 34" {...STROKE_PROPS} strokeOpacity={0.5} />
      <line x1="60" y1="44" x2="60" y2="48" {...STROKE_PROPS} strokeOpacity={0.5} />
      {/* Legs */}
      <line x1="20" y1="37" x2="20" y2="100" {...STROKE_PROPS} />
      <line x1="100" y1="37" x2="100" y2="100" {...STROKE_PROPS} />
      <line x1="60" y1="48" x2="60" y2="100" {...STROKE_PROPS} strokeOpacity={0.4} />
    </svg>
  );
}

export function ChairIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className}>
      {/* Back rest */}
      <path d="M30 16 L30 60" {...STROKE_PROPS} />
      <path d="M50 14 L50 60" {...STROKE_PROPS} />
      {/* Back slats */}
      <line x1="30" y1="26" x2="50" y2="24" {...STROKE_PROPS} strokeOpacity={0.5} />
      <line x1="30" y1="40" x2="50" y2="38" {...STROKE_PROPS} strokeOpacity={0.5} />
      {/* Seat */}
      <path d="M26 60 L54 58 L96 62 L68 66 Z" {...STROKE_PROPS} />
      {/* Seat thickness */}
      <path d="M26 60 L26 64 L68 70 L96 66 L96 62" {...STROKE_PROPS} strokeOpacity={0.4} />
      <line x1="68" y1="66" x2="68" y2="70" {...STROKE_PROPS} strokeOpacity={0.4} />
      {/* Front legs */}
      <line x1="90" y1="65" x2="92" y2="104" {...STROKE_PROPS} />
      <line x1="62" y1="69" x2="60" y2="104" {...STROKE_PROPS} />
      {/* Back legs */}
      <line x1="30" y1="63" x2="28" y2="104" {...STROKE_PROPS} />
    </svg>
  );
}

export function ShelfIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className}>
      {/* Uprights */}
      <line x1="24" y1="12" x2="24" y2="108" {...STROKE_PROPS} />
      <line x1="96" y1="12" x2="96" y2="108" {...STROKE_PROPS} />
      {/* Shelves */}
      <line x1="24" y1="18" x2="96" y2="18" {...STROKE_PROPS} />
      <line x1="24" y1="42" x2="96" y2="42" {...STROKE_PROPS} />
      <line x1="24" y1="66" x2="96" y2="66" {...STROKE_PROPS} />
      <line x1="24" y1="90" x2="96" y2="90" {...STROKE_PROPS} />
      <line x1="24" y1="108" x2="96" y2="108" {...STROKE_PROPS} />
      {/* Depth lines for 3D effect */}
      <line x1="24" y1="18" x2="18" y2="14" {...STROKE_PROPS} strokeOpacity={0.3} />
      <line x1="24" y1="42" x2="18" y2="38" {...STROKE_PROPS} strokeOpacity={0.3} />
      <line x1="24" y1="66" x2="18" y2="62" {...STROKE_PROPS} strokeOpacity={0.3} />
      <line x1="24" y1="90" x2="18" y2="86" {...STROKE_PROPS} strokeOpacity={0.3} />
    </svg>
  );
}

// Map product slug to illustration component
export const PRODUCT_ILLUSTRATIONS: Record<string, React.FC<{ className?: string }>> = {
  "side-table": SideTableIllustration,
  "table": TableIllustration,
  "chair": ChairIllustration,
  "shelf": ShelfIllustration,
};
