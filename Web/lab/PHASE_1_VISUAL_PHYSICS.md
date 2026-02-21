# PHASE 1: THE CONTAINER (Visuals & Physics)

## Concept
The "Laboratory" is not a webpage; it is a simulation of a mental space. It needs depth, physics, and texture.

## 1. The Idea Collider (Matter.js)
We will implement a **2D Physics Engine** where words fall from the sky and pile up at the bottom.
*   **Objects**: Blocks containing words like "VOID", "TRUTH", "AMBIGUITY", "SATIM".
*   **Interaction**: The user's mouse is a "repulsor". Moving the mouse through the pile scatters the words violently.
*   **Visuals**: White wireframe boxes, black fills, red text on collision.

## 2. Global Atmosphere (Shaders/CSS)
*   **CRT Scanlines**: A fixed overlay `pointer-events: none` with a repeating linear gradient to simulate an old monitor.
*   **Vignette**: Darkened corners to focus attention on the center.
*   **Liquid Cursor**: A WebGL fragment shader that distorts the background image (`universe-map.png`) wherever the mouse hover. It's like dragging your finger through water or static.

## 3. The "Glitch" Loop
*   Randomly, the entire container should shift 2-3 pixels to the left/right (`transform: translate`) for 50ms to simulate signal instability.
*   **RGB Split**: Text shadows should occasionally separate into Red and Cyan channels.

## Technical Stack
*   `Matter.js` (Physics)
*   `Three.js` (optional for fluid distortion, or stick to heavy CSS filters for performance).
*   `CSS Custom Properties` for theme management.

## Implementation Steps
1.  Setup `laboratory.html` with a full-screen `<canvas id="world">`.
2.  Initialize Matter.js engine.
3.  Create the word generation loop (spawn a new word every 2 seconds).
4.  Implement the Mouse Constraint/Repulsor.
