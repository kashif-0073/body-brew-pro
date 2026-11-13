<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Exercise guidance uses the built-in exercise catalog as its single source of truth so workout cues and library details stay consistent.

- Signed-in users store their whole app state as one JSON row in public.user_state (cloud wins on sign-in; local data uploads if the account is empty); guests stay on localStorage. Why: keeps the existing local store untouched while adding cross-device sync.

- Smart Coach keeps Gemini request construction in a browser-safe helper shared with focused tests, while outbound provider calls remain in the server function. Why: makes authentication behavior verifiable without moving provider requests into the page.
