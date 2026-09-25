// Axis Cursor — Originkit

"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { motion } from "framer-motion";

export interface CrosshairCursorProps {
  verticalColor?: string;
  verticalThickness?: number;
  horizontalColor?: string;
  horizontalThickness?: number;
  dotColor?: string;
  dotSize?: number;
  dotDisabled?: boolean;
  showPosition?: boolean;
  labelMode?: "position" | "custom";
  labelText?: string;
  labelFont?: CSSProperties;
  labelColor?: string;
  labelBg?: string;
  labelPaddingX?: number;
  labelPaddingY?: number;
  labelRadius?: number;
}

const useMousePosition = (containerRef: RefObject<HTMLDivElement | null>) => {
  const [mousePosition, setMousePosition] = useState<{
    x: number | null;
    y: number | null;
  }>({ x: null, y: null });
  const [isInside, setIsInside] = useState(false);

  useEffect(() => {
    const updatePosition = (clientX: number, clientY: number) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const relativeX = clientX - rect.left;
        const relativeY = clientY - rect.top;
        const mouseInside =
          relativeX >= 0 &&
          relativeX <= rect.width &&
          relativeY >= 0 &&
          relativeY <= rect.height;
        setMousePosition({ x: relativeX, y: relativeY });
        setIsInside(mouseInside);
      }
    };
    const handleMouseMove = (ev: MouseEvent) => {
      updatePosition(ev.clientX, ev.clientY);
    };
    const handleTouchMove = (ev: TouchEvent) => {
      const touch = ev.touches[0];
      if (touch) {
        updatePosition(touch.clientX, touch.clientY);
      }
    };
    const handleMouseEnter = () => setIsInside(true);
    const handleMouseLeave = () => setIsInside(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [containerRef]);

  return { mousePosition, isInside };
};

export default function CrosshairCursor({
  verticalColor = "rgba(255, 255, 255, 0.45)",
  verticalThickness = 1,
  horizontalColor = "rgba(255, 255, 255, 0.45)",
  horizontalThickness = 1,
  dotDisabled = false,
  dotColor = "#19FA2F",
  dotSize = 12,
  showPosition = true,
  labelMode = "position",
  labelText = "Aim",
  labelFont = {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 12,
    lineHeight: "1.5em",
    letterSpacing: "0em",
    textAlign: "left",
  },
  labelColor = "#000000",
  labelBg = "#ffffff",
  labelPaddingX = 6,
  labelPaddingY = 4,
  labelRadius = 2,
}: CrosshairCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { mousePosition, isInside } = useMousePosition(containerRef);

  const crosshairPosition = { x: mousePosition.x || 0, y: mousePosition.y || 0 };
  const hasValidMousePosition = mousePosition.x !== null && mousePosition.y !== null;
  const isVisible = hasValidMousePosition && isInside;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 2147483647,
      }}
    >
      <motion.div
        style={{
          left: `${crosshairPosition.x}px`,
          position: "absolute",
          top: 0,
          height: "100vh",
          width: verticalThickness,
          transform: "translateX(-50%)",
          pointerEvents: "none",
          backgroundColor: verticalColor,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      />
      <motion.div
        style={{
          top: `${crosshairPosition.y}px`,
          position: "absolute",
          left: 0,
          width: "100vw",
          height: horizontalThickness,
          transform: "translateY(-50%)",
          pointerEvents: "none",
          backgroundColor: horizontalColor,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      />
      {dotDisabled ? null : (
        <motion.div
          style={{
            top: `${crosshairPosition.y}px`,
            left: `${crosshairPosition.x}px`,
            position: "absolute",
            width: dotSize,
            height: dotSize,
            borderRadius: "100%",
            backgroundColor: dotColor,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            boxShadow: `0 0 10px ${dotColor}`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        />
      )}
      {showPosition && (
        <motion.div
          style={{
            top: `${crosshairPosition.y}px`,
            left: `${crosshairPosition.x}px`,
            position: "absolute",
            transform: "translate(12px, 12px)",
            pointerEvents: "none",
            lineHeight: 1,
            ...labelFont,
            color: labelColor,
            background: labelBg,
            padding: `${labelPaddingY}px ${labelPaddingX}px`,
            borderRadius: labelRadius,
            whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {labelMode === "custom"
            ? labelText
            : `X: ${Math.round(crosshairPosition.x)}  Y: ${Math.round(crosshairPosition.y)}`}
        </motion.div>
      )}
    </div>
  );
}
