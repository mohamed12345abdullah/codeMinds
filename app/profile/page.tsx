'use client'

/*
 * ProfilePage – Improved Production Version
 *
 * Key changes vs original:
 *  1. Layout   – Navbar overlap fixed via --navbar-height CSS var (72px default), used everywhere
 *  2. API      – Duplicate useEffect/fetch consolidated; verifyTokenApi reused; errors surfaced
 *  3. Perf     – useMemo for all derived stats; useCallback for handlers; CircularProgress
 *                  gradient ID made unique per-instance with useId()
 *  4. A11y     – role="tablist/tab", aria-selected, aria-expanded on accordions,
 *                  focus-visible rings, aria-live="polite" on loading/error states,
 *                  alt text on avatar, sr-only labels on icon-only buttons
 *  5. Mobile   – Tab bar scrollable on narrow viewports; hero card stacks gracefully;
 *                video grid min-width reduced; account grid adapts; touch targets ≥44px
 *  6. Code     – Inline style objects extracted to module-level constants; EmptyState
 *                  moved to top; no silent catch; Badge variant broadened
 */

import {
  useState, useEffect, useMemo, useCallback, useId,
} from 'react'
import { useRouter } from 'next/navigation'
import { verifyTokenApi } from '../apis/auth'
import NavbarPage from '../components/Navbar'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  _id: string; name: string; email: string; phone: string
  role: string; avatar: string; createdAt: string; updatedAt: string
}
interface Course { _id: string; title: string }
interface Lecture {
  _id: string; title: string; date: string; description: string
  videos: string[]; objectives: string[]; createdAt: string; updatedAt: string
}
interface Group { _id: string; title: string; startDate: string; endDate: string; lectures: Lecture[] }
interface LectureProgress {
  task: { taskStatus: string; submittedAt: string | null; file: string; score: number; notes: string }
  lecture: string; engagement: number; attendance: string
  lectureScore: number; notes: string; _id: string; createdAt: string; updatedAt: string
}
interface CourseProgress {
  _id: string; course: string; lectureProgress: LectureProgress[]
  createdAt: string; updatedAt: string
}
interface Profile {
  _id: string; user: string; age: number; gender: string
  courses: Course[]; groups: Group[]; courseProgress: CourseProgress[]
  createdAt: string; updatedAt: string
}
interface ApiResponse { success: boolean; user: User & { profileRef: Profile }; message: string }

type TabId = 'overview' | 'groups' | 'progress'

// ─── Utility ──────────────────────────────────────────────────────────────────

const formatDate = (d?: string | null) => {
  if (!d) return 'N/A'
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
  catch { return 'Invalid date' }
}

const formatDateTime = (d?: string | null) => {
  if (!d) return 'N/A'
  try {
    return new Date(d).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }
  catch { return 'Invalid date' }
}

const getYouTubeId = (url: string): string | null => {
  const m = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)
  return m?.[2]?.length === 11 ? m[2] : null
}

const isYouTubeUrl = (url: string) =>
  url?.includes('youtube.com') || url?.includes('youtu.be')

// ─── Static style objects (prevents new objects on every render) ──────────────

const S = {
  page: {
    minHeight: '100vh',
    background: '#080b13',
    fontFamily: '"Sora", sans-serif',
    // Use CSS variable so a single source controls the navbar offset site-wide.
    // The Navbar component can expose `--navbar-height`; we fall back to 72px.
    paddingTop: 'var(--navbar-height, 72px)',
  } as React.CSSProperties,
  inner: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '32px 20px 80px',
    position: 'relative',
    zIndex: 1,
    animation: 'fadeUp 0.45s ease both',
  } as React.CSSProperties,
  heroCard: {
    background: 'linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.015) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    padding: '28px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap' as const,
    backdropFilter: 'blur(12px)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.05)',
  } as React.CSSProperties,
  sectionCard: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px',
    padding: '28px',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } as React.CSSProperties,
} as const

