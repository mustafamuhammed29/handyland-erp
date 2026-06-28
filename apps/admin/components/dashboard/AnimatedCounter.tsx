"use client";

import React, { useEffect, useState } from "react";
import { animate } from "framer-motion";

export function AnimatedCounter({ value, isCurrency = false }: { value: string | number, isCurrency?: boolean }) {
  const [displayValue, setDisplayValue] = useState(isCurrency ? "€0.00" : "0");
  const targetValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value;

  useEffect(() => {
    const controls = animate(0, targetValue, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(val) {
        if (isCurrency) {
          setDisplayValue(`€${val.toFixed(2)}`);
        } else {
          setDisplayValue(Math.floor(val).toString());
        }
      },
    });

    return () => controls.stop();
  }, [targetValue, isCurrency]);

  return <span>{displayValue}</span>;
}
