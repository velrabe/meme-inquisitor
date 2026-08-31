# Meme Inquisitor development rules

## Stack

- Use Phaser 4.2.1.
- Use JavaScript ES modules.
- Do not introduce TypeScript.
- Use Vite for development and production builds.

## Implementation boundaries

- Use Phaser for scenes, rendering, sprites, animations, asset loading, input, cameras, scaling, tweens, timers and audio.
- Use plain JavaScript for game rules, state, data definitions and simple gameplay math.
- Do not duplicate Phaser functionality with low-level Canvas, DOM input or custom render-loop code unless Phaser cannot provide the required behavior.
- Do not add a physics engine unless a concrete approved mechanic requires it.
- Do not add a new dependency when Phaser, JavaScript or the browser already provides the required capability.

## Scope discipline

- Implement only the currently requested P0 behavior.
- Do not create files, systems, abstractions or services solely for possible future features.
- Do not add placeholder implementations that will knowingly be discarded later.
- Do not silently add mechanics merely because they were mentioned during discussion.
- Separate required P0 work from optional P1 ideas.
- Preserve agreed module boundaries and readable names; minimal code does not mean clever one-liners or mixing responsibilities.
- Fix root causes rather than patching individual symptoms.

## Collaboration and ownership

- The user owns final asset creation, Figma composition, visual calibration, gameplay-feel decisions, difficulty decisions and all in-browser acceptance testing.
- The planning agent owns the global technical direction, decomposes it into small Cursor tasks, explains dependencies and waits for user approval before handing off implementation work.
- Cursor implements only the approved bounded task. Cursor must not choose final visual values, claim that visuals are calibrated, tune difficulty by itself or expand the task into adjacent milestones.
- Separate final system implementation from subjective calibration. Cursor exposes named data/configuration values; the user supplies or approves the final values after testing.
- Do not mark visual quality, animation feel, control feel or difficulty as complete without explicit user confirmation.
- Every implementation task must state: owner, required inputs, exact code responsibility, excluded work, user verification steps and completion criteria.
- Prefer one bounded system per Cursor iteration. Do not combine input, projection, balance, effects and UI into one implementation request.
- When a bug is reported, identify the existing scene, entity, system, data file or service that owns the behavior and fix it there. Do not bypass module boundaries with an unrelated scene-level special case.

## Assets and platform

- Keep master sources, compositions and unused variants under `source-assets`. Phaser does not load this folder, and Vite does not copy it into `dist`.
- Keep only game-ready files under `public/assets`: optimized PNGs, atlases, backgrounds, audio, FX and UI.
- Do not mix source PNGs, runtime PNGs and atlases in the same folder.
- Create `public/assets/atlases/` only when the first real atlas `.png` and `.json` exist.
- Use lowercase Latin kebab-case filenames without spaces.
- Keep platform-specific APIs behind an adapter; gameplay code must not call GamePush directly.
- Do not install or create Playwright, automated playtesting, testing agents or testing hooks unless the user explicitly requests them. The user performs gameplay testing manually.

## Phaser knowledge

- When working with Phaser APIs, consult the relevant official project skills under `.cursor/skills/phaser`.
- Prefer instructions matching Phaser 4.2.1 over remembered Phaser 3 patterns or community examples.
