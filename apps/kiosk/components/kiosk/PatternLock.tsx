"use client";

import React, { useState, useRef } from "react";

interface PatternLockProps {
  onComplete: (pattern: number[]) => void;
  size?: number;
}

export function PatternLock({ onComplete, size = 300 }: PatternLockProps) {
  const [path, setPath] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const points = [
    { id: 0, x: 50, y: 50 },
    { id: 1, x: 150, y: 50 },
    { id: 2, x: 250, y: 50 },
    { id: 3, x: 50, y: 150 },
    { id: 4, x: 150, y: 150 },
    { id: 5, x: 250, y: 150 },
    { id: 6, x: 50, y: 250 },
    { id: 7, x: 150, y: 250 },
    { id: 8, x: 250, y: 250 },
  ];

  const getCoordinates = (e: React.PointerEvent) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 300 / rect.width;
    const scaleY = 300 / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as Element).releasePointerCapture(e.pointerId);
    setIsDrawing(true);
    const coords = getCoordinates(e);
    setCurrentPos(coords);
    
    // Start fresh unless appending
    setPath([]);
    
    // Check if clicked directly on a point
    if (coords) {
      points.forEach((point) => {
        const dist = Math.hypot(point.x - coords.x, point.y - coords.y);
        if (dist < 40) {
          setPath([point.id]);
        }
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    if (!coords) return;
    setCurrentPos(coords);

    points.forEach((point) => {
      const dist = Math.hypot(point.x - coords.x, point.y - coords.y);
      if (dist < 40) {
        setPath((prev) => {
          if (!prev.includes(point.id)) {
            return [...prev, point.id];
          }
          return prev;
        });
      }
    });
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    setCurrentPos(null);
    onComplete(path);
  };

  const reset = () => {
    setPath([]);
    onComplete([]);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox="0 0 300 300"
        className="touch-none select-none rounded-xl bg-[var(--color-surface)] border border-white/10 cursor-crosshair shadow-inner"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {path.length > 0 && (
          <path
            d={
              path.map((id, index) => {
                const point = points[id];
                if (!point) return "";
                return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
              }).join(" ") +
              (isDrawing && currentPos ? ` L ${currentPos.x} ${currentPos.y}` : "")
            }
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          />
        )}

        {points.map((point) => {
          const pathIndex = path.indexOf(point.id);
          const isSelected = pathIndex !== -1;
          
          return (
            <g key={point.id}>
              <circle
                cx={point.x}
                cy={point.y}
                r={isSelected ? 16 : 8}
                fill={isSelected ? "var(--color-primary)" : "rgba(255,255,255,0.2)"}
                className="transition-all duration-200"
              />
              {isSelected && (
                <text
                  x={point.x}
                  y={point.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="black"
                  fontSize="16"
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
      <div className="flex justify-between w-full px-2">
        <span className="text-sm text-white/40">{path.length} Punkte verbunden</span>
        <button 
          onClick={reset}
          type="button"
          className="text-sm text-[var(--color-primary)] hover:text-yellow-400 transition-colors"
        >
          Zurücksetzen
        </button>
      </div>
    </div>
  );
}
