
# BRAINSTORM: "The Battle for History" (Dual-Side Mechanics)

**Core Concept:** The mini-game is now a **Choice-Driven Battle**. The player chooses their faction before the game starts. The mechanics mirror each other but with opposing goals.

## Phase 1: Side Selection
- **The Promoter (Macho/Chaos):** "Burn the Past!"
- **The Statesman (Order/Truth):** "Save the Knowledge!"

---

## Scenario A: Playing as THE PROMOTER (Burn It All)
* **Goal:** Maximum Fire Intensity (100%).
* **Visuals:** You control ICE Agents (`👮‍♂️`).
* **The Enemy:** Historians (`👩‍🏫`) rushing to put out the fire with water (`🪣`).
* **Mechanics:**
    1.  **Defense:** Tap Historians to "Deport/Block" them before they reach the fire.
    2.  **Offense:** Tap the Fire to "Pour Gasoline" (`⛽`) and throw more books (`📚`).
*   **Win Condition:** Fire reaches 100% Intensity.

---

## Scenario B: Playing as THE STATESMAN (Save History)
* **Goal:** Extinguish the Fire (0% Intensity).
* **Visuals:** You control the Resistance/Students/Historians.
* **The Enemy:** ICE Agents (`👮‍♂️`) marching to throw books (`📚`).
*   **Mechanics:**
    1.  **Defense:** Tap ICE Agents to "Block/Convert" them.
    2.  **Offense:** Tap the Fire to "Throw Water" (`🪣`).
*   **Win Condition:** Fire reaches 0% Intensity.

---

## The "Algorithm" (Game Loop Logic)
The game is a tug-of-war based on a `FireIntensity` float value (0.0 to 100.0).

`d(Intensity)/dt = (IncomingFuel - IncomingWater) * DifficultyMultiplier`

-   **Fuel Sources:**
    -   ICE Agent reaches center: +10%
    -   Player Clicks Center (Promoter Mode): +2%
-   **Water Sources:**
    -   Historian reaches center: -10%
    -   Player Clicks Center (Statesman Mode): -2%

## UI Implementation Strategy
1.  **Selection Screen:** A modal overlay inside the component asking "CHOOSE YOUR SIDE".
2.  **Dynamic Rendering:** The `spawnEnemy` function checks the `playerSide`:
    -   If `Promoter`: Spawns Historians (Targets).
    -   If `Statesman`: Spawns ICE Agents (Targets).
3.  **Click Logic:**
    -   If `Promoter`: Click Fire -> Increase Intensity.
    -   If `Statesman`: Click Fire -> Decrease Intensity.

## Why this works
-   It solves the "Who is the bad guy?" confusion by letting the player decide.
-   It reuses the same code engine (spawning entities, clicking entities, clicking center) for both experiences, just flipping the math signs (`+` vs `-`).
-   It perfectly fits the satire of the game (polarized realities).

**Action Plan:**
Refactor `SuppressHistorians.tsx` to include:
1.  `SideSelection` state (`null` | `'PROMOTER'` | `'STATESMAN'`).
2.  Conditional rendering for enemies based on side.
3.  Conditional win/loss logic.
