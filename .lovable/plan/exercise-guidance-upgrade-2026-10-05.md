# Exercise Guidance Upgrade

## What will be built

- Add a reusable exercise details dialog showing the exercise name, body area, equipment, difficulty, and the existing step-by-step form cues.
- Add an accessible info control beside every exercise in both the active workout logger and weekly plan cards.
- Add a dedicated **Exercises** page with search, body-area filters, result count, and browsable exercise cards that open the same details dialog.
- Add **Exercises** to the main navigation while preserving the current dark/light themes and mobile layout.

## Technical details

- Reuse the existing exercise definitions, region mapping, and coaching cues as the single source of truth.
- Build the modal with the app’s existing dialog primitives and keyboard/focus handling.
- Create the `/exercises` route with unique page metadata and use typed TanStack navigation.
- Keep this frontend-only: no custom-exercise creation, storage changes, accounts, or other library features.

## Validation

- Check search, filtering, opening/closing details, and keyboard access.
- Verify cue access from both an active session and the weekly plan.
- Check desktop and compact mobile layouts, then confirm the app builds without errors.