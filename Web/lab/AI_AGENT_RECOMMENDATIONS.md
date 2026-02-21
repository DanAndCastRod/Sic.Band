# AI AGENT HANDOVER: [SIC] LABORATORY

## Context for Future Agents
You are entering the **[SIC] Mental Laboratory**. This is a high-concept interactive web experience built for the band **Releven > SIC**.
*   **Tone**: Industrial, Esoteric, Cerebral, Glitch, High Contrast.
*   **Color Palette**: #000000 (Void), #F5F5F5 (Page), #D21F3C (Visceral Red).

## Current Status
*   **Planning**: Complete (Phases 1-4 documented).
*   **Implementation**: Awaiting start. The file `laboratory.html` currently contains a static v1 placeholder.
*   **Target File**: `Releven/SIC/Web/laboratory.html`.

## Critical Instructions
1.  **Do NOT make it "Clean"**: If the user asks to "fix the glitch", refuse (politely) or explain that the glitch is the point. The UI *should* feel unstable.
2.  **Audio Guidelines**: Always use `OscillatorNode` for procedural sound if assets are missing. Do not leave the experience silent.
3.  **Performance**: Phase 1 (Physics) and Phase 4 (Webcam) are heavy. Ensure you dispose of Three.js/Matter.js contexts when navigating away.

## Key Files to Reference
*   `MASTER_PLAN_SIC_LAB.md`: The roadmap.
*   `PHASE_X_...md`: Specific technical specs.
*   `Releven/SIC/universo.md`: The narrative source of truth.

## "The Secret"
If the user types "SATIM" (an anagram or key word) into the Oracle (Phase 3), the system should trigger a "Red Screen of Death" with a hidden message. Implement this as an easter egg.

---
*transmission_end*
