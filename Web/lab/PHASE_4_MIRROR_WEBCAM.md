# PHASE 4: THE MIRROR (Hardware & Reality)

## Concept
SIC explores the "Self" vs. "The Idea". The ultimate conflict is the user facing themselves.

## 1. The Mirror of Duality
*   **Permission**: Request Camera access.
*   **Canvas Processing**:
    *   Draw video feed to canvas.
    *   **Threshold Filter**: Convert pixels. If brightness > 50% -> White. Else -> Black.
    *   **Tint**: Apply Red (`#D21F3C`) multiplication to the dark areas.
    *   **Result**: A high-contrast, Sin City-style graphic version of the user.

## 2. Face Detection (Optional/Advanced)
*   If we use `face-api.js` (lightweight model):
    *   Detect eyes.
    *   Place black bars ("Censored") over the user's eyes in real-time.
    *   Floating text above head: "SUBJECT No. 4920".

## 3. The "Ghost" Delay
*   Buffer the video frames.
*   Display the current frame at 50% opacity.
*   Display the frame from 0.5s ago at 50% opacity.
*   **Effect**: A visual echo/trail, representing "The Shadow" (Phase III).

## Security Note
*   The camera feed is processed LOCALLY on the client.
*   No data is sent to any server.
*   We must add a disclaimer: "INITIATING BIO-SCAN // NO DATA LEAVES THIS TERMINAL".
