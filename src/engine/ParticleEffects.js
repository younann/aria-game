import { Graphics, Container } from "pixi.js";

export function createStarField(app) {
  const container = new Container();
  const stars = [];

  for (let i = 0; i < 80; i++) {
    const star = new Graphics();
    const size = Math.random() * 2 + 0.5;
    star.circle(0, 0, size);
    star.fill({ color: 0xffffff, alpha: Math.random() * 0.6 + 0.2 });
    star.x = Math.random() * app.screen.width;
    star.y = Math.random() * app.screen.height;
    container.addChild(star);
    stars.push({ graphic: star, speed: Math.random() * 0.3 + 0.1, baseAlpha: star.alpha });
  }

  app.ticker.add((ticker) => {
    for (const s of stars) {
      s.graphic.alpha = s.baseAlpha + Math.sin(Date.now() * 0.002 * s.speed) * 0.3;
    }
  });

  return container;
}

export function createDataStream(app, x, y1, y2, color = 0x8b5cf6) {
  const container = new Container();
  const particles = [];

  for (let i = 0; i < 12; i++) {
    const p = new Graphics();
    p.rect(0, 0, 2, Math.random() * 8 + 4);
    p.fill({ color, alpha: 0.4 });
    p.x = x + (Math.random() - 0.5) * 6;
    p.y = y1 + Math.random() * (y2 - y1);
    container.addChild(p);
    particles.push({ graphic: p, speed: Math.random() * 1.5 + 0.5, y1, y2 });
  }

  app.ticker.add(() => {
    for (const p of particles) {
      p.graphic.y -= p.speed;
      if (p.graphic.y < p.y1) p.graphic.y = p.y2;
    }
  });

  return container;
}
