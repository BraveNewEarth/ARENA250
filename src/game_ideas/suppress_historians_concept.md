
# PROPOSAL: "Operation: Rewrite History" (Mini-Game)

**Objective:** Maintain the "Bonfire of Truth" for as long as possible. The longer it burns, the higher your "Civilic Decay" score.

**Scenario:**
- **Center Stage:** A massive, roaring bonfire of history books (`📚` + `🔥`).
- **The Allies (ICE Agents `👮‍♂️`):** Automatically toss books onto the fire to fuel it.
- **The Enemies (Historians `👩‍🏫`):** Spawn from the edges of the screen carrying buckets of water (`🪣`). They run towards the fire.
- **Defeat:** If too many Historians reach the fire, it is extinguished by the "tears of liberalism" (water).
- **Victory:** Survive the timer or reach a high "Ignorance Score".

## Mechanics
1.  **Fueling:** The fire has an HP bar (Intensity). It decays over time naturally.
2.  **Feeding:** ICE Agents spawn at the top and toss books. (Visual flavor).
3.  **Dousing:** If a Historian touches the fire, Intensity drops significanty (`-15%`).
4.  **Player Action:**
    -   **"Suppress" (Tap/Click):** Player clicks on incoming Historians to "Cancel" them. 
    -   **Effect:** They turn into ghost emojis (`👻`) or run away.
    -   **Sound:** "Wrong!", "Fake News!", or Siren sounds.

## Visual Styling
-   **Dark Mode:** Night scene.
-   **Lighting:** The fire casts a dynamic glow (CSS `box-shadow` or radial gradient) that pulses.
-   **Particles:** Embers floating up.

## Interaction "Magic"
We will use Framer Motion for the entities to give them smooth, game-like movement without needing a heavy game engine.

---
**Does this concept align with your vision?** 
If yes, I will proceed to build `components/SuppressHistorians.tsx` immediately.
