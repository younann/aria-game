import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { createStarField, createDataStream } from "./ParticleEffects.js";

// Positions as proportions of a 960x700 reference canvas
const ROOMS = [
  { id: "bridge",        label: "BRIDGE",          px: 0.500, py: 0.114, color: 0x3b82f6, pw: 0.167, ph: 0.100 },
  { id: "datavault",     label: "DATA VAULT",      px: 0.167, py: 0.343, color: 0x10b981, pw: 0.156, ph: 0.100 },
  { id: "opticslab",     label: "OPTICS LAB",      px: 0.500, py: 0.343, color: 0x06b6d4, pw: 0.156, ph: 0.100 },
  { id: "commsarray",    label: "COMMS ARRAY",     px: 0.833, py: 0.343, color: 0xec4899, pw: 0.156, ph: 0.100 },
  { id: "neuralcore",    label: "NEURAL CORE",     px: 0.313, py: 0.571, color: 0x8b5cf6, pw: 0.156, ph: 0.100 },
  { id: "simdeck",       label: "SIM DECK",        px: 0.688, py: 0.571, color: 0xf97316, pw: 0.156, ph: 0.100 },
  { id: "ethicschamber", label: "ETHICS CHAMBER",  px: 0.500, py: 0.743, color: 0xf43f5e, pw: 0.167, ph: 0.100 },
  { id: "command",       label: "COMMAND CENTER",   px: 0.500, py: 0.914, color: 0xfbbf24, pw: 0.167, ph: 0.100 },
];

const CORRIDORS = [
  { from: "bridge", to: "datavault" },
  { from: "bridge", to: "opticslab" },
  { from: "bridge", to: "commsarray" },
  { from: "datavault", to: "neuralcore" },
  { from: "opticslab", to: "neuralcore" },
  { from: "opticslab", to: "simdeck" },
  { from: "commsarray", to: "simdeck" },
  { from: "neuralcore", to: "ethicschamber" },
  { from: "simdeck", to: "ethicschamber" },
  { from: "ethicschamber", to: "command" },
];

export function buildStationHub(app, unlockedRooms, onRoomClick, starsData = {}) {
  const hub = new Container();
  const W = app.screen.width;
  const H = app.screen.height;
  const scale = W / 960;

  hub.addChild(createStarField(app));

  const title = new Text({ text: "ISS PROMETHEUS", style: new TextStyle({
    fontFamily: "monospace", fontSize: Math.round(16 * scale), fontWeight: "bold",
    fill: 0x94a3b8, letterSpacing: Math.round(4 * scale),
  })});
  title.anchor.set(0.5);
  title.x = W / 2;
  title.y = 30 * scale;
  hub.addChild(title);

  const roomMap = {};
  for (const r of ROOMS) {
    const rx = r.px * W;
    const ry = r.py * H;
    const rw = Math.max(r.pw * W, 60);
    const rh = Math.max(r.ph * H, 48);
    roomMap[r.id] = { ...r, x: rx, y: ry, w: rw, h: rh };
  }

  const labelStyle = new TextStyle({
    fontFamily: "monospace",
    fontSize: Math.round(11 * scale),
    fontWeight: "bold",
    fill: 0xffffff,
    letterSpacing: Math.round(2 * scale),
    align: "center",
  });

  for (const c of CORRIDORS) {
    const from = roomMap[c.from];
    const to = roomMap[c.to];
    const line = new Graphics();
    line.moveTo(from.x, from.y);
    line.lineTo(to.x, to.y);
    line.stroke({ width: 2, color: 0x1e293b, alpha: 0.6 });
    hub.addChild(line);
  }

  for (const id of Object.keys(roomMap)) {
    const room = roomMap[id];
    const isUnlocked = unlockedRooms.includes(room.id);
    const container = new Container();
    container.x = room.x;
    container.y = room.y;

    const bg = new Graphics();
    bg.roundRect(-room.w / 2, -room.h / 2, room.w, room.h, 12 * scale);
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
    label.y = -4 * scale;
    container.addChild(label);

    if (isUnlocked && room.id !== "bridge" && starsData[room.id]) {
      const missionStars = starsData[room.id];
      const earned = Object.values(missionStars).reduce((a, b) => a + b, 0);
      const max = Object.keys(missionStars).length > 0 ? Object.keys(missionStars).length * 3 : 9;
      const starText = new Text({ text: `★ ${earned}/${max}`, style: new TextStyle({
        fontFamily: "monospace", fontSize: Math.round(10 * scale), fill: 0xfbbf24, letterSpacing: 1,
      })});
      starText.anchor.set(0.5);
      starText.y = 14 * scale;
      container.addChild(starText);
    }

    if (!isUnlocked) {
      const lock = new Text({ text: "\uD83D\uDD12", style: new TextStyle({ fontSize: Math.round(18 * scale) }) });
      lock.anchor.set(0.5);
      lock.y = -room.h / 2 - 16 * scale;
      container.addChild(lock);
    }

    if (isUnlocked) {
      container.eventMode = "static";
      container.cursor = "pointer";
      container.on("pointerover", () => {
        bg.clear();
        bg.roundRect(-room.w / 2, -room.h / 2, room.w, room.h, 12 * scale);
        bg.fill({ color: room.color, alpha: 0.3 });
        bg.stroke({ width: 3, color: room.color, alpha: 1 });
      });
      container.on("pointerout", () => {
        bg.clear();
        bg.roundRect(-room.w / 2, -room.h / 2, room.w, room.h, 12 * scale);
        bg.fill({ color: room.color, alpha: 0.15 });
        bg.stroke({ width: 2, color: room.color, alpha: 0.8 });
      });
      container.on("pointertap", () => onRoomClick(room.id));
    }

    hub.addChild(container);

    if (isUnlocked) {
      hub.addChild(createDataStream(app, room.x - room.w / 2 - 10, room.y - 40 * scale, room.y + 40 * scale, room.color));
    }
  }

  return hub;
}
