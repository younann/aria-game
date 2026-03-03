import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { createStarField, createDataStream } from "./ParticleEffects.js";

const ROOMS = [
  { id: "bridge", label: "BRIDGE", x: 480, y: 100, color: 0x3b82f6, w: 160, h: 80 },
  { id: "datavault", label: "DATA VAULT", x: 200, y: 280, color: 0x10b981, w: 160, h: 80 },
  { id: "neuralcore", label: "NEURAL CORE", x: 480, y: 280, color: 0x8b5cf6, w: 160, h: 80 },
  { id: "simdeck", label: "SIM DECK", x: 760, y: 280, color: 0xf97316, w: 160, h: 80 },
  { id: "command", label: "COMMAND", x: 480, y: 460, color: 0xfbbf24, w: 160, h: 80 },
];

const CORRIDORS = [
  { from: "bridge", to: "datavault" },
  { from: "bridge", to: "neuralcore" },
  { from: "bridge", to: "simdeck" },
  { from: "datavault", to: "command" },
  { from: "neuralcore", to: "command" },
  { from: "simdeck", to: "command" },
];

const labelStyle = new TextStyle({
  fontFamily: "monospace",
  fontSize: 11,
  fontWeight: "bold",
  fill: 0xffffff,
  letterSpacing: 2,
  align: "center",
});

export function buildStationHub(app, unlockedRooms, onRoomClick) {
  const hub = new Container();

  hub.addChild(createStarField(app));

  const title = new Text({ text: "ISS PROMETHEUS", style: new TextStyle({
    fontFamily: "monospace", fontSize: 16, fontWeight: "bold",
    fill: 0x94a3b8, letterSpacing: 4,
  })});
  title.anchor.set(0.5);
  title.x = app.screen.width / 2;
  title.y = 40;
  hub.addChild(title);

  const roomMap = {};
  for (const r of ROOMS) roomMap[r.id] = r;

  for (const c of CORRIDORS) {
    const from = roomMap[c.from];
    const to = roomMap[c.to];
    const line = new Graphics();
    line.moveTo(from.x, from.y);
    line.lineTo(to.x, to.y);
    line.stroke({ width: 2, color: 0x1e293b, alpha: 0.6 });
    hub.addChild(line);
  }

  for (const room of ROOMS) {
    const isUnlocked = unlockedRooms.includes(room.id);
    const container = new Container();
    container.x = room.x;
    container.y = room.y;

    const bg = new Graphics();
    bg.roundRect(-room.w / 2, -room.h / 2, room.w, room.h, 12);
    if (isUnlocked) {
      bg.fill({ color: room.color, alpha: 0.15 });
      bg.stroke({ width: 2, color: room.color, alpha: 0.8 });
    } else {
      bg.fill({ color: 0x0f172a, alpha: 0.5 });
      bg.stroke({ width: 1, color: 0x334155, alpha: 0.4 });
    }
    container.addChild(bg);

    const label = new Text({ text: room.label, style: new TextStyle({
      ...labelStyle, fill: isUnlocked ? 0xffffff : 0x475569,
    })});
    label.anchor.set(0.5);
    container.addChild(label);

    if (!isUnlocked) {
      const lock = new Text({ text: "🔒", style: new TextStyle({ fontSize: 18 }) });
      lock.anchor.set(0.5);
      lock.y = -room.h / 2 - 16;
      container.addChild(lock);
    }

    if (isUnlocked) {
      container.eventMode = "static";
      container.cursor = "pointer";
      container.on("pointerover", () => {
        bg.clear();
        bg.roundRect(-room.w / 2, -room.h / 2, room.w, room.h, 12);
        bg.fill({ color: room.color, alpha: 0.3 });
        bg.stroke({ width: 3, color: room.color, alpha: 1 });
      });
      container.on("pointerout", () => {
        bg.clear();
        bg.roundRect(-room.w / 2, -room.h / 2, room.w, room.h, 12);
        bg.fill({ color: room.color, alpha: 0.15 });
        bg.stroke({ width: 2, color: room.color, alpha: 0.8 });
      });
      container.on("pointertap", () => onRoomClick(room.id));
    }

    hub.addChild(container);

    if (isUnlocked) {
      hub.addChild(createDataStream(app, room.x - room.w / 2 - 10, room.y - 40, room.y + 40, room.color));
    }
  }

  return hub;
}
