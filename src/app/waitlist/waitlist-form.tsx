"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { COUNTRY_OPTIONS } from "@/lib/waitlist/countries";
import {
  SPECIALTY_OPTIONS,
  SURVEY_QUESTIONS,
  type SurveyQuestion,
} from "@/lib/waitlist/questions";

const ENGLISH_TESTS = ["OET", "IELTS", "PTE"] as const;
const VISA_OPTIONS = ["Student", "Tourist", "PR", "Citizen", "Other"] as const;

type Details = {
  fullLegalName: string;
  preferredName: string;
  dateOfBirth: string;
  nationality: string;
  degreeCountry: string;
  degreeInstitution: string;
  email: string;
  phone: string;
  cityCountry: string;
  linkedIn: string;
  ahpraNumber: string;
  amcCandidateNumber: string;
  englishTestType: string;
  englishTestScore: string;
  englishTestExpiry: string;
  visaStatus: string;
  preferredSpecialties: string[];
  preferredStart: string;
  additionalNotes: string;
};

const emptyDetails = (): Details => ({
  fullLegalName: "",
  preferredName: "",
  dateOfBirth: "",
  nationality: "",
  degreeCountry: "",
  degreeInstitution: "",
  email: "",
  phone: "",
  cityCountry: "",
  linkedIn: "",
  ahpraNumber: "",
  amcCandidateNumber: "",
  englishTestType: "",
  englishTestScore: "",
  englishTestExpiry: "",
  visaStatus: "",
  preferredSpecialties: [],
  preferredStart: "",
  additionalNotes: "",
});

