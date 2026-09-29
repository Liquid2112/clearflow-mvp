'use client';

import type { WaterGrade, SubScores } from '@/lib/grade';

interface Props {
  grade: WaterGrade;
  /** Optional label under the system name, e.g. the water system name. */
  systemName?: string | null;
}

// Grade-state palette for the ring. Green (good) / amber (fair) / red (poor).
function stateColors(score: number): { ring: string; soft: string; text: string; label: string } {
  if (score >= 80) return { ring: '#10b981', soft: '#d1fae5', text: '#047857', label: 'Looking good' };
  if (score >= 70) return { ring: '#22c55e', soft: '#dcfce7', text: '#15803d', label: 'Solid' };
  if (score >= 60) return { ring: '#f59e0b', soft: '#fef3c7', text: '#b45309', label: 'Room to improve' };
  return { ring: '#ef4444', soft: '#fee2e2', text: '#b91c1c', label: 'Needs attention' };
}

const SUB_META: Array<{ key: keyof SubScores; label: string }> = [
  { key: 'contaminants', label: 'Contaminants' },
  { key: 'disinfection', label: 'Chlorine & byproducts' },
  { key: 'hardness', label: 'Hardness / scale' },
  { key: 'compliance', label: 'Utility record' },
];

function barColor(v: number): string {
  if (v >= 80) return '#10b981';
  if (v >= 60) return '#f59e0b';
  return '#ef4444';
}

function RadialGauge({ score, letter }: { score: number; letter: string }) {
  const size = 176;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = circumference * pct;
  const colors = stateColors(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`Water grade ${letter}, score ${score} out of 100`}>
        <defs>
          <linearGradient id="grade-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.ring} />
            <stop offset="100%" stopColor={colors.ring} stopOpacity="0.65" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eef2f5" strokeWidth={stroke} />
        {/* Progress */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="url(#grade-ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{ transition: 'stroke-dasharray 900ms cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      {/* Center readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-6xl font-bold leading-none tracking-tight" style={{ color: colors.text }}>
          {letter}
        </span>
        <span className="mt-1 text-sm font-semibold text-ink-600 tabular-nums">
          {score}<span className="font-medium text-ink-400">/100</span>
        </span>
      </div>
    </div>
  );
}

export default function WaterGradeCard({ grade, systemName }: Props) {
  // Honest "cannot grade" state — never fabricate a score.
  if (!grade.gradable) {
    return (
      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
        <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-8">
          <div className="relative h-[176px] w-[176px] flex-shrink-0">
            <div className="absolute inset-0 rounded-full border-[14px] border-dashed border-ink-100" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-5xl font-bold text-ink-300">?</span>
              <span className="mt-1 text-xs font-semibold text-ink-400">No grade</span>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="eyebrow mb-1">Your water grade</p>
            <h2 className="mb-2 text-xl text-ink-900">Not enough public data to grade</h2>
            <p className="text-sm leading-relaxed text-ink-500">
              We matched your address, but there is not enough published compliance data for this
              system to compute a reliable grade yet. A certified home water test is the most direct
              way to see what is actually at your tap.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const colors = stateColors(grade.score);

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
      {/* Header strip in the grade-state color */}
      <div className="flex items-center justify-between px-6 py-3" style={{ backgroundColor: colors.soft }}>
        <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: colors.text }}>
          Your water grade
        </p>
        <span className="text-xs font-semibold" style={{ color: colors.text }}>
          {colors.label}
        </span>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* Ring */}
          <div className="flex-shrink-0">
            <RadialGauge score={grade.score} letter={grade.letter} />
          </div>

          {/* Sub-scores + drivers */}
          <div className="flex-1 w-full min-w-0">
            {systemName && (
              <p className="mb-4 truncate text-sm font-semibold text-ink-800">{systemName}</p>
            )}

            <div className="space-y-3">
              {SUB_META.map(({ key, label }) => {
                const v = grade.subScores[key];
                return (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-ink-500">{label}</span>
                      <span className="text-xs font-semibold text-ink-700 tabular-nums">{v}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(3, v)}%`,
                          backgroundColor: barColor(v),
                          transition: 'width 800ms cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drivers */}
        {grade.drivers.length > 0 && (
          <div className="mt-6 border-t border-ink-100 pt-5">
            <p className="eyebrow mb-2.5 text-ink-400">What is moving your grade</p>
            <ul className="space-y-1.5">
              {grade.drivers.map((d, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink-700">
                  <span
                    className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: colors.ring }}
                  />
                  <span className="leading-snug">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
