# Paper-cut layers

`cut_layers.py` cuts a painting into paper layers for `assets/paper/paper-scene.js`.

1. Python venv with `onnxruntime opencv-python-headless numpy pillow`.
2. Depth model: `depth_anything_v2_vits_dynamic.onnx` from the GitHub release
   `fabio-sim/Depth-Anything-ONNX` v2.0.0, placed at `<WORK>/models/depth/`.
3. Edit `LAYERS` in the script: one entry per cut-out (nearest first) with
   - `poly`: rough area in artwork px (keeps neighbours out),
   - `d`: depth range that counts as "this layer" (sample values first; bright = near),
   - `pivot`: stem/branch point it sways around, `depth` (0 far … 1 near), `sway`.
4. Run `python -I cut_layers.py <WORK> <painting> <OUT_DIR>`.
   Output: one `.webp` per layer, `base.webp` (painting with a shadowed fill under the cut-outs),
   and `layers.json` with positions for the PaperScene config.

At rest the layers recompose the original painting exactly; the fill only shows while a sheet moves,
and reads as the shadow it casts.
