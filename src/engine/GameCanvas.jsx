import React, { useRef, useEffect } from "react";
import { Application } from "pixi.js";

export default function GameCanvas({ onAppReady, width = 960, height = 700 }) {
  const canvasRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    let mounted = true;
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
      if (!mounted || !canvasRef.current) {
        app.destroy(true);
        return;
      }
      canvasRef.current.appendChild(app.canvas);
      appRef.current = app;
      if (onAppReady) onAppReady(app);
    };
    init();

    return () => {
      mounted = false;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, [width, height]);

  return (
    <div
      ref={canvasRef}
      style={{
        width: "100%",
        maxWidth: `${width}px`,
        aspectRatio: `${width} / ${height}`,
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        margin: "0 auto",
      }}
    />
  );
}
