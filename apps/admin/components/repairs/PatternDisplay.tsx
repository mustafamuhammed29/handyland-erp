import React from "react";

export function PatternDisplay({ pattern }: { pattern: string }) {
  if (!pattern) return null;
  const path = pattern.split(",").map(Number);
  if (path.length === 0) return null;

  const size = 90; // Slightly larger to fit numbers
  const points = [
    { id: 0, x: 15, y: 15 },
    { id: 1, x: 45, y: 15 },
    { id: 2, x: 75, y: 15 },
    { id: 3, x: 15, y: 45 },
    { id: 4, x: 45, y: 45 },
    { id: 5, x: 75, y: 45 },
    { id: 6, x: 15, y: 75 },
    { id: 7, x: 45, y: 75 },
    { id: 8, x: 75, y: 75 },
  ];

  return (
    <div className="inline-flex flex-col gap-1 items-start">
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 90 90" 
        className="bg-muted rounded border"
      >
        {/* Draw path lines */}
        <path
          d={
            path.map((id, index) => {
              const point = points[id];
              if (!point) return "";
              return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
            }).join(" ")
          }
          fill="none"
          stroke="var(--color-primary, #eab308)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Draw points */}
        {points.map((point) => {
          const pathIndex = path.indexOf(point.id);
          const isSelected = pathIndex !== -1;
          return (
            <g key={point.id}>
              <circle
                cx={point.x}
                cy={point.y}
                r={isSelected ? 7 : 3}
                fill={isSelected ? "var(--color-primary, #eab308)" : "rgba(150,150,150,0.5)"}
              />
              {isSelected && (
                <text
                  x={point.x}
                  y={point.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="black"
                  fontSize="9"
                  fontWeight="bold"
                  className="pointer-events-none select-none font-sans"
                >
                  {pathIndex + 1}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <span className="text-[10px] text-muted-foreground">Muster (Pattern)</span>
    </div>
  );
}
