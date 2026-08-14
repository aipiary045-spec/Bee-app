import type { Enums } from "@/types/database";

export type HiveLayer = "supers" | "deeps" | "excluder";

export interface HiveStackProps {
  deepBoxes: number;
  honeySupers: number;
  hasQueenExcluder: boolean;
  status?: Enums<"hive_status">;
  /** Highlight a layer group (used by the interactive configurator). */
  highlight?: HiveLayer | null;
  className?: string;
  /** Draw frame hints and the entrance/bees. Defaults to true. */
  detailed?: boolean;
}

const BOX_X = 10;
const BOX_W = 130;
const COVER_OVERHANG = 6;
const COVER_H = 15;
const INNER_H = 7;
const SUPER_H = 26;
const EXCLUDER_H = 6;
const DEEP_H = 44;
const BOTTOM_H = 16;
const VIEW_W = 150;

type Rect = {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  stroke: string;
  rx?: number;
  layer?: HiveLayer;
  frames?: number;
};

/**
 * Front-on illustration of a Langstroth hive built from its live box
 * configuration: telescoping cover, honey supers, optional queen excluder,
 * brood (deep) boxes, and a bottom board with entrance. Pure/presentational so
 * it renders in both server and client components.
 */
export function HiveStack({
  deepBoxes,
  honeySupers,
  hasQueenExcluder,
  status = "active",
  highlight = null,
  className,
  detailed = true,
}: HiveStackProps) {
  const deeps = Math.max(0, Math.min(6, deepBoxes));
  const supers = Math.max(0, Math.min(8, honeySupers));
  const muted = status !== "active";

  // Wood palette (honey/amber for supers, darker for brood + cover).
  const superFill = muted ? "#d9c39a" : "#efad32";
  const superStroke = muted ? "#b59a63" : "#a35510";
  const deepFill = muted ? "#8c8073" : "#854314";
  const deepStroke = muted ? "#6b5c4c" : "#4a3f35";
  const coverFill = muted ? "#6b5c4c" : "#4a3f35";
  const woodTop = muted ? "#efe7d8" : "#c4730f";

  const rects: Rect[] = [];
  let y = 6; // top padding

  // Telescoping cover
  rects.push({
    key: "cover",
    x: BOX_X - COVER_OVERHANG,
    y,
    w: BOX_W + COVER_OVERHANG * 2,
    h: COVER_H,
    fill: coverFill,
    stroke: deepStroke,
    rx: 3,
  });
  y += COVER_H + 1;

  // Inner cover
  rects.push({
    key: "inner",
    x: BOX_X - 2,
    y,
    w: BOX_W + 4,
    h: INNER_H,
    fill: muted ? "#e7ddc9" : "#e4d0a0",
    stroke: deepStroke,
    rx: 2,
  });
  y += INNER_H + 1;

  // Honey supers (top of the stack)
  for (let i = 0; i < supers; i += 1) {
    rects.push({
      key: `super-${i}`,
      x: BOX_X,
      y,
      w: BOX_W,
      h: SUPER_H,
      fill: superFill,
      stroke: superStroke,
      rx: 2,
      layer: "supers",
      frames: 4,
    });
    y += SUPER_H + 1;
  }

  // Queen excluder sits between supers and brood boxes
  if (hasQueenExcluder) {
    rects.push({
      key: "excluder",
      x: BOX_X - 3,
      y,
      w: BOX_W + 6,
      h: EXCLUDER_H,
      fill: muted ? "#c9ccd1" : "#b9bec6",
      stroke: "#6b7078",
      rx: 2,
      layer: "excluder",
    });
    y += EXCLUDER_H + 1;
  }

  // Brood (deep) boxes
  for (let i = 0; i < deeps; i += 1) {
    rects.push({
      key: `deep-${i}`,
      x: BOX_X,
      y,
      w: BOX_W,
      h: DEEP_H,
      fill: deepFill,
      stroke: deepStroke,
      rx: 2,
      layer: "deeps",
      frames: 6,
    });
    y += DEEP_H + 1;
  }

  const bottomY = y;
  const totalH = bottomY + BOTTOM_H + 4;
  const entranceY = bottomY + 2;

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${totalH}`}
      className={className}
      role="img"
      aria-label={`Hive with ${deeps} brood ${deeps === 1 ? "box" : "boxes"} and ${supers} honey ${supers === 1 ? "super" : "supers"}${hasQueenExcluder ? " and a queen excluder" : ""}`}
      preserveAspectRatio="xMidYMax meet"
    >
      {rects.map((r) => {
        const isHighlighted = highlight != null && r.layer === highlight;
        return (
          <g key={r.key}>
            <rect
              x={r.x}
              y={r.y}
              width={r.w}
              height={r.h}
              rx={r.rx}
              fill={r.fill}
              stroke={isHighlighted ? "#e09518" : r.stroke}
              strokeWidth={isHighlighted ? 3 : 1.5}
            />
            {/* Top edge highlight for a subtle 3D look */}
            <rect
              x={r.x + 1}
              y={r.y + 1}
              width={r.w - 2}
              height={2}
              rx={1}
              fill={woodTop}
              opacity={0.5}
            />
            {/* Frame hints */}
            {detailed && r.frames
              ? Array.from({ length: r.frames - 1 }).map((_, fi) => {
                  const frameCount = r.frames ?? 1;
                  const fx = r.x + (r.w / frameCount) * (fi + 1);
                  return (
                    <line
                      key={fi}
                      x1={fx}
                      y1={r.y + 4}
                      x2={fx}
                      y2={r.y + r.h - 4}
                      stroke={r.stroke}
                      strokeWidth={0.6}
                      opacity={0.35}
                    />
                  );
                })
              : null}
            {isHighlighted ? (
              <rect
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
                rx={r.rx}
                fill="#e09518"
                opacity={0.12}
              />
            ) : null}
          </g>
        );
      })}

      {/* Bottom board + landing */}
      <rect
        x={BOX_X - COVER_OVERHANG}
        y={bottomY}
        width={BOX_W + COVER_OVERHANG * 2}
        height={BOTTOM_H}
        rx={2}
        fill={coverFill}
        stroke={deepStroke}
        strokeWidth={1.5}
      />
      {/* Landing lip */}
      <rect
        x={BOX_X - COVER_OVERHANG - 4}
        y={bottomY + BOTTOM_H - 4}
        width={BOX_W + COVER_OVERHANG * 2 + 8}
        height={4}
        rx={2}
        fill={muted ? "#5a4d40" : "#3a322b"}
      />

      {detailed ? (
        <>
          {/* Entrance slot */}
          <rect
            x={BOX_X + BOX_W / 2 - 18}
            y={entranceY + 2}
            width={36}
            height={5}
            rx={2.5}
            fill="#2a241f"
            opacity={0.85}
          />
          {/* A couple of bees at the entrance when the colony is active */}
          {!muted ? (
            <>
              <circle cx={BOX_X + BOX_W / 2 - 24} cy={entranceY + 4} r={2.4} fill="#f5c86b" stroke="#2a241f" strokeWidth={0.6} />
              <circle cx={BOX_X + BOX_W / 2 + 26} cy={entranceY + 5} r={2.1} fill="#f5c86b" stroke="#2a241f" strokeWidth={0.6} />
            </>
          ) : null}
        </>
      ) : null}
    </svg>
  );
}
