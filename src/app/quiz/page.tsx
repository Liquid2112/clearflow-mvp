'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserCheck } from '@/lib/db';
import { generateRecommendation, QuizAnswers } from '@/lib/recommendations';
import { createRecommendation, getUserRecommendation } from '@/lib/db';

const QUESTIONS = [
  {
    id: 'primary_goal',
    title: 'What matters most to you about your water?',
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
    title: 'Do you own or rent?',
    options: [
      { value: 'Own', label: 'Own' },
      { value: 'Rent', label: 'Rent' },
      { value: 'Other', label: 'Other' },
    ],
  },
  {
    id: 'scope',
    title: 'Which water are you thinking about treating?',
    options: [
      { value: 'Drinking water only', label: 'Drinking water only' },
      { value: 'Whole-home', label: 'Whole-home' },
      { value: 'Not sure', label: 'Not sure' },
    ],
  },
  {
    id: 'household_size',
    title: 'How many people live in your household?',
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
    options: [
      { value: 'Yes', label: 'Yes' },
      { value: 'No', label: 'No' },
      { value: 'Not sure', label: 'Not sure' },
    ],
  },
  {
    id: 'test_confirmation',
    title: 'Would you like to confirm with a home test before purchasing treatment?',
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

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('checkId');
    if (q) {
      setCheckId(q);
      // Sync URL if different
      const current = new URLSearchParams(window.location.search).get('checkId');
      if (current !== q) {
        const p = new URLSearchParams(window.location.search);
        p.set('checkId', q);
        window.history.replaceState({}, '', `${window.location.pathname}?${p.toString()}`);
      }
    }
  }, []);

  const question = QUESTIONS[currentQuestion];
  const total = QUESTIONS.length;
  const selected = answers[question.id] || '';
  const isComplete = Object.keys(answers).length === total;

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < total - 1) setCurrentQuestion((c) => c + 1);
  };

  const handleBack = () => {
    if (currentQuestion > 0) setCurrentQuestion((c) => c - 1);
  };

  const handleSeeRecommendation = async () => {
    if (!checkId || !isComplete) return;

    const check = getUserCheck(checkId);
    if (!check) {
      alert('Check not found. Please start over.');
      return;
    }

    const answersTyped = answers as unknown as QuizAnswers;
    const rec = generateRecommendation(check.waterSystem, answersTyped, null);

    const recommendation = createRecommendation({
      checkId,
      treatment_category: rec.treatment_category,
      rationale: rec.rationale,
      public_data_limitations: rec.public_data_limitations,
      home_test_recommended: rec.home_test_recommended,
      estimated_cost_range: rec.estimated_cost_range,
      test_kit_suggested: rec.test_kit_suggested,
    });

    const p = new URLSearchParams(window.location.search);
    p.set('recommendationId', recommendation.id);
    window.location.search = p.toString();
  };

  const progress = ((currentQuestion + 1) / total) * 100;

  return (
    <div className="max-w-xl mx-auto py-8">
      {checkId && (
        <a
          href={`/results?checkId=${checkId}`}
          className="inline-flex items-center gap-1.5 text-brand-900 hover:text-brand-600 transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to results
        </a>
      )}

      <div className="mb-10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-brand-900">Question {currentQuestion + 1} of {total}</span>
          <span className="text-sm text-brand-600/70">{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full h-2 bg-brand-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-brand-100 shadow-sm p-6 sm:p-8">
        <div className="flex gap-1.5 mb-6 justify-center">
          {QUESTIONS.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestion(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentQuestion ? 'bg-brand-600 w-5' : answers[q.id] ? 'bg-brand-400' : 'bg-brand-200'
              }`}
              aria-label={`Go to question ${i + 1}`}
            />
          ))}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-brand-900 mb-6 leading-snug">
          {question.title}
        </h2>

        <div className="space-y-2.5">
          {question.options.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50 text-brand-900'
                    : 'border-brand-200 bg-white hover:border-brand-300 hover:bg-brand-50/50 text-ink'
                }`}
              >
                <span
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-brand-600 bg-brand-600' : 'border-brand-300 bg-white'
                  }`}
                >
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className={`font-medium ${isSelected ? 'font-bold' : 'font-normal'}`}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentQuestion === 0}
          className={`py-2.5 px-5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            currentQuestion === 0 ? 'text-brand-300 cursor-not-allowed' : 'text-brand-900 hover:bg-brand-50'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {currentQuestion < total - 1 ? (
          <button
            onClick={handleNext}
            disabled={!selected}
            className={`py-2.5 px-6 rounded-lg font-semibold transition-colors ${
              selected ? 'bg-brand-900 hover:bg-brand-800 text-white' : 'bg-brand-200 text-brand-400 cursor-not-allowed'
            }`}
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSeeRecommendation}
            disabled={!isComplete}
            className={`py-2.5 px-6 rounded-lg font-semibold transition-colors ${
              isComplete ? 'bg-brand-900 hover:bg-brand-800 text-white' : 'bg-brand-200 text-brand-400 cursor-not-allowed'
            }`}
          >
            See my recommendation
          </button>
        )}
      </div>

      <p className="mt-8 text-xs text-brand-600/60 text-center leading-relaxed">
        Your answers are used only to shape your recommendation. ClearFlow uses a deterministic rules engine — no AI decides your treatment path.
      </p>
    </div>
  );
}