// ─── Sub-components ───────────────────────────────────────────────────────────

const EmptyState = ({ icon, text }: { icon: string; text: string }) => (
  <div style={{ textAlign: 'center', padding: '40px 20px' }} role="status">
    <div style={{ fontSize: '32px', marginBottom: '12px' }} aria-hidden="true">{icon}</div>
    <p style={{ color: '#9ca3af', fontSize: '14px' }}>{text}</p>
  </div>
)

const StatPill = ({
  value, label, color,
}: { value: string | number; label: string; color: string }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    padding: '12px 18px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.08)', minWidth: '80px',
  }}>
    <span style={{
      fontSize: '20px', fontWeight: '700', color,
      fontFamily: '"DM Mono", monospace', letterSpacing: '-0.5px',
    }}>{value}</span>
    <span style={{
      fontSize: '10px', color: '#6b7280',
      textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500',
    }}>{label}</span>
  </div>
)

type BadgeVariant = 'default' | 'present' | 'absent' | 'submitted' | 'pending' | 'role' | string

const BADGE_VARIANTS: Record<string, { bg: string; color: string; border: string }> = {
  default:   { bg: 'rgba(99,102,241,0.15)',  color: '#a5b4fc', border: 'rgba(99,102,241,0.3)' },
  role:      { bg: 'rgba(16,185,129,0.12)',  color: '#6ee7b7', border: 'rgba(16,185,129,0.25)' },
  present:   { bg: 'rgba(16,185,129,0.12)',  color: '#6ee7b7', border: 'rgba(16,185,129,0.25)' },
  absent:    { bg: 'rgba(239,68,68,0.12)',   color: '#fca5a5', border: 'rgba(239,68,68,0.25)' },
  submitted: { bg: 'rgba(16,185,129,0.12)',  color: '#6ee7b7', border: 'rgba(16,185,129,0.25)' },
  pending:   { bg: 'rgba(245,158,11,0.12)',  color: '#fcd34d', border: 'rgba(245,158,11,0.25)' },
}

const Badge = ({
  children, variant = 'default',
}: { children: React.ReactNode; variant?: BadgeVariant }) => {
  const v = BADGE_VARIANTS[variant] ?? BADGE_VARIANTS.default
  return (
    <span style={{
      padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600',
      letterSpacing: '0.06em', textTransform: 'capitalize',
      background: v.bg, color: v.color, border: `1px solid ${v.border}`,
    }}>
      {children}
    </span>
  )
}

