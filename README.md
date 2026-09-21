# Kinetik — AI Athletic Trainer

Record yourself training and get an instant, on-device breakdown of your
**stance**, **footwork**, **power/explosiveness**, **balance & control**,
and **guard/upper body** — plus specific tips and drills matched to what
you actually need to work on.

## How it works

1. **Record or upload** a 5–15 second clip (front-on, full body in frame).
2. **On-device pose estimation** — [TensorFlow.js](https://www.tensorflow.org/js)
   with the [MoveNet](https://blog.tensorflow.org/2021/05/next-generation-pose-detection-with-movenet-and-tensorflowjs.html)
   model runs entirely in your browser, sampling the clip at ~8fps and
   tracking 17 body keypoints per frame. **Nothing is uploaded to a
   server** — the model and inference both run client-side.
3. **Biomechanics engine** (`src/lib/metrics.ts`) turns the raw keypoint
   sequence into measurements: stance width relative to shoulder width,
   knee flexion angle, torso lean, lateral sway / vertical bob of your
   center of mass, foot-speed and step-rate (footwork), and guard height /
   elbow position when hands are visible.
4. **Feedback engine** (`src/lib/feedback.ts`) is a transparent, rule-based
   scoring system — no black box — that turns those measurements into
   0–100 category scores, plain-language tips, and matched drills from the
   drill library (`src/data/drills.ts`).
5. **Dashboard** (`src/pages/Dashboard.tsx`) stores every session in
   `localStorage` and charts your scores over time.

## Honest scope & limitations

This analyzes 2D video with a general-purpose pose model, not a lab
motion-capture rig:

- **"Power" is a proxy**, not a true force measurement — it's inferred from
  movement speed and knee loading, since force can't be derived from a
  single 2D camera.
- Accuracy depends heavily on **lighting, camera angle, and having your
  full body in frame**. Side angles, baggy clothing, and low light will
  hurt keypoint confidence.
- This is a training aid, **not a substitute for a certified coach or
  medical/physical-therapy advice**.

## Tech stack

- [Vite](https://vite.dev) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) for styling
- [react-router-dom](https://reactrouter.com) (hash routing, so it works
  on any static host with no server config)
- [@tensorflow-models/pose-detection](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection) (MoveNet) for on-device pose estimation
- [recharts](https://recharts.org) for the progress dashboard

## Project structure

```
src/
  components/     Layout, ScoreRing, CategoryCard
  data/drills.ts  Drill library (stance/footwork/power/balance/guard/athleticism)
  lib/
    pose.ts       Loads MoveNet, samples a video into per-frame keypoints
    metrics.ts    Keypoints -> biomechanics measurements
    feedback.ts   Measurements -> scored categories, tips, drill matches
    skeleton.ts   Draws the live skeleton overlay during analysis
    storage.ts    localStorage session history
    thumbnail.ts  Captures a session thumbnail frame
  pages/
    Home.tsx      Landing page
    Analyze.tsx   Record/upload -> live analysis -> results
    Dashboard.tsx Session history + score trends
    Drills.tsx    Browsable drill library
```

`Analyze` and `Dashboard` are lazy-loaded so the ~1.3MB TensorFlow.js /
MoveNet bundle only downloads when you actually visit the Analyze page.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # typecheck + production build
npm run lint     # oxlint
```

### A note on the pose model in sandboxed environments

MoveNet's weights are fetched from `tfhub.dev` at runtime the first time
you visit the Analyze page. If you're running this behind a restrictive
network proxy that blocks that domain, model loading will fail (the app
surfaces a friendly error and lets you retry) — this is not an issue in a
normal browser on the open internet.
