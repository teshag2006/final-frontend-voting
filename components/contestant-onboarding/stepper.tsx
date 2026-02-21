'use client';

export function OnboardingStepper({
  steps,
  activeStep,
}: {
  steps: string[];
  activeStep: number;
}) {
  return (
    <ol className="grid gap-2 sm:grid-cols-4">
      {steps.map((step, index) => {
        const active = index === activeStep;
        const done = index < activeStep;
        return (
          <li
            key={step}
            className={`rounded-lg border px-3 py-2 text-sm ${
              active
                ? 'border-blue-400 bg-blue-50 text-blue-900'
                : done
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <span className="mr-2 font-semibold">{index + 1}.</span>
            {step}
          </li>
        );
      })}
    </ol>
  );
}
