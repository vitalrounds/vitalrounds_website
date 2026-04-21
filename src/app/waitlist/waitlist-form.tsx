"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import { COUNTRY_OPTIONS } from "@/lib/waitlist/countries";
import {
  SPECIALTY_OPTIONS,
  SURVEY_QUESTIONS,
  type SurveyQuestion,
} from "@/lib/waitlist/questions";

const ENGLISH_TESTS = ["OET", "IELTS", "PTE"] as const;
const VISA_OPTIONS = ["Student", "Tourist", "PR", "Citizen", "Other"] as const;
const MAX_UPLOAD_MB = 5;

function wordCount(s: string): number {
  const t = s.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

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
  /** Optional; max 500 words */
  personalStatement: string;
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
  personalStatement: "",
});

export default function WaitlistForm() {
  const [step, setStep] = useState(0);
  /** Used with CSS so the next/previous question slides in from the correct side */
  const [slideDir, setSlideDir] = useState<"forward" | "backward">("forward");
  /** Increment on each survey navigation so we skip animation on first paint (step 0). */
  const [surveyMotion, setSurveyMotion] = useState(0);
  const [survey, setSurvey] = useState<Record<string, string | string[]>>({});
  const [details, setDetails] = useState<Details>(() => emptyDetails());
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [degreeCertFile, setDegreeCertFile] = useState<File | null>(null);
  const [amcPart1File, setAmcPart1File] = useState<File | null>(null);
  const [englishTestReportFile, setEnglishTestReportFile] = useState<File | null>(null);
  const [internshipCertFile, setInternshipCertFile] = useState<File | null>(null);
  const [visaFile, setVisaFile] = useState<File | null>(null);
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
    if (!details.visaStatus) return "Current visa status is required.";
    if (!details.preferredStart) return "Preferred start date is required.";
    if (details.additionalNotes.length > 300)
      return "Additional notes must be 300 characters or less.";
    if (wordCount(details.personalStatement) > 500)
      return "Personal statement must be 500 words or less.";
    return null;
  };

  const validateRegistrationUploads = (): string | null => {
    if (!cvFile) return "Please upload your curriculum vitae (CV).";
    if (!degreeCertFile) return "Please upload your medical degree certificate.";
    const check = (f: File | null, label: string) =>
      f && f.size > MAX_UPLOAD_MB * 1024 * 1024 ? `${label} must be ${MAX_UPLOAD_MB}MB or smaller.` : null;
    const errs = [
      check(cvFile, "CV"),
      check(passportFile, "Driving licence / passport"),
      check(degreeCertFile, "Medical degree certificate"),
      check(amcPart1File, "AMC Part 1 document"),
      check(englishTestReportFile, "English test report"),
      check(internshipCertFile, "Internship certificate"),
      check(visaFile, "Visa document"),
    ].filter(Boolean) as string[];
    if (errs.length) return errs[0];
    const cvName = cvFile.name.toLowerCase();
    if (!cvName.endsWith(".pdf"))
      return "CV must be a PDF file.";
    if (passportFile) {
      const passName = passportFile.name.toLowerCase();
      if (
        !passName.endsWith(".pdf") &&
        !passName.endsWith(".jpg") &&
        !passName.endsWith(".jpeg")
      )
        return "Driving licence / passport upload must be PDF or JPG.";
    }
    const degName = degreeCertFile.name.toLowerCase();
    if (!degName.endsWith(".pdf"))
      return "Medical degree certificate must be a PDF.";
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
      setSurveyMotion((n) => n + 1);
      setSlideDir("forward");
      setStep((s) => s + 1);
      return;
    }
    if (step === surveySteps - 1) {
      mergeSpecialtiesFromSurvey();
      setSurveyMotion((n) => n + 1);
      setSlideDir("forward");
      setStep(surveySteps);
      return;
    }
  };

  const goBack = () => {
    setError(null);
    if (step > 0) {
      setSurveyMotion((n) => n + 1);
      setSlideDir("backward");
      setStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    const v = validateDetails();
    if (v) {
      setError(v);
      return;
    }
    const vu = validateRegistrationUploads();
    if (vu) {
      setError(vu);
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
            personalStatement: details.personalStatement.trim(),
          },
          submittedAt: new Date().toISOString(),
        })
      );
      fd.append("cv", cvFile as File);
      if (passportFile) fd.append("passport", passportFile);
      fd.append("degreeCertificate", degreeCertFile as File);
      if (amcPart1File) fd.append("amcPart1", amcPart1File);
      if (englishTestReportFile) fd.append("englishTestReport", englishTestReportFile);
      if (internshipCertFile) fd.append("internshipCertificate", internshipCertFile);
      if (visaFile) fd.append("visa", visaFile);

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
          open that match your profile. We also sent an email to help you set up your account
          password.
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
          <div className="overflow-hidden pb-2">
            <div
              key={step}
              className={
                surveyMotion === 0
                  ? ""
                  : slideDir === "forward"
                    ? "waitlist-q-enter-forward"
                    : "waitlist-q-enter-back"
              }
            >
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold uppercase tracking-[0.08em] text-[#759d7b]">
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
              <p className="text-xl font-semibold leading-snug text-[#354a38] md:text-2xl">
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
                        className={`cursor-pointer rounded-full border px-4 py-2.5 text-left text-sm transition-all duration-200 active:scale-[0.99] ${
                          selected
                            ? "border-[#759d7b] bg-[#cbecd0] text-[#2c3d2f] shadow-sm"
                            : "border-neutral-300 bg-[#faf9f6] text-[#354a38] hover:border-[#759d7b] hover:bg-[#eef5f0] hover:shadow-md"
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
                        className={`cursor-pointer rounded-full border px-4 py-2.5 text-left text-sm transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 ${
                          selected
                            ? "border-[#759d7b] bg-[#cbecd0] text-[#2c3d2f] shadow-sm"
                            : "border-dashed border-neutral-400 bg-[#faf9f6] text-[#354a38] hover:border-[#759d7b] hover:bg-[#eef5f0] hover:shadow-md"
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
                    className="rounded-full border border-[#759d7b] px-6 py-2.5 text-sm font-semibold text-[#354a38] transition hover:bg-[#cbecd0]"
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
            </div>
          </div>
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
                  required
                  value={details.visaStatus}
                  onChange={(v) => setDetail("visaStatus", v)}
                  options={VISA_OPTIONS}
                  placeholderOption="Select visa status"
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
                <p className="mb-3 text-xs text-[#6e706e]">Multi-select — from survey</p>
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
              <DatePickerField
                label="Preferred start date"
                required
                hint="Select your preferred start date"
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
                Required at registration
              </h2>
              <DocumentUploadCard
                abbr="CV"
                abbrClassName="bg-sky-100 text-sky-900"
                title="Curriculum vitae (CV)"
                description="Medical CV including education, clinical experience, and any research or publications. PDF only, max 5MB."
                status="required"
                accept=".pdf,application/pdf"
                file={cvFile}
                onChange={setCvFile}
              />
              <DocumentUploadCard
                abbr="ID"
                abbrClassName="bg-violet-100 text-violet-900"
                title="Driving licence or passport"
                description="Optional identity document. Upload either your driving licence or passport (photo page). PDF or JPG, max 5MB."
                status="applicable"
                accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
                file={passportFile}
                onChange={setPassportFile}
              />
              <DocumentUploadCard
                abbr="MB"
                abbrClassName="bg-emerald-100 text-emerald-900"
                title="Medical degree certificate"
                description="Official copy of your primary medical qualification (MBBS, MBChB, MD etc.). PDF only, max 5MB."
                status="required"
                accept=".pdf,application/pdf"
                file={degreeCertFile}
                onChange={setDegreeCertFile}
              />
            </section>

            <section className="space-y-4 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#6e706e]">
                Upload if available
              </h2>
              <DocumentUploadCard
                abbr="AM"
                abbrClassName="bg-teal-100 text-teal-900"
                title="AMC Part 1 result letter"
                description="Official result letter or certificate from the Australian Medical Council."
                status="applicable"
                accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
                file={amcPart1File}
                onChange={setAmcPart1File}
              />
              <DocumentUploadCard
                abbr="EN"
                abbrClassName="bg-orange-100 text-orange-900"
                title="English language test result"
                description="OET, IELTS Academic, or PTE Academic score report. Must be within validity period."
                status="applicable"
                accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
                file={englishTestReportFile}
                onChange={setEnglishTestReportFile}
              />
              <div className="rounded-2xl border border-[#e8ebe8] bg-[#faf8f5] p-4">
                <div className="flex gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-900"
                    aria-hidden
                  >
                    PS
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-semibold text-[#2c3d2f]">Personal statement</p>
                      <span className="shrink-0 rounded-full bg-[#eef1ee] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#5f7362]">
                        Strongly encouraged
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#6e706e]">
                      A brief statement (max 500 words) on your goals and what you hope to gain from the
                      observership. Helps with hospital matching.
                    </p>
                    <textarea
                      rows={6}
                      value={details.personalStatement}
                      onChange={(e) => setDetail("personalStatement", e.target.value)}
                      placeholder="Write here…"
                      className="mt-3 w-full rounded-xl border border-[#d5dfd6] bg-white px-3 py-2 text-sm text-[#2c3d2f] outline-none ring-[#759d7b]/30 placeholder:text-neutral-400 focus:ring-2"
                    />
                    <p className="mt-2 text-xs text-[#6e706e]">
                      {wordCount(details.personalStatement)} / 500 words
                    </p>
                  </div>
                </div>
              </div>
              <DocumentUploadCard
                abbr="IN"
                abbrClassName="bg-zinc-200 text-zinc-800"
                title="Internship / training completion certificate"
                description="Evidence of post-graduate clinical training from your home country."
                status="applicable"
                accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
                file={internshipCertFile}
                onChange={setInternshipCertFile}
              />
              <DocumentUploadCard
                abbr="VI"
                abbrClassName="bg-stone-200 text-stone-800"
                title="Australian visa (if already in Australia)"
                description="Copy of your current visa grant notice or ImmiAccount status."
                status="applicable"
                accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
                file={visaFile}
                onChange={setVisaFile}
              />
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
    <div className="rounded-2xl border border-[#dfece0] bg-[#faf8f5] p-4">
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

function DatePickerField({
  label,
  required,
  hint,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;
    const picker = input as HTMLInputElement & { showPicker?: () => void };
    if (typeof picker.showPicker === "function") {
      picker.showPicker();
    } else {
      picker.click();
    }
  };

  const displayValue = value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("en-AU", {
        dateStyle: "medium",
      })
    : "Select date";

  return (
    <div className="rounded-2xl border border-[#dfece0] bg-[#faf8f5] p-4">
      <label className="text-sm font-semibold text-[#2c3d2f]">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {hint && <p className="mt-0.5 text-xs text-[#6e706e]">{hint}</p>}
      <div
        className="relative mt-2 flex min-h-11 items-center justify-between rounded-xl border border-[#d5dfd6] bg-white px-3 py-2 text-sm text-[#2c3d2f] ring-[#759d7b]/30 focus-within:ring-2"
        onClick={openPicker}
      >
        <span className={value ? "" : "text-[#6e706e]"}>{displayValue}</span>
        <span aria-hidden>📅</span>
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </div>
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
    <div className="rounded-2xl border border-[#dfece0] bg-[#faf8f5] p-4">
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

function DocumentUploadCard({
  abbr,
  abbrClassName,
  title,
  description,
  status,
  accept,
  file,
  onChange,
}: {
  abbr: string;
  abbrClassName: string;
  title: string;
  description: string;
  status: "required" | "applicable";
  accept: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#dfece0] bg-[#faf8f5] p-4">
      <div className="flex gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${abbrClassName}`}
          aria-hidden
        >
          {abbr}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-semibold text-[#2c3d2f]">{title}</p>
            {status === "required" ? (
              <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-800">
                Required
              </span>
            ) : (
              <span className="shrink-0 rounded-full bg-[#eef1ee] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#5f7362]">
                If applicable
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[#6e706e]">{description}</p>
          <input
            type="file"
            accept={accept}
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            className="mt-3 block w-full cursor-pointer text-sm text-[#354a38] file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#cbecd0] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#354a38] hover:file:bg-[#b8dfbf]"
          />
          {file && (
            <p className="mt-2 text-xs text-[#6e706e]">
              Selected: {file.name} ({Math.round(file.size / 1024)} KB)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
