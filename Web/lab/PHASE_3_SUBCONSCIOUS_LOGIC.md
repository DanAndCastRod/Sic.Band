# PHASE 3: THE SUBCONSCIOUS (Logic & Interaction)

## Concept
The machine is alive and it knows you are there. This phase handles text inputs and "subliminal" outputs.

## 1. The Oracle (Chatbot v0.1)
*   **Interface**: A terminal prompt: `USER@SIC_LAB:~$ _`
*   **Input**: User types free text.
*   **Logic**:
    *   The system analyzes for keywords: "Love", "Pain", "Future", "Band", "Die".
    *   Responses are pulled from `universo.md` and `identidad.md`.
    *   **Obfuscation**: The response is never clear. It interpolates "[REDACTED]" or "[SIC]" randomly.
    *   *Fallout*: If no keyword matches, it returns a philosophical axiom: "THE SENTENCE IS INCOMPLETE."

## 2. The Truth Filter (Text Processor)
*   A dedicated text-area. "Type your truth here."
*   **Process**:
    *   Convert to Uppercase.
    *   Replace positive words ("Happy", "Good", "Light") with ambiguous ones ("NUMB", "EFFICIENT", "BLINDING").
    *   Insert `[SIC]` at the end of every sentence.
    *   Add Zalgo text (glitch characters) to random letters.

## 3. Subliminal Injection
*   **Mechanism**: A `setInterval` running every 4000-9000ms.
*   **Action**: 
    1. Create a Fullscreen `div` (`z-index: 9999`).
    2. Background: Red (`#D21F3C`) or Inverted text.
    3. Content: A symbol or word ("WAKE UP").
    4. Duration: 50ms (3 frames).
    5. Remove `div`.
*   **Purpose**: Create a sense of psychological unease consistent with the "Conflict" theme.

## Vocabulary Database
*   Use terms: "Void", "Architect", "Engine", "Foundation", "Ambiguity", "Duality", "Visceral", "Static".