export default function WaitlistForm() {
  const [step, setStep] = useState(0);
  const [survey, setSurvey] = useState<Record<string, string | string[]>>({});
  const [details, setDetails] = useState<Details>(() => emptyDetails());
  const [cv, setCv] = useState<File | null>(null);
  const [degreeCert, setDegreeCert] = useState<File | null>(null);
  const [otherDoc, setOtherDoc] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const surveySteps = SURVEY_QUESTIONS.length;
  const lastStepIndex = surveySteps; // details step

  const currentQuestion = SURVEY_QUESTIONS[step];

  const setDetail = useCallback(<K extends keyof Details>(key: K, value: Details[K]) => {
    setDetails((d) => ({ ...d, [key]: value }));
  }, []);

  const toggleSpecialtyPref = useCallback((label: string) => {
    setDetails((d) => {
      const set = new Set(d.preferredSpecialties);
      if (set.has(label)) set.delete(label);
      else set.add(label);
      return { ...d, preferredSpecialties: [...set] };
    });
  }, []);

  const toggleSurveyMulti = useCallback((q: SurveyQuestion, option: string) => {
    setSurvey((prev) => {
      const raw = prev[q.id];
      const cur = Array.isArray(raw) ? [...raw] : [];
      const max = q.maxSelections ?? 99;
      const idx = cur.indexOf(option);
      if (idx >= 0) {
        cur.splice(idx, 1);
      } else if (cur.length < max) {
        cur.push(option);
      }
      return { ...prev, [q.id]: cur };
    });
  }, []);

  const canProceedSurvey = useMemo(() => {
    if (!currentQuestion) return false;
    const v = survey[currentQuestion.id];
    if (currentQuestion.kind === "single") {
      return typeof v === "string" && v.length > 0;
    }
    return Array.isArray(v) && v.length > 0;
  }, [currentQuestion, survey]);

  const validateDetails = (): string | null => {
    if (!details.fullLegalName.trim()) return "Full legal name is required.";
    if (!details.dateOfBirth) return "Date of birth is required.";
    if (!details.nationality) return "Nationality / citizenship is required.";
    if (!details.degreeCountry) return "Country where medical degree was obtained is required.";
    if (!details.degreeInstitution.trim()) return "Medical degree & institution is required.";
    if (!details.email.trim()) return "Email is required.";
    if (!details.phone.trim()) return "Phone number is required.";
    if (!details.cityCountry.trim()) return "Current city & country is required.";
    if (details.preferredSpecialties.length === 0)
      return "Select at least one preferred specialty / department.";
    if (!details.preferredStart) return "Preferred start date is required.";
    if (details.additionalNotes.length > 300)
      return "Additional notes must be 300 characters or less.";
    return null;
  };

  const mergeSpecialtiesFromSurvey = useCallback(() => {
    const fromSurvey = survey.specialties;
    if (Array.isArray(fromSurvey) && fromSurvey.length > 0) {
      setDetails((d) => ({
        ...d,
        preferredSpecialties: [...new Set([...d.preferredSpecialties, ...fromSurvey])],
      }));
    }
  }, [survey]);

  const goNext = () => {
    setError(null);
    if (step < surveySteps - 1) {
      setStep((s) => s + 1);
      return;
    }
    if (step === surveySteps - 1) {
      mergeSpecialtiesFromSurvey();
      setStep(surveySteps);
      return;
    }
  };

  const goBack = () => {
    setError(null);
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    const v = validateDetails();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append(
        "json",
        JSON.stringify({
          survey,
          details: {
            ...details,
            additionalNotes: details.additionalNotes.trim(),
          },
          submittedAt: new Date().toISOString(),
        })
      );
      if (cv) fd.append("cv", cv);
      if (degreeCert) fd.append("degreeCertificate", degreeCert);
      if (otherDoc) fd.append("otherDocument", otherDoc);

      const res = await fetch("/api/waitlist", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Request failed");
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again or email admin@vitalrounds.com.au.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-lg font-semibold text-[#2c3d2f]">You&apos;re on the list.</p>
        <p className="mt-3 text-sm leading-7 text-[#6e706e]">
          Thanks for completing the wait list form. Our team will be in touch when positions
          open that match your profile.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-[#759d7b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5f7362]"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5fbf6] text-[#2c3d2f]">
      <header className="border-b border-[#d5e9d9] bg-[#f5fbf6]/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/short-logo.png" alt="" width={36} height={36} className="h-9 w-9" />
            <span className="text-sm font-semibold text-[#354a38]">VitalRounds</span>
          </Link>
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#6e706e]">
            Wait list
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-10">
        {step < surveySteps && currentQuestion && (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold uppercase tracking-[0.08em] text-violet-600">
                Question {currentQuestion.questionNumber}
              </span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${
                  currentQuestion.kind === "multi" ? "bg-[#5f7362]" : "bg-[#354a38]"
                }`}
              >
                {currentQuestion.kind === "multi" ? "Multi choice" : "Single choice"}
              </span>
            </div>
            <p className="text-xl font-semibold leading-snug text-[#2c3d2f] md:text-2xl">
              {currentQuestion.prompt}
            </p>
            {currentQuestion.helper && (
              <p className="mt-3 text-sm italic text-[#6e706e]">{currentQuestion.helper}</p>
            )}

            <div className="mt-8 flex flex-wrap gap-2">
              {currentQuestion.kind === "single" &&
                currentQuestion.options.map((opt) => {
                  const selected = survey[currentQuestion.id] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setSurvey((s) => ({ ...s, [currentQuestion.id]: opt }))
                      }
                      className={`rounded-full border px-4 py-2.5 text-left text-sm transition ${
                        selected
                          ? "border-[#759d7b] bg-[#cbecd0] text-[#2c3d2f]"
                          : "border-neutral-300 bg-[#faf9f6] text-[#354a38] hover:border-[#a6ccac]"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              {currentQuestion.kind === "multi" &&
                currentQuestion.options.map((opt) => {
                  const sel = survey[currentQuestion.id];
                  const arr = Array.isArray(sel) ? sel : [];
                  const selected = arr.includes(opt);
                  const maxed =
                    !!currentQuestion.maxSelections &&
                    arr.length >= currentQuestion.maxSelections &&
                    !selected;
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={maxed}
                      onClick={() => toggleSurveyMulti(currentQuestion, opt)}
                      className={`rounded-full border px-4 py-2.5 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        selected
                          ? "border-[#759d7b] bg-[#cbecd0] text-[#2c3d2f]"
                          : "border-dashed border-neutral-400 bg-[#faf9f6] text-[#354a38] hover:border-[#a6ccac]"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
            </div>

            <p className="mt-10 text-xs text-[#6e706e]">
              Step {step + 1} of {surveySteps}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-full border border-[#759d7b] px-6 py-2.5 text-sm font-semibold text-[#354a38] hover:bg-[#cbecd0]"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                disabled={!canProceedSurvey}
                onClick={goNext}
                className="rounded-full bg-[#759d7b] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5f7362] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === lastStepIndex && (
          <div className="space-y-12">
            <div>
              <h1 className="text-2xl font-semibold text-[#2c3d2f]">Your details</h1>
              <p className="mt-2 text-sm text-[#6e706e]">
                Pre-filled answers from the survey can be edited below.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#6e706e]">
                Identity
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Full legal name"
                  required
                  hint="as it appears on passport"
                  value={details.fullLegalName}
                  onChange={(v) => setDetail("fullLegalName", v)}
                />
                <Field
                  label="Preferred name"
                  hint="what we should use in emails"
                  value={details.preferredName}
                  onChange={(v) => setDetail("preferredName", v)}
                />
                <Field
                  label="Date of birth"
                  required
                  type="date"
                  value={details.dateOfBirth}
                  onChange={(v) => setDetail("dateOfBirth", v)}
                />
                <SelectField
                  label="Nationality / country of citizenship"
                  required
                  value={details.nationality}
                  onChange={(v) => setDetail("nationality", v)}
                  options={COUNTRY_OPTIONS}
                  placeholderOption="Select country"
                />
                <SelectField
                  label="Country where medical degree was obtained"
                  required
                  value={details.degreeCountry}
                  onChange={(v) => setDetail("degreeCountry", v)}
                  options={COUNTRY_OPTIONS}
                  placeholderOption="Select country"
                />
                <Field
                  label="Medical degree & awarding institution"
                  required
                  value={details.degreeInstitution}
                  onChange={(v) => setDetail("degreeInstitution", v)}
                />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#6e706e]">
                Contact
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Email address"
                  required
                  hint="we will validate this"
                  type="email"
                  value={details.email}
                  onChange={(v) => setDetail("email", v)}
                />
                <Field
                  label="Phone number"
                  required
                  hint="international format with country code"
                  value={details.phone}
                  onChange={(v) => setDetail("phone", v)}
                />
                <Field
                  label="Current city & country"
                  required
                  value={details.cityCountry}
                  onChange={(v) => setDetail("cityCountry", v)}
                />
                <Field
                  label="LinkedIn profile"
                  hint="optional — URL"
                  value={details.linkedIn}
                  onChange={(v) => setDetail("linkedIn", v)}
                />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#6e706e]">
                Registration status
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="AHPRA registration number"
                  hint="if already registered"
                  value={details.ahpraNumber}
                  onChange={(v) => setDetail("ahpraNumber", v)}
                />
                <Field
                  label="AMC candidate number"
                  hint="if applicable"
                  value={details.amcCandidateNumber}
                  onChange={(v) => setDetail("amcCandidateNumber", v)}
                />
                <SelectField
                  label="English test type"
                  value={details.englishTestType}
                  onChange={(v) => setDetail("englishTestType", v)}
                  options={ENGLISH_TESTS}
                  placeholderOption="Optional — select test"
                />
                <Field
                  label="English test score"
                  value={details.englishTestScore}
                  onChange={(v) => setDetail("englishTestScore", v)}
                />
                <Field
                  label="English test expiry date"
                  hint="tests expire"
                  type="date"
                  value={details.englishTestExpiry}
                  onChange={(v) => setDetail("englishTestExpiry", v)}
                />
                <SelectField
                  label="Current visa status (if in Australia)"
                  value={details.visaStatus}
                  onChange={(v) => setDetail("visaStatus", v)}
                  options={VISA_OPTIONS}
                  placeholderOption="Optional — select status"
                />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#6e706e]">
                Preferences (pre-filled from survey — editable)
              </h2>
              <div>
                <p className="mb-2 text-sm font-medium text-[#2c3d2f]">
                  Preferred specialty / department <span className="text-red-600">*</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTY_OPTIONS.map((opt) => {
                    const selected = details.preferredSpecialties.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleSpecialtyPref(opt)}
                        className={`rounded-full border px-3 py-2 text-left text-xs transition ${
                          selected
                            ? "border-[#759d7b] bg-[#cbecd0]"
                            : "border-dashed border-neutral-400 bg-[#faf9f6] hover:border-[#a6ccac]"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Field
                label="Preferred start date"
                required
                hint="month or specific date"
                type="month"
                value={details.preferredStart}
                onChange={(v) => setDetail("preferredStart", v)}
              />
              <div>
                <label className="text-sm font-medium text-[#2c3d2f]">
                  Any additional notes <span className="text-[#6e706e]">(max 300 characters)</span>
                </label>
                <textarea
                  maxLength={300}
                  rows={4}
                  value={details.additionalNotes}
                  onChange={(e) => setDetail("additionalNotes", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#d5dfd6] bg-white px-4 py-3 text-sm text-[#2c3d2f] outline-none ring-[#759d7b]/30 focus:ring-2"
                />
                <p className="mt-1 text-xs text-[#6e706e]">
                  {details.additionalNotes.length}/300
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#6e706e]">
                Documents
              </h2>
              <p className="text-sm text-[#6e706e]">
                Upload PDF or images. You can add more requirements later — we&apos;ll store these
                once backend storage is connected.
              </p>
              <FileRow label="CV / resume" file={cv} onChange={setCv} />
              <FileRow label="Medical degree certificate" file={degreeCert} onChange={setDegreeCert} />
              <FileRow label="Other supporting document" file={otherDoc} onChange={setOtherDoc} />
            </section>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-3 pt-4">
              <button
                type="button"
                onClick={goBack}
                className="rounded-full border border-[#759d7b] px-6 py-2.5 text-sm font-semibold text-[#354a38] hover:bg-[#cbecd0]"
              >
                Back to survey
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="rounded-full bg-[#759d7b] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5f7362] disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit wait list"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#e8ebe8] bg-[#fafcf9] p-4">
      <label className="text-sm font-semibold text-[#2c3d2f]">
        {label}{" "}
        {required && <span className="text-red-600">*</span>}
      </label>
      {hint && <p className="mt-0.5 text-xs text-[#6e706e]">{hint}</p>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-[#d5dfd6] bg-white px-3 py-2 text-sm text-[#2c3d2f] outline-none ring-[#759d7b]/30 focus:ring-2"
      />
    </div>
  );
}

function SelectField({
  label,
  required,
  value,
  onChange,
  options,
  placeholderOption,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholderOption?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e8ebe8] bg-[#fafcf9] p-4">
      <label className="text-sm font-semibold text-[#2c3d2f]">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-[#d5dfd6] bg-white px-3 py-2 text-sm text-[#2c3d2f] outline-none ring-[#759d7b]/30 focus:ring-2"
      >
        {placeholderOption !== undefined && (
          <option value="">{placeholderOption}</option>
        )}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function FileRow({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#e8ebe8] bg-[#fafcf9] p-4">
      <p className="text-sm font-semibold text-[#2c3d2f]">{label}</p>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="mt-2 block w-full text-sm text-[#354a38] file:mr-3 file:rounded-lg file:border-0 file:bg-[#cbecd0] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#354a38]"
      />
      {file && (
        <p className="mt-2 text-xs text-[#6e706e]">
          Selected: {file.name} ({Math.round(file.size / 1024)} KB)
        </p>
      )}
    </div>
  );
}
