"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { createPartnerAccount, type CreatePartnerState } from "./actions";

const initialState: CreatePartnerState = {
  ok: false,
  message: "",
};

export function PartnerOnboardingForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [password, setPassword] = useState("");
  const [state, formAction, pending] = useActionState(async (prev: CreatePartnerState, fd: FormData) => {
    const result = await createPartnerAccount(prev, fd);
    if (result.ok) {
      formRef.current?.reset();
      setPassword("");
    }
    return result;
  }, initialState);
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

  return (
    <form
      ref={formRef}
      action={formAction}
      onReset={() => setPassword("")}
      className="partner-onboarding-field space-y-6"
    >
      <style>{autofillCss}</style>
      {state.message ? (
        <p
          className={
            state.ok
              ? "rounded-2xl border border-[#759d7b] bg-[#243329] px-4 py-3 text-sm leading-6 text-[#cbecd0]"
              : "rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <section className="rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7a9b80]">
          Partner login account
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">Create partner access</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
          This creates a secure partner login with role <code>partner</code>. Share the email and
          temporary password with the hospital or clinic through a secure channel.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field name="email" label="Partner login email" type="email" required />
          <label className="block text-sm font-semibold text-[#cbecd0]">
            Temporary password <span className="text-red-300"> *</span>
            <input
              name="password"
              type="text"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              className={inputClassName}
            />
            <ul className="mt-2 grid gap-1 rounded-xl border border-[#354a38] bg-[#243329] p-3 text-xs leading-5 text-[#a6ccac] sm:grid-cols-2">
              <Check ok={passwordChecks.length} text="At least 12 characters" />
              <Check ok={passwordChecks.upper} text="Uppercase letter" />
              <Check ok={passwordChecks.lower} text="Lowercase letter" />
              <Check ok={passwordChecks.number} text="Number" />
              <Check ok={passwordChecks.special} text="Special character" />
            </ul>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7a9b80]">
          Organisation profile
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">Hospital / clinic details</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field name="organisationLegalName" label="Organisation legal name" required />
          <Field name="tradingName" label="Trading name / facility name" />
          <Select
            name="facilityType"
            label="Facility type"
            options={["Hospital", "Private clinic", "Day procedure centre", "Health service", "Other"]}
          />
          <Field name="abnAcn" label="ABN / ACN" />
          <Field name="website" label="Website" type="url" />
          <Field name="contactPhone" label="Main contact phone" />
          <Field name="physicalAddress" label="Physical address" className="md:col-span-2" />
        </div>
      </section>

      <section className="rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7a9b80]">
          Contact and program readiness
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">Operational contact</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field name="primaryContactName" label="Primary contact name" required />
          <Field name="primaryContactRole" label="Primary contact role" />
          <TextArea
            name="departments"
            label="Departments / specialties available"
            placeholder="Emergency, general medicine, cardiology, surgery..."
          />
          <TextArea
            name="adminNotes"
            label="Internal admin notes"
            placeholder="Capacity, onboarding requirements, documents needed, approval notes..."
          />
        </div>
      </section>

      <section className="rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7a9b80]">
          Profile avatar
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">Partner avatar picture</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
          Upload the partner logo or a representative facility image. JPG, PNG, or WebP, max 2 MB.
        </p>
        <input
          name="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-5 w-full rounded-xl border border-[#354a38] bg-[#243329] px-3 py-2 text-sm text-[#cbecd0] file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#759d7b] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white"
        />
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="reset"
          disabled={pending}
          className="rounded-full border border-[#5f7362] px-5 py-2 text-sm font-semibold text-[#cbecd0] transition hover:bg-[#354a38] disabled:opacity-60"
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-[#759d7b] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#5f7362] disabled:opacity-60"
        >
          {pending ? "Creating..." : "Create partner account"}
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  hint,
  className = "",
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={`block text-sm font-semibold text-[#cbecd0] ${className}`}>
      {label}
      {required ? <span className="text-red-300"> *</span> : null}
      <input
        name={name}
        type={type}
        required={required}
        autoComplete="off"
        className={inputClassName}
      />
      {hint ? <span className="mt-1 block text-xs leading-5 text-[#a6ccac]">{hint}</span> : null}
    </label>
  );
}

function Select({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: string[];
}) {
  return (
    <label className="block text-sm font-semibold text-[#cbecd0]">
      {label}
      <select
        name={name}
        className={inputClassName}
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  name,
  label,
  placeholder,
}: {
  name: string;
  label: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-[#cbecd0]">
      {label}
      <textarea
        name={name}
        rows={4}
        placeholder={placeholder}
        className={inputClassName}
      />
    </label>
  );
}

const inputClassName =
  "mt-1 w-full rounded-xl border border-[#354a38] bg-[#243329] px-3 py-2 text-sm text-white caret-white outline-none focus:border-[#759d7b]";

function Check({ ok, text }: { ok: boolean; text: string }) {
  return <li className={ok ? "text-[#9bd4a4]" : "text-[#a6ccac]"}>{ok ? "OK" : "-"} {text}</li>;
}

const autofillCss = `
  .partner-onboarding-field input:-webkit-autofill,
  .partner-onboarding-field input:-webkit-autofill:hover,
  .partner-onboarding-field input:-webkit-autofill:focus,
  .partner-onboarding-field textarea:-webkit-autofill,
  .partner-onboarding-field textarea:-webkit-autofill:hover,
  .partner-onboarding-field textarea:-webkit-autofill:focus,
  .partner-onboarding-field select:-webkit-autofill,
  .partner-onboarding-field select:-webkit-autofill:hover,
  .partner-onboarding-field select:-webkit-autofill:focus {
    -webkit-text-fill-color: #ffffff;
    box-shadow: 0 0 0 1000px #243329 inset;
    transition: background-color 9999s ease-in-out 0s;
  }
`;
