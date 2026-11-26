# NEXT10B — Per-frame allocation reduction and simulated endurance

**Status:** Development PR / CI verification. **Base:** NEXT10 [PR #42](https://github.com/zxc28tarik/daethlyspacerace2202/pull/42), itself stacked on NEXT09 #41. This work does not merge or alter `main`.

## Changes to the actual game

- **GFX01 GLB LOD:** remove per-frame `[threshold,threshold]` allocations, use equivalent scalar hysteresis; replace one `forEach` closure on LOD swap with indexed iteration. Preserve exactly the same thresholds, visuals, GLB children and switch counts.
- **GFX07 selective lighting:** cache each light's immutable landmark progress once at creation; remove per-update scan of 12 landmarks. Low still suppresses the three optional lights. Positions and global lighting are unchanged.
- **GFX09 CHASE camera:** reusable camera vectors for Map4 and existing real solid-collider arrays scanned independently; no new `concat` blocker array or `clone` every frame. Keep original Map1 camera expression unchanged, as well as physical collision/steering.
- **Zero balance changes:** map 1 corridor race, map4 4 phases, 60-second arena, 300-second overall limit, 850 altitude, 5 rivals, 8 hunters, +1/+3 hunter points, 6 canyon +36 industrial colliders, boosts/HP/weapon timing remain unchanged.

## Test proof / hardware limitations

New `tests/map4-gfx10b-endurance.cjs` runs in Chromium/WebGL SwiftShader:

- 4 representative sector progress stages and High/Balanced/Low warming.
- 6,000 × 50ms = **300 seconds simulated VFX time**, with 4,000 pooled SMOKE/ENGINE emits, camera occlusion probes, quality swaps.
- Every VFX pool must stay under its hard instance cap and eventually expire to zero.
- Scene Mesh/Light/direct-child counts must not grow; renderer geometry and texture counters must stay within a small static tolerance after asset warm-up.
- Competitors, hunters, colliders, 60/300-second constants, altitude and score unchanged.
- Existing Map1/4 offline, GFX09, GFX10, fixed-art baselines retained in same GitHub Actions workflow.

This is **not five minutes of actual gameplay**; neither an FPS/p95 benchmark on a native desktop GPU nor GPU VRAM usage is certified by SwiftShader. It is a deterministic long-duration simulation for bounded transient resources.

## Acceptance

- [x] **Full CI PASS:** [GitHub Actions #43954482993](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43954482993). Map1/4/offline, GFX09, GFX10, GFX10B and 12 art-baseline captures succeeded. 300s simulated visual test: before/after **3532 Mesh, 8 Light, 672 top-level scene children, 340 renderer geometries and 25 textures**, all unchanged. 4000 emissions, 1500 chase camera probes, all pooled events/instances expired to zero. This does **not** certify native-GPU FPS.
- [ ] Browser image inspect for unintended LOD switch/camera clipping.
- [ ] On-device 720p/1080p 5-minute real gameplay, GPU frame-time/p95 and VRAM profile.
- [ ] Final artistic/user acceptance and dependent PR merge chain.

**Next on another single dot:** fix any NEXT10B test or resource regression first; otherwise continue the actual on-device GPU/visual QA, then NEXT11 proof gallery and NEXT12 3-map publisher milestone.
