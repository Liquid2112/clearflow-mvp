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
        <span className="text-6xl font-black leading-none tracking-tight" style={{ color: colors.text }}>
          {letter}
        </span>
        <span className="mt-1 text-sm font-semibold text-brand-900/70 tabular-nums">
          {score}<span className="text-brand-600/50 font-medium">/100</span>
        </span>
      </div>
    </div>
  );
}

export default function WaterGradeCard({ grade, systemName }: Props) {
  // Honest "cannot grade" state — never fabricate a score.
  if (!grade.gradable) {
    return (
      <div className="rounded-2xl border border-brand-100 bg-white shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-[176px] h-[176px] flex-shrink-0">
            <div className="absolute inset-0 rounded-full border-[14px] border-dashed border-brand-100" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-brand-300">?</span>
              <span className="mt-1 text-xs font-semibold text-brand-600/60">No grade</span>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600/60 mb-1">Your water grade</p>
            <h2 className="text-xl font-bold text-brand-900 mb-2">Not enough public data to grade</h2>
            <p className="text-sm text-brand-700/70 leading-relaxed">
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
    <div className="rounded-2xl border border-brand-100 bg-white shadow-sm overflow-hidden">
      {/* Header strip in the grade-state color */}
      <div className="flex items-center justify-between px-6 py-3" style={{ backgroundColor: colors.soft }}>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.text }}>
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
              <p className="text-sm font-semibold text-brand-900 mb-4 truncate">{systemName}</p>
            )}

            <div className="space-y-3">
              {SUB_META.map(({ key, label }) => {
                const v = grade.subScores[key];
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-brand-700/80">{label}</span>
                      <span className="text-xs font-semibold text-brand-900/70 tabular-nums">{v}</span>
                    </div>
                    <div className="h-2 rounded-full bg-brand-50 overflow-hidden">
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
          <div className="mt-6 pt-5 border-t border-brand-100">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600/60 mb-2.5">
              What is moving your grade
            </p>
            <ul className="space-y-1.5">
              {grade.drivers.map((d, i) => (
                <li key={i} className="flex gap-2 text-sm text-brand-800/85">
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
