import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/analyze', label: 'Analyze' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/drills', label: 'Drills' },
]

function NavPill({
  to,
  label,
  end,
  onClick,
}: {
  to: string
  label: string
  end?: boolean
  onClick?: () => void
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-volt-500 text-ink-950'
            : 'text-mist-300 hover:bg-ink-700 hover:text-mist-200'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-ink-950">
      <header className="sticky top-0 z-40 border-b border-ink-700/80 bg-ink-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-volt-500 font-display text-lg font-black text-ink-950">
              K
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-mist-200">
              Kinetik
            </span>
          </NavLink>

          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map((link) => (
              <NavPill key={link.to} {...link} />
            ))}
          </nav>

          <div className="hidden sm:block">
            <NavLink
              to="/analyze"
              className="rounded-full bg-mist-200 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-white"
            >
              Record a session
            </NavLink>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-600 text-mist-200 sm:hidden"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              {open ? (
                <path
                  d="M2 2L16 16M16 2L2 16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M1 4H17M1 9H17M1 14H17"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <div className="flex flex-col gap-1 border-t border-ink-700/80 px-4 py-3 sm:hidden">
            {NAV_LINKS.map((link) => (
              <NavPill key={link.to} {...link} onClick={() => setOpen(false)} />
            ))}
            <NavLink
              to="/analyze"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-mist-200 px-4 py-2 text-center text-sm font-semibold text-ink-950"
            >
              Record a session
            </NavLink>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink-700/80 px-4 py-8 text-center text-sm text-mist-400 sm:px-6">
        <p>
          Kinetik runs pose analysis entirely in your browser — your video
          never leaves your device.
        </p>
        <p className="mt-1 text-mist-400/70">
          Not a substitute for a certified coach or medical advice.
        </p>
      </footer>
    </div>
  )
}
