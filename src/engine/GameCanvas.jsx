import React, { useRef, useEffect } from "react";
import { Application } from "pixi.js";

export default function GameCanvas({ onAppReady, width = 960, height = 640 }) {
  const canvasRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    const app = new Application();
    const init = async () => {
      await app.init({
        width,
        height,
        backgroundColor: 0x050510,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });
      canvasRef.current.appendChild(app.canvas);
      appRef.current = app;
      if (onAppReady) onAppReady(app);
    };
    init();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={canvasRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
      }}
    />
  );
}
