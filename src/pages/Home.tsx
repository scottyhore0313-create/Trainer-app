import { Link } from 'react-router-dom'

const FEATURES = [
  {
    title: 'Stance',
    desc: 'Checks your base width and knee bend so you stay balanced and ready to move.',
    icon: '◆',
  },
  {
    title: 'Footwork',
    desc: 'Tracks how active your feet are — cadence, drift, and reaction-ready movement.',
    icon: '△',
  },
  {
    title: 'Power',
    desc: 'Reads explosive bursts and knee loading as a proxy for how you generate force.',
    icon: '⚡',
  },
  {
    title: 'Balance & Control',
    desc: "Flags excess sway, bobbing, or lean that's bleeding your stability.",
    icon: '●',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Record or upload',
    desc: 'Film 5–20 seconds of your stance, footwork, shadow work, or drills — front-on, full body in frame.',
  },
  {
    step: '02',
    title: 'On-device analysis',
    desc: 'Kinetik runs pose estimation right in your browser, tracking 17 body points frame by frame.',
  },
  {
    step: '03',
    title: 'Get a breakdown',
    desc: 'See scored categories, specific corrections, and drills matched to exactly what you need to fix.',
  },
  {
    step: '04',
    title: 'Track progress',
    desc: 'Every session is saved to your dashboard so you can see your scores trend up over time.',
  },
]

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-ink-700/80">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(200,255,58,0.12),_transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-900 px-3.5 py-1.5 text-xs font-medium text-mist-300">
              <span className="h-1.5 w-1.5 rounded-full bg-volt-500" />
              Runs entirely in your browser — no video upload to a server
            </span>
            <h1 className="mt-6 font-display text-4xl font-black leading-[1.05] tracking-tight text-mist-200 sm:text-6xl">
              Your form, broken down like a coach would.
            </h1>
            <p className="mt-5 text-lg text-mist-400 sm:text-xl">
              Record yourself training. Kinetik analyzes your stance,
              footwork, balance, and power, then gives you specific fixes and
              drills — so you get better every rep, not just more tired.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/analyze"
                className="rounded-full bg-volt-500 px-6 py-3 text-center text-sm font-bold text-ink-950 transition hover:bg-volt-400"
              >
                Analyze my form
              </Link>
              <Link
                to="/drills"
                className="rounded-full border border-ink-600 px-6 py-3 text-center text-sm font-semibold text-mist-200 transition hover:border-mist-400"
              >
                Browse the drill library
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-2xl font-bold text-mist-200 sm:text-3xl">
          What Kinetik scores every session
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-ink-700 bg-ink-900 p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-volt-500/15 text-lg text-volt-500">
                {f.icon}
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-mist-200">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm text-mist-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-ink-700/80 bg-ink-900/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center font-display text-2xl font-bold text-mist-200 sm:text-3xl">
            How it works
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.step}>
                <span className="font-display text-3xl font-black text-ink-600">
                  {s.step}
                </span>
                <h3 className="mt-2 font-display text-lg font-bold text-mist-200">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm text-mist-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-ink-700 bg-gradient-to-br from-ink-900 to-ink-800 p-8 text-center sm:p-12">
          <h2 className="font-display text-2xl font-black text-mist-200 sm:text-3xl">
            Ready to see what's actually happening in your movement?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-mist-400">
            Grab your phone, set it on a shelf or have a friend hold it, and
            record a quick clip. Kinetik does the rest.
          </p>
          <Link
            to="/analyze"
            className="mt-6 inline-block rounded-full bg-volt-500 px-6 py-3 text-sm font-bold text-ink-950 transition hover:bg-volt-400"
          >
            Start your first session
          </Link>
        </div>
      </section>
    </div>
  )
}
