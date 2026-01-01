# UX Notes

## Interaction Model
- Users pick an intensity from the palette, then click or drag to paint cells.
- The legend is always visible to reinforce the level -> color mapping.
- Date range inputs live alongside the grid to keep the timeline explicit.
- Preview and generate actions are separated to encourage confirmation before writing Git history.
- A helper note reminds users that GitHub recalculates contribution colors based on total history.

## Visual System
- Typography blends Space Grotesk (headers/body) with IBM Plex Mono for technical readouts.
- The background uses layered gradients to avoid a flat, default UI.
- Cards and panels use rounded geometry and soft shadows to feel tactile.

## Accessibility
- Cells are rendered as buttons with `aria-label` for assistive tech.
- Primary/secondary actions are clearly distinguished by color and weight.
