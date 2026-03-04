# Mobile-First Responsive Redesign

## Decisions
- **Primary target:** Phone-first (320–430px)
- **Breakpoint:** Single at 768px (mobile < 768, tablet+ >= 768)
- **Station hub:** Vertical card list on mobile, PixiJS map on tablet+
- **Missions:** Fluid width, stacked single-column on mobile
- **Overlays:** Full-screen modals on mobile, current style on tablet+
- **HUD:** Compact single row with hamburger menu on mobile

---

## Implementation Tasks

### Task 1: useViewport hook + CSS foundations
- Create `src/hooks/useViewport.js` — returns `{ width, height, isMobile }`
- Uses `window.innerWidth` with resize listener (debounced)
- `isMobile = width < 768`
- Update `src/index.css`: add `*, *::before, *::after { box-sizing: border-box }`, ensure `html { overflow-x: hidden }`
- Update `index.html` viewport meta: add `viewport-fit=cover, maximum-scale=1` to prevent zoom on input focus

### Task 2: GameCanvas responsive sizing
- `GameCanvas.jsx` accepts dynamic `width`/`height` props
- Canvas wrapper: `width: 100%, max-width: 960px`
- On tablet+, parent passes `Math.min(containerWidth, 960)` as width
- Height scales proportionally (ratio 700/960 ≈ 0.729)

### Task 3: StationHubMobile component
- New file: `src/engine/StationHubMobile.jsx`
- Vertical scrollable card list, one card per room
- Each card: room icon + name + subtitle + star display (earned/total) + lock state
- Cards use room theme color as left border accent
- Card order: narrative progression (bridge → datavault → ... → command)
- Tapping a card calls `onRoomClick(roomId)`
- Locked rooms: dimmed with lock icon overlay, not tappable
- Reads same `starsData` and unlock state as PixiJS hub

### Task 4: StationHub.js relative positioning
- Convert all room positions from absolute pixels to proportions of canvas size
- Example: bridge `(480, 80)` on 960-wide → `(0.5, 0.114)` of canvas
- Room hit areas: minimum 60x48px
- Corridors recalculated from proportional room positions
- Text sizes scale with canvas width (base at 960px)

### Task 5: App.jsx responsive orchestration
- Import `useViewport` hook
- Remove hardcoded `padding: 24px` → mobile: `padding: 0`, tablet+: `padding: 16px`
- Station hub phase: render `StationHubMobile` when `isMobile`, else `GameCanvas + StationHub`
- Pass dynamic canvas dimensions on tablet+
- Bridge intro: on mobile, use smaller canvas or HTML-based intro

### Task 6: HUD mobile layout
- `HUD.jsx`: use `isMobile` to switch layouts
- Mobile: compact row — ARIA icon | XP bar | hamburger menu
- Hamburger opens dropdown: player name, rank, codex button
- Fixed top, height 48px, full width
- All tap targets >= 44px

### Task 7: Full-screen overlays on mobile
- `MissionBriefing.jsx`: mobile → `position: fixed, inset: 0` with slide-up animation
- `LevelSelect.jsx`: same full-screen treatment
- `RankCeremony.jsx`: same
- `CodexCardReveal.jsx`: same
- `Codex.jsx` (panel): mobile → full-screen overlay instead of side drawer
- Close/back button top-left, 44px target
- Content scrollable within modal
- Tablet+: no changes

### Task 8: DialogueBox mobile
- `DialogueBox.jsx`: mobile → full width, pinned bottom, max-height 40vh
- "Continue" button becomes full-width bar at bottom
- Larger text and padding for readability
- Tablet+: no changes

### Task 9: Mission components fluid layouts
- **PatternScanner.jsx**: cell size = `Math.floor((containerWidth - 32) / gridSize)`, capped at 56px
- **AgentNavigator.jsx**: same fluid cell sizing; control buttons 48px min, below grid
- **SignalClassifier.jsx**: SVG `width="480"` → `viewBox="0 0 480 100"` + `width="100%"`; classification buttons stack vertically on mobile
- **SynapticWiring.jsx**: guide panel moves above wiring area on mobile; full-width nodes area
- **MessageDecoder.jsx**: enforce `max-width: 100%`; larger input font/padding on mobile
- **BiasDetector.jsx**: ensure min card height 44px for tap targets

### Task 10: Bridge intro mobile
- Current PixiJS bridge animation on a 960x700 canvas won't work on mobile
- Mobile: render bridge intro as HTML/CSS with Framer Motion animations
- Show ARIA character, intro text, "Begin" button — all full-screen
- Tablet+: keep current PixiJS bridge

### Task 11: Testing & polish
- Test on Chrome DevTools device emulator: iPhone SE (375px), iPhone 14 (390px), iPad (768px), iPad Pro (1024px)
- Verify all tap targets >= 44px
- Verify no horizontal overflow on any screen
- Test orientation: portrait primary, landscape acceptable
- Smooth transitions between mobile/tablet if resizing
