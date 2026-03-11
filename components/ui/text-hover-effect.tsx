"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";

export const TextHoverEffect = ({
  text,
  duration = 0.3,
  fontSize = "text-7xl",
  className = "",
}: {
  text: string;
  duration?: number;
  fontSize?: string;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    }
  }, []);

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      });
    }
  }, [cursor]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient
            id="textGradient"
            gradientUnits="userSpaceOnUse"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            {hovered && (
              <>
                <stop offset="0%" stopColor="#eab308" />
                <stop offset="25%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="75%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </>
            )}
          </linearGradient>

          <motion.radialGradient
            id="revealMask"
            gradientUnits="userSpaceOnUse"
            r="15%"
            initial={{ cx: "50%", cy: "50%" }}
            animate={maskPosition}
            transition={{ duration, ease: "easeOut" }}
          >
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </motion.radialGradient>

          <mask id="textMask">
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#revealMask)"
            />
          </mask>
        </defs>

        {/* Background text (subtle outline) */}
        <text
          x="0%"
          y="50%"
          textAnchor="start"
          dominantBaseline="middle"
          strokeWidth="1"
          className={`fill-transparent stroke-primary/30 font-bold ${fontSize} dark:stroke-neutral-800`}
          style={{ opacity: hovered ? 0.3 : 0 }}
        >
          {text}
        </text>

        {/* Animated outline text */}
        <motion.text
          x="0%"
          y="50%"
          textAnchor="start"
          dominantBaseline="middle"
          strokeWidth="1"
          className={`fill-transparent stroke-primary/30 font-bold ${fontSize} dark:stroke-neutral-800`}
          initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
          animate={{
            strokeDashoffset: 0,
            strokeDasharray: 1000,
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
          }}
        >
          {text}
        </motion.text>

        {/* Gradient text with mask */}
        <text
          x="0%"
          y="50%"
          textAnchor="start"
          dominantBaseline="middle"
          stroke="url(#textGradient)"
          strokeWidth="1"
          mask="url(#textMask)"
          className={`fill-transparent font-bold ${fontSize}`}
        >
          {text}
        </text>
      </svg>
    </div>
  );
};
