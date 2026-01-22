
# REVISED DESIGN: "Operation: Rewrite History v2"

**Core Shift:**
- **The Player's Role:** You are the **Resistance** (Students/Youth).
- **The Enemy:** **ICE Agents** (`👮‍♂️`) who are actively throwing books (`📚`) onto the fire (`🔥`).
- **The Objective:** **Extinguish the Fire** and **Stop the ICE Agents**.

## Mechanics
1.  **The Fire (Enemy Goal):**
    -   Starts burning from the books.
    -   Intensity increases as ICE agents successfully toss more books on it.
    -   *Lose Condition:* Fire Intensity reaches 100% (Total Indoctrination).

2.  **The Player (Resistance):**
    -   You control **Students** who can perform two actions:
        1.  **Block Agents:** Click/Tap on ICE Agents (`👮‍♂️`) to stop them from throwing books.
        2.  **Extinguish Fire:** Click/Tap on the Fire (`🔥`) to throw water buckets (`🪣`) on it.

3.  **The Loop:**
    -   **ICE Agents spawn** at the perimeter and move toward the fire.
    -   **If Agent reaches fire:** Creates a `📚` projectile + Fire Intensity `+10%`.
    -   **Player Interaction:**
        -   Click Agent -> Agent is blocked/leaves (`🚫`).
        -   Click Fire -> Fire Intensity `-5%` (Spray water).

4.  **Math Equation (The "Win" Logic):**
    -   To win a round, you must lower the Fire Intensity to 0%.
    -   To do that, your rate of *Extinguishing* (Clicks on Fire) + *Blocking* (Stops Intensification) must be > Rate of *ICE Spawning*.
    -   *Win Condition:* Fire Intensity reaches 0%.

## Visuals
-   **Center:** The Bonfire.
-   **Enemies:** ICE Agents (`👮‍♂️`) marching in.
-   **Player Cursor/Touch:** Represents the "Youth Resistance".
-   **Projectiles:** Books flying in, Water splashing out.

## Implementation Plan
-   Update `SuppressHistorians.tsx` (we can rename it later or keep the file name).
-   Swap roles: `Enemies` are now ICE Agents.
-   Swap Click Logic:
    -   Clicking Enemy = "Blocking" (Good).
    -   Clicking Center Fire = "Extinguishing" (Good).
-   Update HUD:
    -   "Indoctrination Level" (Fire Intensity) - Starts at 50%.
    -   Goal: Get it to 0%. Avoid 100%.

**Shall I proceed with this "Heroic Resistance" redesign?**
