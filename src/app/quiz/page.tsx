'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserCheck } from '@/lib/db';
import { generateRecommendation, QuizAnswers } from '@/lib/recommendations';
import { createRecommendation } from '@/lib/db';
import { fetchComplianceData } from '@/lib/epa';
import { computeWaterGrade } from '@/lib/grade';

const QUESTIONS = [
  {
    id: 'primary_goal',
    title: 'What matters most to you about your water?',
    help: 'Pick the concern that is top of mind. It shapes everything downstream.',
    options: [
      { value: 'Taste/odor', label: 'Taste or odor' },
      { value: 'Reducing chlorine', label: 'Reducing chlorine' },
      { value: 'Hardness/minerals', label: 'Hardness or minerals' },
      { value: 'Lead concern', label: 'Lead concern' },
      { value: 'Skin/hair', label: 'Skin or hair' },
      { value: 'Appliance scale', label: 'Appliance scale' },
      { value: 'General peace of mind', label: 'General peace of mind' },
      { value: 'Other/not sure', label: 'Other / not sure' },
    ],
  },
  {
    id: 'housing',
    title: 'Do you own or rent your home?',
    help: 'Renters usually want non-permanent options. We factor this in.',
    options: [
      { value: 'Own', label: 'Own' },
      { value: 'Rent', label: 'Rent' },
      { value: 'Other', label: 'Other' },
    ],
  },
  {
    id: 'scope',
    title: 'Which water are you thinking about treating?',
    help: null,
    options: [
      { value: 'Drinking water only', label: 'Drinking water only' },
      { value: 'Whole-home', label: 'Whole-home' },
      { value: 'Not sure', label: 'Not sure' },
    ],
  },
  {
    id: 'household_size',
    title: 'How many people live in your household?',
    help: null,
    options: [
      { value: '1-2', label: '1–2 people' },
      { value: '3-4', label: '3–4 people' },
      { value: '5+', label: '5 or more' },
      { value: 'Not sure', label: 'Not sure' },
    ],
  },
  {
    id: 'budget',
    title: 'What is your rough budget?',
    help: 'A ballpark is fine — this is a starting point, not a quote.',
    options: [
      { value: 'Under $100', label: 'Under $100' },
      { value: '$100-$300', label: '$100–$300' },
      { value: '$300-$800', label: '$300–$800' },
      { value: '$800+', label: '$800 or more' },
      { value: 'Not sure', label: 'Not sure' },
    ],
  },
  {
    id: 'install_willing',
    title: 'Are you willing to install equipment under the kitchen sink?',
    help: null,
    options: [
      { value: 'Yes', label: 'Yes' },
      { value: 'No', label: 'No' },
      { value: 'Not sure', label: 'Not sure' },
    ],
  },
  {
    id: 'test_confirmation',
    title: 'Want to confirm with a home test before buying treatment?',
    help: 'Testing first can save you from buying equipment you may not need.',
    options: [
      { value: 'Yes', label: 'Yes — test first' },
      { value: 'No', label: 'No — I am comfortable acting on public data' },
      { value: 'Not sure', label: 'Not sure' },
    ],
  },
];

