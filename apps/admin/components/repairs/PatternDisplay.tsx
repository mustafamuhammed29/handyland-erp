import React from "react";

export function PatternDisplay({ pattern }: { pattern: string }) {
  if (!pattern) return null;
  const path = pattern.split(",").map(Number);
  if (path.length === 0) return null;

  const size = 60; // Small size for dashboard display
  const points = [
    { id: 0, x: 10, y: 10 },
    { id: 1, x: 30, y: 10 },
    { id: 2, x: 50, y: 10 },
    { id: 3, x: 10, y: 30 },
    { id: 4, x: 30, y: 30 },
    { id: 5, x: 50, y: 30 },
    { id: 6, x: 10, y: 50 },
    { id: 7, x: 30, y: 50 },
    { id: 8, x: 50, y: 50 },
  ];

  return (
    <div className="inline-flex flex-col gap-1 items-start">
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 60 60" 
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
          const isSelected = path.includes(point.id);
          return (
            <circle
              key={point.id}
              cx={point.x}
              cy={point.y}
              r={isSelected ? 3 : 2}
              fill={isSelected ? "var(--color-primary, #eab308)" : "rgba(150,150,150,0.5)"}
            />
          );
        })}
      </svg>
      <span className="text-[10px] text-muted-foreground">Muster (Pattern)</span>
    </div>
  );
}