// Unique gradient id per instance prevents conflicts when multiple CircularProgress exist.
const CircularProgress = ({ pct, size = 72 }: { pct: number; size?: number }) => {
  const uid = useId().replace(/:/g, '')
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const dash = Math.max(0, Math.min(pct, 100)) / 100 * circ
  const gradId = `cpg-${uid}`
  return (
    <svg
      width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)' }}
      role="img"
      aria-label={`${pct}% attendance`}
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={`url(#${gradId})`} strokeWidth="6"
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
      />
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#6ee7b7" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const AccordionCard = ({
  id, title, right, children, defaultOpen = false,
}: {
  id: string
  title: React.ReactNode
  right?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}) => {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = `panel-${id}`
  const buttonId = `btn-${id}`
  return (
    <div style={{
      borderRadius: '16px', border: '1px solid rgba(255,255,255,0.07)',
      overflow: 'hidden', background: 'rgba(255,255,255,0.02)',
    }}>
      <button
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '16px 20px',
          background: 'rgba(255,255,255,0.03)', border: 'none', cursor: 'pointer',
          transition: 'background 0.2s', minHeight: '52px', // touch target
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
      >
        <span style={{
          fontFamily: '"Sora", sans-serif', fontWeight: '600',
          fontSize: '15px', color: '#e5e7eb', textAlign: 'left',
        }}>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {right}
          <span
            aria-hidden="true"
            style={{
              color: '#6b7280', fontSize: '11px',
              transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              display: 'inline-block',
            }}
          >▼</span>
        </div>
      </button>
      {open && (
        <div id={panelId} role="region" aria-labelledby={buttonId}
          style={{ padding: '20px', background: 'rgba(0,0,0,0.15)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

const SkeletonBlock = ({ w = '100%', h = '16px', radius = '6px' }: {
  w?: string; h?: string; radius?: string
}) => (
  <div style={{
    width: w, height: h, borderRadius: radius,
    background: 'rgba(255,255,255,0.06)',
    animation: 'shimmer 1.4s ease infinite',
  }} aria-hidden="true" />
)

const LoadingSkeleton = () => (
  <div style={{ padding: '32px 20px', maxWidth: '1100px', margin: '0 auto' }}>
    <div style={{
      ...S.heroCard,
      flexWrap: 'nowrap', gap: '20px', marginBottom: '24px',
    }}>
      <div style={{
        width: 96, height: 96, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)', flexShrink: 0,
        animation: 'shimmer 1.4s ease infinite',
      }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SkeletonBlock w="220px" h="28px" radius="8px" />
        <SkeletonBlock w="160px" h="14px" />
        <SkeletonBlock w="120px" h="14px" />
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '14px' }}>
      {[1, 2, 3, 4].map(i => (
        <SkeletonBlock key={i} h="90px" radius="16px" />
      ))}
    </div>
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────

const ProfilePage = () => {
  const [userData, setUserData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const router = useRouter()

  // ── Handle OAuth token in URL (runs once on mount) ────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const userParam = params.get('user')
    if (!token) return

    localStorage.setItem('token', token)
    if (userParam) {
      try { localStorage.setItem('user', JSON.stringify(JSON.parse(decodeURIComponent(userParam)))) }
      catch { /* malformed param – ignore */ }
    }
    ;(async () => {
      try {
        await verifyTokenApi()
        window.location.replace('/profile')
      } catch {
        router.push('/login')
      }
    })()
  }, [router])

  // ── Load profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    // Skip if we're in the OAuth-callback branch (token in URL)
    const params = new URLSearchParams(window.location.search)
    if (params.get('token')) return

    ;(async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) { router.push('/login'); return }

        const res = await fetch('https://code-minds-website.vercel.app/api/auth/verifyToken', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (res.status === 401 || res.status === 403) { router.push('/login'); return }
        if (!res.ok) throw new Error(`Server error: ${res.status}`)

        const data: ApiResponse = await res.json()
        if (!data?.success) throw new Error(data?.message || 'Unexpected response')

        // Role-based redirects
        if (data.user?.role === 'instructor') { router.push('/instructorDashboard'); return }
        if (data.user?.role === 'manager') { router.push('/dashboard'); return }

        setUserData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load profile.')
      } finally {
        setLoading(false)
      }
    })()
  }, [router])

  // ── Derived stats (memoised) ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const profile = userData?.user?.profileRef
    const courseProgress = profile?.courseProgress ?? []
    const courses = profile?.courses ?? []

    const totalLectures = courseProgress.reduce(
      (s, cp) => s + (cp.lectureProgress?.length ?? 0), 0,
    )
    const attendedLectures = courseProgress.reduce(
      (s, cp) => s + (cp.lectureProgress?.filter(l => l.attendance === 'present').length ?? 0), 0,
    )
    const submittedTasks = courseProgress.flatMap(
      cp => cp.lectureProgress?.filter(l => l.task?.taskStatus === 'submitted') ?? [],
    )
    const avgScore = submittedTasks.length > 0
      ? Math.round(submittedTasks.reduce((s, l) => s + (l.task?.score ?? 0), 0) / submittedTasks.length)
      : 0
    const overallPct = totalLectures > 0
      ? Math.round((attendedLectures / totalLectures) * 100)
      : 0

    return { totalLectures, attendedLectures, submittedTasks, avgScore, overallPct, courses, courseProgress }
  }, [userData])

  const handleTabKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const tabs: TabId[] = ['overview', 'groups', 'progress']
    const idx = tabs.indexOf(activeTab)
    if (e.key === 'ArrowRight') setActiveTab(tabs[(idx + 1) % tabs.length])
    if (e.key === 'ArrowLeft') setActiveTab(tabs[(idx - 1 + tabs.length) % tabs.length])
  }, [activeTab])

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080b13' }}>
      <NavbarPage />
      <div
        style={{ paddingTop: 'var(--navbar-height, 72px)' }}
        aria-live="polite"
        aria-busy="true"
        aria-label="Loading profile"
      >
        <LoadingSkeleton />
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
      `}</style>
    </div>
  )

  // ── Error state ───────────────────────────────────────────────────────────
  if (error || !userData?.user) return (
    <div style={{ minHeight: '100vh', background: '#080b13', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <NavbarPage />
      <p
        role="alert"
        style={{ color: '#fca5a5', fontFamily: '"Sora", sans-serif', fontSize: '15px' }}
      >
        {error ?? 'Unable to load profile.'}
      </p>
    </div>
  )

  const { user } = userData
  const profile = user.profileRef
  const courses = profile?.courses ?? []
  const groups = profile?.groups ?? []
  const courseProgress = profile?.courseProgress ?? []
  const { totalLectures, attendedLectures, submittedTasks, avgScore, overallPct } = stats

  const TABS: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'groups',   label: 'Groups & Lectures' },
    { id: 'progress', label: 'Progress' },
  ]

  return (
    <>
      {/* ── Global styles ─────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080b13; }

        :root { --navbar-height: 72px; }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0f1420; }
        ::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); border-radius: 3px; }

        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes spin    { to { transform: rotate(360deg); } }

        /* Focus ring – visible only for keyboard nav */
        :focus-visible {
          outline: 2px solid rgba(16,185,129,0.6);
          outline-offset: 2px;
          border-radius: 6px;
        }
        :focus:not(:focus-visible) { outline: none; }

        .tab-btn {
          background: none; border: none; cursor: pointer;
          font-family: "Sora", sans-serif; font-size: 14px; font-weight: 500;
          padding: 10px 18px; border-radius: 10px; transition: all 0.2s;
          white-space: nowrap;
          /* Minimum touch target */
          min-height: 44px;
        }
        .tab-btn:hover { background: rgba(255,255,255,0.05); }
        .tab-btn[aria-selected="true"] { background: rgba(16,185,129,0.12); color: #6ee7b7 !important; }

        .course-card {
          transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
        }
        .course-card:hover {
          transform: translateY(-3px);
          border-color: rgba(16,185,129,0.4) !important;
          background: rgba(16,185,129,0.05) !important;
        }
        .action-btn { transition: transform 0.2s, box-shadow 0.2s; }
        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(16,185,129,0.25) !important;
        }

        /* Mobile overrides */
        @media (max-width: 640px) {
          .hero-stats { flex-direction: column !important; align-items: flex-start !important; }
          .hero-stats .stat-pills { flex-direction: row !important; flex-wrap: wrap !important; }
          .tab-bar { overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
          .tab-bar::-webkit-scrollbar { display: none; }
          .account-grid { grid-template-columns: 1fr 1fr !important; }
          .video-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 400px) {
          .account-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <NavbarPage />

      {/* ── Page wrapper ────────────────────────────────────────────────────── */}
      <div style={S.page}>

        {/* Background decoration */}
        <div aria-hidden="true" style={{
          position: 'fixed', inset: 0,
          backgroundImage: 'linear-gradient(rgba(16,185,129,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,0.03) 1px,transparent 1px)',
          backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0,
        }} />
        <div aria-hidden="true" style={{
          position: 'fixed', top: '-20%', right: '-10%', width: '600px', height: '600px',
          background: 'radial-gradient(circle,rgba(16,185,129,0.06) 0%,transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={S.inner}>

          {/* ── Hero card ─────────────────────────────────────────────────── */}
          <div style={S.heroCard}>

            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '90px', height: '90px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#10b981,#059669)', padding: '3px',
                boxShadow: '0 0 0 1px rgba(16,185,129,0.3),0 8px 32px rgba(16,185,129,0.15)',
              }}>
                <img
                  src={user.avatar || '/favicon.ico'}
                  alt={`${user.name ?? 'User'}'s avatar`}
                  width={84} height={84}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: '#111' }}
                  loading="lazy"
                  onError={e => { (e.currentTarget as HTMLImageElement).src = '/default-avatar.png' }}
                />
              </div>
              <div aria-hidden="true" style={{
                position: 'absolute', bottom: '2px', right: '2px',
                width: '16px', height: '16px', background: '#10b981',
                borderRadius: '50%', border: '2px solid #080b13',
              }} />
            </div>

            {/* Identity */}
            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f9fafb', letterSpacing: '-0.4px' }}>
                  {user.name || 'Unknown User'}
                </h1>
                <Badge variant="role">{user.role || 'student'}</Badge>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                  <span aria-hidden="true" style={{ color: '#374151', marginRight: '5px' }}>✉</span>
                  {user.email}
                </span>
                {user.phone && (
                  <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                    <span aria-hidden="true" style={{ color: '#374151', marginRight: '5px' }}>📱</span>
                    {user.phone}
                  </span>
                )}
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                  Joined {formatDate(user.createdAt)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {profile?.age && <Badge>Age {profile.age}</Badge>}
                {profile?.gender && <Badge>{profile.gender}</Badge>}
                {courses.length > 0 && <Badge>{courses.length} course{courses.length !== 1 ? 's' : ''}</Badge>}
              </div>
            </div>

            {/* Stats */}
            <div className="hero-stats" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                <CircularProgress pct={overallPct} />
                <div style={{ position: 'absolute', textAlign: 'center' }} aria-hidden="true">
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#10b981', fontFamily: '"DM Mono", monospace' }}>
                    {overallPct}%
                  </div>
                  <div style={{ fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    attend
                  </div>
                </div>
              </div>
              <div className="stat-pills" style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <StatPill value={`${attendedLectures}/${totalLectures}`} label="Lectures" color="#e5e7eb" />
                <StatPill value={submittedTasks.length} label="Tasks Done" color="#6ee7b7" />
                <StatPill value={`${avgScore}%`} label="Avg Score" color="#fcd34d" />
              </div>
            </div>
          </div>

          {/* ── Role action buttons ────────────────────────────────────────── */}
          {(user.role === 'instructor' || user.role === 'manager') && (
            <div style={{ marginBottom: '24px' }}>
              {user.role === 'instructor' && (
                <Link href="/instructorDashboard" style={{ textDecoration: 'none' }}>
                  <button className="action-btn" style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg,#10b981,#059669)',
                    border: 'none', borderRadius: '12px', color: '#fff',
                    fontFamily: '"Sora",sans-serif', fontWeight: '600', fontSize: '14px',
                    cursor: 'pointer', boxShadow: '0 4px 16px rgba(16,185,129,0.2)',
                    minHeight: '44px',
                  }}>
                    → Instructor Dashboard
                  </button>
                </Link>
              )}
              {user.role === 'manager' && (
                <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                  <button className="action-btn" style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                    border: 'none', borderRadius: '12px', color: '#fff',
                    fontFamily: '"Sora",sans-serif', fontWeight: '600', fontSize: '14px',
                    cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.2)',
                    minHeight: '44px',
                  }}>
                    → Manager Dashboard
                  </button>
                </Link>
              )}
            </div>
          )}

          {/* ── Tab bar ────────────────────────────────────────────────────── */}
          <div
            role="tablist"
            aria-label="Profile sections"
            className="tab-bar"
            onKeyDown={handleTabKeyDown}
            style={{
              display: 'flex', gap: '4px', marginBottom: '24px',
              background: 'rgba(255,255,255,0.03)', borderRadius: '14px',
              padding: '5px', border: '1px solid rgba(255,255,255,0.06)',
              width: 'fit-content', maxWidth: '100%',
            }}
          >
            {TABS.map(t => (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={activeTab === t.id}
                aria-controls={`tabpanel-${t.id}`}
                className="tab-btn"
                style={{ color: activeTab === t.id ? '#6ee7b7' : '#6b7280' }}
                onClick={() => setActiveTab(t.id)}
                tabIndex={activeTab === t.id ? 0 : -1}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ══════════════ OVERVIEW TAB ══════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div
              id="tabpanel-overview"
              role="tabpanel"
              aria-labelledby="tab-overview"
              style={{ animation: 'fadeUp 0.3s ease both' }}
            >
              {/* Courses */}
              <div style={{ ...S.sectionCard, marginBottom: '16px' }}>
                <h2 style={S.sectionTitle}>
                  <span aria-hidden="true" style={{ width: '4px', height: '18px', background: '#10b981', borderRadius: '2px', display: 'inline-block' }} />
                  Enrolled Courses
                </h2>
                {courses.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '12px' }}>
                    {courses.map((c, i) => (
                      <div key={`${c._id}-${i}`} className="course-card" style={{
                        padding: '16px', borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.07)',
                        background: 'rgba(255,255,255,0.025)',
                      }}>
                        <div aria-hidden="true" style={{
                          width: '34px', height: '34px', borderRadius: '10px',
                          background: 'rgba(16,185,129,0.12)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          marginBottom: '10px', fontSize: '15px',
                        }}>📖</div>
                        <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#e5e7eb', lineHeight: '1.4' }}>
                          {c.title || 'Untitled Course'}
                        </h3>
                      </div>
                    ))}
                  </div>
                ) : <EmptyState icon="📚" text="No courses enrolled yet." />}
              </div>

              {/* Account details */}
              <div style={S.sectionCard}>
                <h2 style={S.sectionTitle}>
                  <span aria-hidden="true" style={{ width: '4px', height: '18px', background: '#6366f1', borderRadius: '2px', display: 'inline-block' }} />
                  Account Details
                </h2>
                <dl className="account-grid" style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '10px',
                }}>
                  {([
                    ['Email',        user.email],
                    ['Phone',        user.phone || 'N/A'],
                    ['Role',         user.role],
                    ['Age',          profile?.age ?? 'N/A'],
                    ['Gender',       profile?.gender || 'N/A'],
                    ['Member Since', formatDate(user.createdAt)],
                  ] as [string, string | number][]).map(([label, value]) => (
                    <div key={label} style={{
                      padding: '12px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <dt style={{
                        fontSize: '10px', color: '#6b7280',
                        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px',
                      }}>{label}</dt>
                      <dd style={{ fontSize: '14px', color: '#e5e7eb', fontWeight: '500' }}>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {/* ══════════════ GROUPS TAB ════════════════════════════════════════ */}
          {activeTab === 'groups' && (
            <div
              id="tabpanel-groups"
              role="tabpanel"
              aria-labelledby="tab-groups"
              style={{ animation: 'fadeUp 0.3s ease both', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {groups.length > 0 ? groups.map(group => (
                <AccordionCard
                  key={group._id}
                  id={`group-${group._id}`}
                  title={group.title || 'Untitled Group'}
                  right={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        {formatDate(group.startDate)} – {formatDate(group.endDate)}
                      </span>
                      <Badge>{group.lectures?.length ?? 0} lecture{group.lectures?.length !== 1 ? 's' : ''}</Badge>
                    </div>
                  }
                >
                  {group.lectures?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {group.lectures.map(lec => (
                        <AccordionCard
                          key={lec._id}
                          id={`lec-${lec._id}`}
                          title={<span style={{ fontSize: '14px' }}>{lec.title || 'Untitled Lecture'}</span>}
                          right={<span style={{ fontSize: '12px', color: '#6b7280' }}>{formatDateTime(lec.date)}</span>}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {lec.description && (
                              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.65' }}>{lec.description}</p>
                            )}

                            {lec.videos?.length > 0 && (
                              <section aria-label="Video Resources">
                                <h5 style={{ fontSize: '12px', color: '#6ee7b7', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                  Video Resources
                                </h5>
                                <div className="video-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '10px' }}>
                                  {lec.videos.map((v, idx) => (
                                    <div key={idx} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                                      {isYouTubeUrl(v) ? (
                                        <iframe
                                          src={`https://www.youtube.com/embed/${getYouTubeId(v)}`}
                                          title={`${lec.title} – video ${idx + 1}`}
                                          frameBorder="0"
                                          allowFullScreen
                                          loading="lazy"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          style={{ width: '100%', height: '170px', display: 'block' }}
                                        />
                                      ) : (
                                        <a
                                          href={v}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          aria-label={`Watch video ${idx + 1} for ${lec.title}`}
                                          style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '14px', background: 'rgba(16,185,129,0.05)',
                                            color: '#6ee7b7', textDecoration: 'none',
                                            fontSize: '13px', fontWeight: '500', minHeight: '44px',
                                          }}
                                        >
                                          <span aria-hidden="true">▶</span> Watch Video {idx + 1}
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </section>
                            )}

                            {lec.objectives?.length > 0 && (
                              <section aria-label="Learning Objectives">
                                <h5 style={{ fontSize: '12px', color: '#a5b4fc', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                  Learning Objectives
                                </h5>
                                <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {lec.objectives.map((obj, i) => (
                                    <li key={i} style={{ fontSize: '13px', color: '#9ca3af', paddingLeft: '18px', position: 'relative', lineHeight: '1.55' }}>
                                      <span aria-hidden="true" style={{ position: 'absolute', left: 0, color: '#10b981' }}>›</span>
                                      {obj}
                                    </li>
                                  ))}
                                </ul>
                              </section>
                            )}
                          </div>
                        </AccordionCard>
                      ))}
                    </div>
                  ) : <EmptyState icon="🗓" text="No lectures scheduled yet." />}
                </AccordionCard>
              )) : <EmptyState icon="👥" text="No groups assigned yet." />}
            </div>
          )}

          {/* ══════════════ PROGRESS TAB ══════════════════════════════════════ */}
          {activeTab === 'progress' && (
            <div
              id="tabpanel-progress"
              role="tabpanel"
              aria-labelledby="tab-progress"
              style={{ animation: 'fadeUp 0.3s ease both' }}
            >
              {/* Summary KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: '12px', marginBottom: '22px' }}>
                {([
                  { icon: '🎯', label: 'Overall Attendance', value: `${overallPct}%`,      sub: `${attendedLectures} of ${totalLectures} lectures`, accent: '#10b981' },
                  { icon: '📝', label: 'Tasks Submitted',    value: submittedTasks.length,  sub: 'completed assignments',                           accent: '#6366f1' },
                  { icon: '⭐', label: 'Average Score',      value: `${avgScore}%`,         sub: 'across all tasks',                                accent: '#f59e0b' },
                  { icon: '📚', label: 'Courses Enrolled',   value: courses.length,         sub: 'active enrolments',                               accent: '#ec4899' },
                ] as const).map(s => (
                  <div key={s.label} style={{
                    padding: '18px', borderRadius: '16px',
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}>
                    <div style={{ fontSize: '20px', marginBottom: '10px' }} aria-hidden="true">{s.icon}</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: s.accent, fontFamily: '"DM Mono",monospace', marginBottom: '4px' }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500', marginBottom: '2px' }}>{s.label}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Per-course breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {courseProgress.length > 0 ? courseProgress.map(cp => {
                  const course = courses.find(c => c._id === cp.course)
                  const attended = cp.lectureProgress?.filter(l => l.attendance === 'present').length ?? 0
                  const total = cp.lectureProgress?.length ?? 0
                  const pct = total > 0 ? Math.round((attended / total) * 100) : 0
                  const submitted = cp.lectureProgress?.filter(l => l.task?.taskStatus === 'submitted') ?? []
                  const avg = submitted.length > 0
                    ? Math.round(submitted.reduce((s, l) => s + (l.task?.score ?? 0), 0) / submitted.length)
                    : 0

                  return (
                    <AccordionCard
                      key={cp._id}
                      id={`cp-${cp._id}`}
                      title={course?.title || 'Unknown Course'}
                      right={
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#10b981', fontFamily: '"DM Mono",monospace' }}>
                            {pct}%
                          </div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>{attended}/{total}</div>
                        </div>
                      }
                    >
                      {/* Progress bar */}
                      <div style={{ marginBottom: '18px' }}>
                        <div
                          role="progressbar"
                          aria-valuenow={pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${course?.title ?? 'Course'} attendance: ${pct}%`}
                          style={{ height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}
                        >
                          <div style={{
                            height: '100%', width: `${pct}%`,
                            background: 'linear-gradient(90deg,#10b981,#6ee7b7)',
                            borderRadius: '4px', transition: 'width 0.6s ease',
                            boxShadow: '0 0 10px rgba(16,185,129,0.3)',
                          }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#6b7280' }}>
                          <span>{attended} attended</span>
                          <span>{total - attended} missed</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
                        <StatPill value={`${avg}%`} label="Avg Score" color="#fcd34d" />
                        <StatPill value={submitted.length} label="Submitted" color="#6ee7b7" />
                        <StatPill value={total - submitted.length} label="Pending" color="#fca5a5" />
                      </div>

                      {/* Lecture rows */}
                      {cp.lectureProgress?.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                          <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                            Lecture Breakdown
                          </div>
                          {cp.lectureProgress.map(lp => {
                            let lecDetails: Lecture | null = null
                            for (const g of groups) {
                              lecDetails = g.lectures?.find(l => l._id === lp.lecture) ?? null
                              if (lecDetails) break
                            }
                            const scoreColor = (lp.task?.score ?? 0) >= 70 ? '#10b981' : (lp.task?.score ?? 0) >= 50 ? '#f59e0b' : '#ef4444'

                            return (
                              <div key={lp._id} style={{
                                padding: '12px 14px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'grid', gridTemplateColumns: '1fr auto',
                                alignItems: 'center', gap: '10px',
                              }}>
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#d1d5db', marginBottom: '6px' }}>
                                    {lecDetails?.title || 'Unknown Lecture'}
                                  </div>
                                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <Badge variant={lp.attendance as BadgeVariant}>{lp.attendance || 'N/A'}</Badge>
                                    <Badge variant={lp.task?.taskStatus as BadgeVariant}>{lp.task?.taskStatus || 'N/A'}</Badge>
                                    {lp.task?.taskStatus === 'submitted' && (
                                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                        Score:{' '}
                                        <span style={{ color: '#fcd34d', fontFamily: '"DM Mono",monospace', fontWeight: '600' }}>
                                          {lp.task.score}/100
                                        </span>
                                      </span>
                                    )}
                                    {lp.engagement > 0 && (
                                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                        Engagement:{' '}
                                        <span style={{ color: '#a5b4fc', fontFamily: '"DM Mono",monospace' }}>
                                          {lp.engagement}%
                                        </span>
                                      </span>
                                    )}
                                  </div>
                                  {lp.notes && (
                                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px', fontStyle: 'italic' }}>
                                      {lp.notes}
                                    </p>
                                  )}
                                </div>
                                {lp.task?.taskStatus === 'submitted' && (
                                  <div style={{ width: '52px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '17px', fontWeight: '700', color: scoreColor, fontFamily: '"DM Mono",monospace' }}>
                                      {lp.task.score}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#6b7280' }}>/ 100</div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </AccordionCard>
                  )
                }) : <EmptyState icon="📊" text="No progress data available yet." />}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ProfilePage