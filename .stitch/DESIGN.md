# Design System Strategy: Construction Transparency Dashboard

## 1. Overview & Creative North Star
**Creative North Star: "The Architectural Ledger"**

Construction is a world of physical layers, structural integrity, and immense scale. This design system moves away from the "standard SaaS dashboard" to create an editorial-grade financial environment. We are not just showing rows of data; we are building a digital representation of a physical project’s health.

The "Architectural Ledger" approach relies on **Structural Breathability** and **Tonal Depth**. By using intentional asymmetry, generous white space (inspired by high-end architectural blueprints), and a strict "No-Line" policy, we convey trust through technical precision rather than decorative elements. The goal is a UI that feels as solid and reliable as the concrete being poured on-site.

---

## 2. Colors & Surface Philosophy
The palette is grounded in professional neutrals, using soft architectural blues and fiscal greens to denote stability and progress.

### The "No-Line" Rule
Traditional construction software is cluttered with grids. This design system **prohibits 1px solid borders** for sectioning. Boundaries must be defined by:
- **Background Shifts:** Using `surface-container-low` vs. `surface`.
- **Soft Tonal Transitions:** Creating zones of focus through color weight rather than lines.

### Surface Hierarchy & Nesting
Think of the UI as a series of nested site trailers and storage units.
- **The Site (Base):** Use `surface` (`#f7f9fb`) as the global canvas.
- **The Structure (Sections):** Use `surface-container-low` (`#f2f4f6`) for major content regions.
- **The Blueprint (Cards):** Use `surface-container-lowest` (`#ffffff`) for individual data cards to make them "pop" forward naturally.

### The Glass & Gradient Rule
To add "soul" to financial data:
- **Hero Accents:** Use subtle linear gradients for primary actions (e.g., `primary` to `primary_container`) to give buttons a weighted, tactile feel.
- **Overlays:** Use **Glassmorphism** for floating filters or navigation bars. Apply `surface_container_lowest` with 80% opacity and a `20px` backdrop-blur to allow the project's data colors to bleed through softly.

---

## 3. Typography: The Editorial Scale
We use a dual-font approach to balance technical precision with executive readability.

- **The Technical Voice (Inter):** Used for `body` and `label` styles. Inter’s high x-height ensures that complex financial figures are legible even at the `label-sm` (`0.6875rem`) size.
- **The Authoritative Voice (Manrope):** Used for `display` and `headline` styles. Manrope’s geometric qualities provide a modern, "architected" feel for large totals and project titles.

**Hierarchy Strategy:**
Use `display-md` (`2.75rem`) for primary financial totals (e.g., Total Spend) to create an immediate focal point. Contrast this with `label-md` in `on_surface_variant` for metadata to create a clear "Data vs. Context" distinction.

---

## 4. Elevation & Depth
In this system, depth equals importance. We achieve this through **Tonal Layering** rather than shadows.

- **The Layering Principle:** A `surface-container-highest` element should only exist inside a `surface-container-low` parent. This "stepping" creates a natural sense of hierarchy.
- **Ambient Shadows:** For floating modals or "active" cards, use a shadow with a `32px` blur and 5% opacity, tinted with `primary` (`#1e3a8a`). This mimics the soft, ambient light of a professional office.
- **The Ghost Border Fallback:** If a divider is essential for accessibility in high-density tables, use a "Ghost Border": `outline_variant` at 15% opacity. Never use 100% opaque lines.

---

## 5. Components

### Buttons & Interaction
- **Primary:** `primary` background with `on_primary` text. Use a subtle `0.5rem` (`lg`) corner radius for a modern but professional look.
- **Secondary/Ghost:** No background; `primary` text. On hover, transition to a `surface-container-high` background.

### Data Chips
- **Status Chips:** For "Paid" or "Pending." Use `secondary_container` for positive states and `error_container` for over-budget alerts. Use `full` (pill) rounding.

### Inputs & Fields
- **Fields:** Use `surface_container_low` for the input background. Forbid the "box" look; use a bottom-only "Ghost Border" that transforms into a `primary` 2px line on focus.

### Cards & Financial Lists
- **The \"No-Divider\" List:** Forbid horizontal lines between expense items. Instead, use a `1.1rem` (`5`) vertical gap. Group items by day or category using a subtle `surface-container-high` header background.
- **Progress Bars:** Use `secondary` (`#006a63`) for \"Budget Used\" and `surface_container_highest` for the \"Remaining\" track. This creates a high-contrast, trustworthy visual of fiscal health.

### Construction-Specific Components
- **The \"Milestone Gauge\":** A custom radial chart using `primary` and `secondary` to show project completion vs. budget burn.
- **Document Preview Cards:** Use `glassmorphism` for PDF thumbnails to indicate transparency and \"open books\" for all stakeholders.

---

## 6. Do's and Don'ts

### Do:
- **Use generous padding:** Use the `16` (`3.5rem`) spacing token for page margins to give the dashboard an \"Executive Report\" feel.
- **Use \"Surface-on-Surface\":** Create hierarchy by placing white cards on light gray backgrounds.
- **Prioritize data visualization:** Use the `secondary` green for growth/positive values and `primary` blue for structural/static values.

### Don't:
- **Don't use black:** Use `on_surface` (`#191c1e`) for text. Pure black is too harsh for a professional transparency tool.
- **Don't use 1px borders:** They create visual noise and \"grid-locking\" which makes financial data harder to parse.
- **Don't crowd the data:** If a table has more than 8 columns, move secondary data into a \"Detail\" drawer using a `surface_container_lowest` overlay.
