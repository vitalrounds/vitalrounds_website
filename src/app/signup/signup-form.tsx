"use client";

import { useMemo, useRef, useState } from "react";
import { COUNTRY_OPTIONS } from "@/lib/waitlist/countries";
import { SPECIALTY_OPTIONS, SURVEY_QUESTIONS, type SurveyQuestion } from "@/lib/waitlist/questions";

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
  additionalNotes: string;
  personalStatement: string;
};

const emptyDetails: Details = {
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
  additionalNotes: "",
  personalStatement: "",
};

const VISA_OPTIONS = ["Student", "Tourist", "PR", "Citizen", "Other"] as const;
const ENGLISH_TESTS = ["OET", "IELTS", "PTE"] as const;

export default function ApplicantSignupForm() {
  const formTopRef = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState(0);
  const [survey, setSurvey] = useState<Record<string, string | string[]>>({});
  const [details, setDetails] = useState<Details>(emptyDetails);
  const [password, setPassword] = useState("");
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 12,
      lower: /[a-z]/.test(password),
      upper: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password],
  );
  const passwordScore = Object.values(passwordChecks).filter(Boolean).length;
  const passwordStrong = passwordScore === 5;

  function goToStep(nextStep: number) {
    setStep(nextStep);
    requestAnimationFrame(() => {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function setDetail<K extends keyof Details>(key: K, value: Details[K]) {
    setDetails((prev) => ({ ...prev, [key]: value }));
  }

  function answerQuestion(q: SurveyQuestion, option: string) {
    setSurvey((prev) => {
      if (q.kind === "single") return { ...prev, [q.id]: option };
      const current = Array.isArray(prev[q.id]) ? [...prev[q.id]] : [];
      const idx = current.indexOf(option);
      if (idx >= 0) current.splice(idx, 1);
      else if (current.length < (q.maxSelections ?? 99)) current.push(option);
      return { ...prev, [q.id]: current };
    });
  }

  function validate() {
    if (SURVEY_QUESTIONS.some((q) => !survey[q.id] || (Array.isArray(survey[q.id]) && survey[q.id].length === 0))) {
      return "Please complete all questionnaire items.";
    }
    if (!details.fullLegalName.trim()) return "Full legal name is required.";
    if (!details.dateOfBirth) return "Date of birth is required.";
    if (!details.nationality) return "Nationality is required.";
    if (!details.degreeCountry) return "Country of medical degree is required.";
    if (!details.degreeInstitution.trim()) return "Medical degree and institution is required.";
    if (!details.email.trim()) return "Email is required.";
    if (!details.phone.trim()) return "Phone number is required.";
    if (!details.cityCountry.trim()) return "Current city and country is required.";
    if (!details.visaStatus) return "Current visa status is required.";
    if (details.preferredSpecialties.length === 0) return "Select at least one specialty.";
    if (!files.cv) return "Please upload your CV.";
    if (!files.degreeCertificate) return "Please upload your medical degree certificate.";
    if (!passwordStrong) return "Please choose a stronger password.";
    if (!privacyAccepted) return "Please accept the privacy consent.";
    return null;
  }

  async function submit() {
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    setSubmitting(true);
    setError(null);
    const fd = new FormData();
    fd.append("json", JSON.stringify({ survey, details }));
    fd.append("password", password);
    Object.entries(files).forEach(([key, file]) => {
      if (file) fd.append(key, file);
    });
    const res = await fetch("/api/applicant-signup", { method: "POST", body: fd });
    const body = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setError(body.error ?? "Could not create account.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <section className="rounded-3xl border border-[#c8ddcb] bg-white p-8 text-center">
        <h1 className="text-3xl font-semibold">Check your email</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#5f7362]">
          Your applicant account has been created. Please open the verification email and click the
          link to activate your portal access.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <header ref={formTopRef} className="scroll-mt-6 text-center">
        <h1 className="text-4xl font-semibold">Create Applicant Account</h1>
        <p className="mt-2 text-sm text-[#5f7362]">Questionnaire, details, documents, and password setup.</p>
      </header>

      <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold text-[#5f7362]">
        {["Questionnaire", "Details", "Documents", "Password"].map((label, idx) => (
          <button
            key={label}
            type="button"
            onClick={() => goToStep(idx)}
            className={
              step === idx
                ? "rounded-full bg-[#759d7b] px-4 py-2 text-white"
                : "rounded-full border border-[#c8ddcb] px-4 py-2"
            }
          >
            {idx + 1}. {label}
          </button>
        ))}
      </div>

      {step === 0 && (
        <Panel title="Questionnaire">
          <div className="grid gap-4">
            {SURVEY_QUESTIONS.map((q) => {
              const value = survey[q.id];
              const selected = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
              return (
                <div key={q.id} className="rounded-2xl border border-[#dfece0] bg-[#faf8f5] p-4">
                  <p className="font-semibold">{q.questionNumber}. {q.prompt}</p>
                  {q.helper && <p className="mt-1 text-xs text-[#6e706e]">{q.helper}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {q.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => answerQuestion(q, option)}
                        className={
                          selected.includes(option)
                            ? "rounded-full bg-[#cbecd0] px-3 py-2 text-xs font-semibold"
                            : "rounded-full border border-[#c8ddcb] bg-white px-3 py-2 text-xs hover:bg-[#eef5f0]"
                        }
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {step === 1 && (
        <Panel title="Details">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full legal name" required value={details.fullLegalName} onChange={(v) => setDetail("fullLegalName", v)} />
            <Field label="Preferred name" value={details.preferredName} onChange={(v) => setDetail("preferredName", v)} />
            <Field label="Date of birth" required type="date" value={details.dateOfBirth} onChange={(v) => setDetail("dateOfBirth", v)} />
            <Select label="Nationality / citizenship" required value={details.nationality} onChange={(v) => setDetail("nationality", v)} options={COUNTRY_OPTIONS} />
            <Select label="Country of medical degree" required value={details.degreeCountry} onChange={(v) => setDetail("degreeCountry", v)} options={COUNTRY_OPTIONS} />
            <Field label="Medical degree & institution" required value={details.degreeInstitution} onChange={(v) => setDetail("degreeInstitution", v)} />
            <Field label="Email address" required type="email" value={details.email} onChange={(v) => setDetail("email", v)} />
            <Field label="Phone number" required value={details.phone} onChange={(v) => setDetail("phone", v)} />
            <Field label="Current city & country" required value={details.cityCountry} onChange={(v) => setDetail("cityCountry", v)} />
            <Field label="LinkedIn profile" value={details.linkedIn} onChange={(v) => setDetail("linkedIn", v)} />
            <Field label="AHPRA number" value={details.ahpraNumber} onChange={(v) => setDetail("ahpraNumber", v)} />
            <Field label="AMC candidate number" value={details.amcCandidateNumber} onChange={(v) => setDetail("amcCandidateNumber", v)} />
            <Select label="English test type" value={details.englishTestType} onChange={(v) => setDetail("englishTestType", v)} options={ENGLISH_TESTS} />
            <Field label="English test score" value={details.englishTestScore} onChange={(v) => setDetail("englishTestScore", v)} />
            <Field label="English test expiry" type="date" value={details.englishTestExpiry} onChange={(v) => setDetail("englishTestExpiry", v)} />
            <Select label="Current visa status" required value={details.visaStatus} onChange={(v) => setDetail("visaStatus", v)} options={VISA_OPTIONS} />
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold">Preferred specialties *</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SPECIALTY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    setDetail(
                      "preferredSpecialties",
                      details.preferredSpecialties.includes(option)
                        ? details.preferredSpecialties.filter((item) => item !== option)
                        : [...details.preferredSpecialties, option],
                    )
                  }
                  className={
                    details.preferredSpecialties.includes(option)
                      ? "rounded-full bg-[#cbecd0] px-3 py-2 text-xs font-semibold"
                      : "rounded-full border border-[#c8ddcb] bg-white px-3 py-2 text-xs"
                  }
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <TextArea label="Additional notes" value={details.additionalNotes} onChange={(v) => setDetail("additionalNotes", v)} />
          <TextArea label="Personal statement" value={details.personalStatement} onChange={(v) => setDetail("personalStatement", v)} />
        </Panel>
      )}

      {step === 2 && (
        <Panel title="Documents">
          <div className="grid gap-4 md:grid-cols-2">
            <Upload label="Curriculum Vitae (CV)" required name="cv" setFiles={setFiles} />
            <Upload label="Medical Degree Certificate" required name="degreeCertificate" setFiles={setFiles} />
            <Upload label="Driver Licence or Passport" name="identityDocument" setFiles={setFiles} />
            <Upload label="AMC Part 1 result letter" name="amcPart1" setFiles={setFiles} />
            <Upload label="English language test result" name="englishTestReport" setFiles={setFiles} />
            <Upload label="Internship / training completion certificate" name="internshipCertificate" setFiles={setFiles} />
            <Upload label="Australian visa document" name="visa" setFiles={setFiles} />
          </div>
        </Panel>
      )}

      {step === 3 && (
        <Panel title="Password & Consent">
          <Field label="Applicant password" required type="password" value={password} onChange={setPassword} />
          <div className="rounded-2xl border border-[#dfece0] bg-[#faf8f5] p-4">
            <div className="h-2 overflow-hidden rounded-full bg-[#dfece0]">
              <div className="h-full bg-[#759d7b]" style={{ width: `${(passwordScore / 5) * 100}%` }} />
            </div>
            <ul className="mt-3 grid gap-1 text-sm text-[#5f7362] sm:grid-cols-2">
              <Check ok={passwordChecks.length} text="At least 12 characters" />
              <Check ok={passwordChecks.upper} text="Uppercase letter" />
              <Check ok={passwordChecks.lower} text="Lowercase letter" />
              <Check ok={passwordChecks.number} text="Number" />
              <Check ok={passwordChecks.special} text="Special character" />
            </ul>
          </div>
          <label className="flex cursor-pointer gap-3 rounded-2xl border border-[#dfece0] bg-white p-4 text-sm">
            <input type="checkbox" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} className="mt-1 accent-[#759d7b]" />
            <span>I confirm the information provided is accurate and agree to VitalRounds collecting, storing, and reviewing my information for applicant account and observership coordination purposes.</span>
          </label>
        </Panel>
      )}

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <div className="flex flex-wrap justify-between gap-3">
        <button type="button" onClick={() => goToStep(Math.max(0, step - 1))} className="rounded-full border border-[#759d7b] px-6 py-2.5 text-sm font-semibold">
          Back
        </button>
        {step < 3 ? (
          <button type="button" onClick={() => goToStep(Math.min(3, step + 1))} className="rounded-full bg-[#759d7b] px-6 py-2.5 text-sm font-semibold text-white">
            Continue
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={submitting || !passwordStrong || !privacyAccepted} className="rounded-full bg-[#759d7b] px-6 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600">
            {submitting ? "Creating account..." : "Create account"}
          </button>
        )}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-[#c8ddcb] bg-white/80 p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, required, type = "text" }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string }) {
  return (
    <label className="block rounded-2xl border border-[#dfece0] bg-[#faf8f5] p-4 text-sm font-semibold">
      {label} {required && <span className="text-red-600">*</span>}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d5dfd6] bg-white px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-[#759d7b]/30" />
    </label>
  );
}

function Select({ label, value, onChange, options, required }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[]; required?: boolean }) {
  return (
    <label className="block rounded-2xl border border-[#dfece0] bg-[#faf8f5] p-4 text-sm font-semibold">
      {label} {required && <span className="text-red-600">*</span>}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d5dfd6] bg-white px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-[#759d7b]/30">
        <option value="">Select</option>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="mt-4 block rounded-2xl border border-[#dfece0] bg-[#faf8f5] p-4 text-sm font-semibold">
      {label}
      <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d5dfd6] bg-white px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-[#759d7b]/30" />
    </label>
  );
}

function Upload({ label, name, required, setFiles }: { label: string; name: string; required?: boolean; setFiles: React.Dispatch<React.SetStateAction<Record<string, File | null>>> }) {
  return (
    <label className="block rounded-2xl border border-[#dfece0] bg-[#faf8f5] p-4 text-sm font-semibold">
      {label} {required && <span className="text-red-600">*</span>}
      <input type="file" accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg" onChange={(e) => setFiles((prev) => ({ ...prev, [name]: e.target.files?.[0] ?? null }))} className="mt-3 block w-full cursor-pointer text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#cbecd0] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#354a38]" />
    </label>
  );
}

function Check({ ok, text }: { ok: boolean; text: string }) {
  return <li className={ok ? "text-[#2f7a3f]" : "text-[#8a8f8b]"}>{ok ? "✓" : "○"} {text}</li>;
}
