# NEXT11C20F — SB-07 Zenit motor ışığı, wing-root sızdırmazlık ve gerçek WebGL QA

**19 Kasım 2026 | Implemented as stacked draft; CI and native GPU/art review still unverified.**

## Design locks
Keep the previously user-approved SB-07 Zenit: long sharp silver/white body, straight swept horizontal wings, two TALL upright outer fins with tips moving outward, red racing panels, smoked navy cockpit, exposed twin rear engines. Do not return to rejected curled/parenthesis designs. Harita 1 remains race only; Map4 B-04 Bastion remains unchanged. No new weapon or collider, no changes to camera #1/boost #2, physics, AI or C18 power.

## Actual game modifications in index.html

1. **Two 64px original canvas-generated radial plasma halos** built inside `h4Ship20ZenitBuild()` as 2 `THREE.Sprite` children of the existing `PLASMA` batch mesh; one at each nozzle exit ±1.8 x, -0.25 y, 6.69 z. Reuse a single procedural CanvasTexture. No external image, downloaded GLB or copyrighted graphics.
2. Additive transparent sprites with depth write OFF, depth test ON; initial opacity .18 and diameter 1.85 ship units. In `h4Ship20ZenitVisualTick(dt)`, actual player speed/boost ramps opacity up to .48 and diameter up to 2.27, with the previous speed-reactive plasma/amber/cockpit effects retained. Map4 and paused/non-running frames do not update the visual effect.
3. Six inset paired engine nozzle-grooves per engine (12 total), plus three inset/flush wing-root seal lines per side (6 total); no change to outer wing profile or wing-tip dimensions.
4. **Render budget:** Existing SB-07 stays 7 *opaque* mesh material batches. Two additional transparent sprite draw calls when SB-07 renders, 64² shared RGBA atlas (~16 KiB uncompressed texels), no dynamic point lights, particles, new collision objects or ship systems. B-04 6 batches remains unaffected.
5. QA metadata: `detailPass=NEXT11C20F`, `engineHaloCount=2`, `engineHaloTextureSize=64`, `nozzleRecesses=12`, `sealedWingRootLines=6`.

## Verification
- [x] Complete inline game JavaScript block parsed without syntax error (static).
- [x] Dedicated Playwright Chromium/WebGL tests now check that two sprite halo nodes actually exist at proper positions, share the atlas, use safe transparent additive rendering, respond to real boost with increasing opacity and size, preserve 7 physical batches and Map4 invariants.
- [x] Dedicated `map1-next11c20f-zenit-plasma.yml` and full Map1/Map4 browser smoke workflow trigger created.
- [x] Independent 360° HTML preview updated (V4); JS parse PASS. **This is a standalone art inspection aid, not a full-game acceptance test.**
- [ ] Actual GitHub Actions workflow success and screenshots confirmed on this commit. Connector returns no actionable PR-run check data; no PASS claim.
- [ ] Native physical GPU/720p+1080p/p95 quality and FPS acceptance.
- [ ] User subjective model/engine light acceptance.
- [ ] Explicit user authorization to merge. **DRAFT NO MERGE.**

## Next
NEXT11C20G should use actual captured WebGL normal and boosted 3/4 views for optical intensity tuning (avoid blown highlights) and check two sprite draw-call impact. Preserve approved silhouette and all user decisions.

Previous: [C20E](MAP1_NEXT11C20E_SB07_SURFACE_QUALITY_ACCEPTANCE.md).