export default function QuizPage() {
  const router = useRouter();
  const [checkId, setCheckId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('checkId');
    if (q) setCheckId(q);
  }, []);

  const question = QUESTIONS[currentQuestion];
  const total = QUESTIONS.length;
  const selected = answers[question.id] || '';
  const isComplete = Object.keys(answers).length === total;
  const isLast = currentQuestion === total - 1;

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    // Auto-advance on selection (except the final question) for a guided feel.
    if (!isLast) {
      window.setTimeout(() => setCurrentQuestion((c) => Math.min(c + 1, total - 1)), 220);
    }
  };

  const handleNext = () => {
    if (currentQuestion < total - 1) setCurrentQuestion((c) => c + 1);
  };
  const handleBack = () => {
    if (currentQuestion > 0) setCurrentQuestion((c) => c - 1);
  };

  const handleSeeRecommendation = () => {
    if (!checkId || !isComplete) return;

    const check = getUserCheck(checkId);
    if (!check) {
      router.push('/check-water');
      return;
    }
    setSubmitting(true);

    const compliance = check.pwsid ? fetchComplianceData(check.pwsid) : null;
    const grade = computeWaterGrade(compliance);

    const answersTyped = answers as unknown as QuizAnswers;
    const rec = generateRecommendation(check.waterSystem, answersTyped, compliance);

    const recommendation = createRecommendation({
      checkId,
      treatment_category: rec.treatment_category,
      rationale: rec.rationale,
      public_data_limitations: rec.public_data_limitations,
      home_test_recommended: rec.home_test_recommended,
      estimated_cost_range: rec.estimated_cost_range,
      test_kit_suggested: rec.test_kit_suggested,
      grade: {
        score: grade.score,
        letter: grade.letter,
        drivers: grade.drivers,
        gradable: grade.gradable,
      },
    });

    router.push(`/plan?recommendationId=${encodeURIComponent(recommendation.id)}`);
  };

  const progress = ((currentQuestion + 1) / total) * 100;

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      {checkId && (
        <Link
          href={`/results?checkId=${checkId}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 no-underline transition-colors hover:text-brand-700"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to results
        </Link>
      )}

      {/* Progress */}
      <div className="mt-6 mb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-800">Question {currentQuestion + 1} of {total}</span>
          <span className="text-sm text-ink-400">{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="surface-card p-6 sm:p-8">
        {/* Step dots */}
        <div className="mb-6 flex justify-center gap-1.5">
          {QUESTIONS.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestion(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentQuestion ? 'w-6 bg-brand-600' : answers[q.id] ? 'w-2 bg-brand-300' : 'w-2 bg-ink-200'
              }`}
              aria-label={`Go to question ${i + 1}${answers[q.id] ? ' (answered)' : ''}`}
            />
          ))}
        </div>

        {/* Animated question block — keyed so it re-mounts (and re-animates) per question. */}
        <div key={currentQuestion} className="animate-fade-up">
          <h1 className="text-2xl leading-snug text-ink-900">{question.title}</h1>
          {question.help && <p className="mt-2 text-sm text-ink-500">{question.help}</p>}

          <fieldset className="mt-6 space-y-2.5">
            <legend className="sr-only">{question.title}</legend>
            {question.options.map((opt) => {
              const isSelected = selected === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  aria-pressed={isSelected}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50 text-ink-900 shadow-ring'
                      : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:bg-brand-50/40'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      isSelected ? 'border-brand-600 bg-brand-600' : 'border-ink-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className={isSelected ? 'font-semibold' : 'font-medium'}>{opt.label}</span>
                </button>
              );
            })}
          </fieldset>
        </div>
      </div>

      {/* Nav */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentQuestion === 0}
          className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 font-semibold transition-colors ${
            currentQuestion === 0 ? 'cursor-not-allowed text-ink-300' : 'text-ink-700 hover:bg-ink-100'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {!isLast ? (
          <button
            onClick={handleNext}
            disabled={!selected}
            className={`inline-flex items-center gap-1.5 rounded-xl px-6 py-2.5 font-semibold transition-all ${
              selected ? 'bg-ink-900 text-white hover:bg-ink-800 active:translate-y-px' : 'cursor-not-allowed bg-ink-100 text-ink-400'
            }`}
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSeeRecommendation}
            disabled={!isComplete || submitting}
            className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 font-semibold transition-all ${
              isComplete && !submitting ? 'bg-brand-600 text-white hover:bg-brand-700 active:translate-y-px' : 'cursor-not-allowed bg-ink-100 text-ink-400'
            }`}
          >
            {submitting ? 'Building your plan…' : 'See my recommendation'}
            {!submitting && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        )}
      </div>

      <p className="mx-auto mt-8 max-w-md text-center text-xs leading-relaxed text-ink-400">
        Your answers only shape your recommendation. ClearFlow uses a deterministic rules engine — no AI
        decides your treatment path.
      </p>
    </div>
  );
}
