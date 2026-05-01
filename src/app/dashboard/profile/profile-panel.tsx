"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { COUNTRY_OPTIONS } from "@/lib/waitlist/countries";
import { SPECIALTY_OPTIONS } from "@/lib/waitlist/questions";

type Tab = "details" | "documents" | "password";

type DocumentRecord = {
  name?: string;
  label?: string;
  path?: string;
  size?: number;
  type?: string | null;
  uploadedAt?: string;
  avatarPosition?: string;
};

const VISA_OPTIONS = ["Student", "Tourist", "PR", "Citizen", "Other"] as const;
const ENGLISH_TESTS = ["OET", "IELTS", "PTE"] as const;
const MAX_AVATAR_MB = 2;
const MAX_DOCUMENT_MB = 10;

const documentLabels: Record<string, string> = {
  cv: "Curriculum Vitae (CV)",
  degreeCertificate: "Medical Degree Certificate",
  identityDocument: "Driver Licence or Passport",
  amcPart1: "AMC Part 1 result letter",
  englishTestReport: "English language test result",
  internshipCertificate: "Internship / training completion certificate",
  visa: "Australian visa document",
};

const lockedDocumentKeys = new Set(["degreeCertificate", "identityDocument"]);

export function ProfilePanel({
  email,
  fullName,
  initialDetails,
  initialDocuments,
}: {
  email: string;
  fullName: string;
  initialDetails: Record<string, unknown>;
  initialDocuments: Record<string, unknown>;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [details, setDetails] = useState(() => normalizeDetails(initialDetails, email, fullName));
  const [documents, setDocuments] = useState<Record<string, unknown>>(initialDocuments);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | null>(null);
  const [avatarPosition, setAvatarPosition] = useState("50% 50%");
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const avatarDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startPositionX: number;
    startPositionY: number;
  } | null>(null);

  const avatar = documents.avatar as DocumentRecord | undefined;
  useEffect(() => {
    if (!avatar?.path) return;
    void openDocument(avatar.path, false).then((url) => {
      if (url) setAvatarUrl(url);
    });
  }, [avatar?.path]);

  useEffect(() => {
    setAvatarPosition(avatar?.avatarPosition ?? "50% 50%");
  }, [avatar?.avatarPosition]);

  useEffect(() => {
    return () => {
      if (selectedAvatarUrl) URL.revokeObjectURL(selectedAvatarUrl);
    };
  }, [selectedAvatarUrl]);

  const initials = useMemo(() => getInitials(details.preferredName || details.fullLegalName), [details]);

  async function saveDetails() {
    setSaving(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/applicant-profile/details", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ details }),
    });
    const body = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(body.error ?? "Could not save details.");
      return;
    }
    setDetails(normalizeDetails(body.details ?? details, email, fullName));
    setMessage("Personal details updated.");
  }

  function startAvatarSelection(file: File | null) {
    if (!file) return;
    setError(null);
    setMessage(null);
    if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
      setError(`Profile photo must be ${MAX_AVATAR_MB} MB or smaller.`);
      return;
    }
    if (selectedAvatarUrl) URL.revokeObjectURL(selectedAvatarUrl);
    setSelectedAvatarFile(file);
    setSelectedAvatarUrl(URL.createObjectURL(file));
    setAvatarPosition(avatar?.avatarPosition ?? "50% 50%");
    setAvatarModalOpen(true);
  }

  async function uploadAvatar() {
    if (!selectedAvatarFile) return;
    setAvatarUploading(true);
    setError(null);
    setMessage(null);
    const fd = new FormData();
    fd.append("kind", "avatar");
    fd.append("avatarPosition", avatarPosition);
    fd.append("file", selectedAvatarFile);
    const res = await fetch("/api/applicant-profile/documents", { method: "POST", body: fd });
    const body = await res.json().catch(() => ({}));
    setAvatarUploading(false);
    if (!res.ok) {
      setError(body.error ?? "Could not upload profile photo.");
      return;
    }
    setDocuments(body.documents ?? documents);
    setSelectedAvatarFile(null);
    if (selectedAvatarUrl) URL.revokeObjectURL(selectedAvatarUrl);
    setSelectedAvatarUrl(null);
    setAvatarModalOpen(false);
    const uploadedAvatar = body.document as DocumentRecord | undefined;
    if (uploadedAvatar?.path) {
      window.dispatchEvent(
        new CustomEvent("vitalrounds-avatar-change", {
          detail: {
            path: uploadedAvatar.path,
            avatarPosition: uploadedAvatar.avatarPosition ?? avatarPosition,
          },
        }),
      );
    }
    setMessage("Profile photo updated.");
  }

  function closeAvatarModal() {
    if (avatarUploading) return;
    if (selectedAvatarUrl) URL.revokeObjectURL(selectedAvatarUrl);
    setSelectedAvatarFile(null);
    setSelectedAvatarUrl(null);
    setAvatarPosition(avatar?.avatarPosition ?? "50% 50%");
    setAvatarModalOpen(false);
  }

  function startAvatarReposition(event: PointerEvent<HTMLDivElement>) {
    if (!selectedAvatarUrl) return;
    const [positionX, positionY] = parseObjectPosition(avatarPosition);
    avatarDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPositionX: positionX,
      startPositionY: positionY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveAvatar(event: PointerEvent<HTMLDivElement>) {
    const drag = avatarDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const deltaX = ((event.clientX - drag.startX) / rect.width) * 100;
    const deltaY = ((event.clientY - drag.startY) / rect.height) * 100;
    setAvatarPosition(
      `${clampPercent(drag.startPositionX - deltaX)}% ${clampPercent(drag.startPositionY - deltaY)}%`,
    );
  }

  function stopAvatarReposition(event: PointerEvent<HTMLDivElement>) {
    const drag = avatarDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    avatarDragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  async function removeAvatar() {
    setAvatarUploading(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/applicant-profile/documents", { method: "DELETE" });
    const body = await res.json().catch(() => ({}));
    setAvatarUploading(false);
    if (!res.ok) {
      setError(body.error ?? "Could not remove profile photo.");
      return;
    }
    setDocuments(body.documents ?? {});
    setAvatarUrl(null);
    window.dispatchEvent(
      new CustomEvent("vitalrounds-avatar-change", {
        detail: { removed: true },
      }),
    );
    setMessage("Profile photo removed.");
  }

  async function uploadDocument(formData: FormData) {
    setError(null);
    setMessage(null);
    const res = await fetch("/api/applicant-profile/documents", { method: "POST", body: formData });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "Could not upload document.");
      return;
    }
    setDocuments(body.documents ?? documents);
    setMessage("Document uploaded.");
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-white">Account</h1>
        <p className="mt-2 text-sm text-[#86aa8d]">Manage your profile, documents, and password.</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl border border-[#223a29] bg-[#1a2b1e] p-5 text-center">
          <button
            type="button"
            onClick={() => setAvatarModalOpen(true)}
            className="group mx-auto block"
            title="Change profile photo"
          >
            <span className="relative mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-[#759d7b] bg-[#28452f] text-3xl font-semibold text-white transition group-hover:scale-105 group-hover:border-[#9bd4a4]">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Profile avatar"
                  className="h-full w-full object-cover"
                  style={{ objectPosition: avatar?.avatarPosition ?? "50% 50%" }}
                />
              ) : (
                initials
              )}
              {avatarUploading ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-semibold text-white">
                  Uploading...
                </span>
              ) : null}
            </span>
            <span className="mt-3 block text-xs font-semibold text-[#9bd4a4] group-hover:underline">
              {avatarUploading ? "Uploading photo..." : "Change photo"}
            </span>
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              startAvatarSelection(event.target.files?.[0] ?? null);
              event.currentTarget.value = "";
            }}
          />
          <p className="mt-3 text-xs leading-6 text-[#86aa8d]">JPG, PNG, or WebP. Max {MAX_AVATAR_MB} MB.</p>
          {avatar?.path && !selectedAvatarUrl ? (
            <button
              type="button"
              onClick={removeAvatar}
              disabled={avatarUploading}
              className="mt-3 rounded-full border border-[#354a38] px-4 py-2 text-xs font-semibold text-[#cbecd0] transition hover:bg-[#425f48] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {avatarUploading ? "Removing..." : "Remove photo"}
            </button>
          ) : null}
        </aside>

        <div className="rounded-2xl border border-[#223a29] bg-[#1a2b1e] p-5">
          <div className="flex flex-wrap gap-2">
            {[
              ["details", "Personal details"],
              ["documents", "Documents"],
              ["password", "Password"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActiveTab(id as Tab);
                  setError(null);
                  setMessage(null);
                }}
                className={
                  activeTab === id
                    ? "rounded-full bg-[#759d7b] px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-full border border-[#354a38] px-4 py-2 text-sm font-semibold text-[#cbecd0] hover:bg-[#425f48]"
                }
              >
                {label}
              </button>
            ))}
          </div>

          {message ? <p className="mt-4 rounded-xl bg-[#28452f] px-4 py-3 text-sm text-[#cbecd0]">{message}</p> : null}
          {error ? <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}

          {activeTab === "details" ? (
            <PersonalDetails details={details} setDetails={setDetails} saving={saving} onSave={saveDetails} />
          ) : null}
          {activeTab === "documents" ? (
            <DocumentsPanel documents={documents} uploadDocument={uploadDocument} />
          ) : null}
          {activeTab === "password" ? <PasswordPanel setError={setError} setMessage={setMessage} /> : null}
        </div>
      </section>

      {avatarModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-8">
          <div className="w-full max-w-lg rounded-3xl border border-[#354a38] bg-[#1a2b1e] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#86aa8d]">
                  Profile photo
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Adjust your avatar</h2>
                <p className="mt-2 text-sm leading-7 text-[#a6ccac]">
                  Select a photo, then drag it to reposition it inside the circular crop.
                </p>
              </div>
              <button
                type="button"
                onClick={closeAvatarModal}
                disabled={avatarUploading}
                className="rounded-full border border-[#354a38] px-3 py-1.5 text-xs font-semibold text-[#cbecd0] transition hover:bg-[#425f48] disabled:opacity-60"
              >
                Close
              </button>
            </div>

            <div className="mt-6 rounded-3xl border border-[#354a38] bg-[#243329] p-5 text-center">
              {selectedAvatarUrl ? (
                <>
                  <div
                    className="mx-auto flex h-56 w-56 touch-none select-none items-center justify-center overflow-hidden rounded-full border border-[#759d7b] bg-[#1a2b1e] shadow-inner cursor-grab active:cursor-grabbing"
                    onPointerDown={startAvatarReposition}
                    onPointerMove={moveAvatar}
                    onPointerUp={stopAvatarReposition}
                    onPointerCancel={stopAvatarReposition}
                    role="presentation"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedAvatarUrl}
                      alt="Selected avatar preview"
                      draggable={false}
                      className="h-full w-full object-cover"
                      style={{ objectPosition: avatarPosition }}
                    />
                  </div>
                  <p className="mx-auto mt-4 max-w-sm text-xs leading-6 text-[#86aa8d]">
                    Drag the photo within the circle until your face is aligned the way you want.
                  </p>
                </>
              ) : (
                <div className="mx-auto max-w-sm rounded-2xl border border-dashed border-[#5f7362] bg-[#1a2b1e] px-5 py-10">
                  <p className="text-sm font-semibold text-white">Choose a profile photo</p>
                  <p className="mt-2 text-xs leading-6 text-[#86aa8d]">
                    JPG, PNG, or WebP. Max {MAX_AVATAR_MB} MB.
                  </p>
                </div>
              )}

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="rounded-full border border-[#759d7b] px-5 py-2 text-sm font-semibold text-[#cbecd0] transition hover:bg-[#425f48] disabled:opacity-60"
                >
                  {selectedAvatarUrl ? "Choose another photo" : "Browse photo"}
                </button>
                <button
                  type="button"
                  onClick={uploadAvatar}
                  disabled={!selectedAvatarFile || avatarUploading}
                  className="rounded-full bg-[#759d7b] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#5f8f68] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {avatarUploading ? "Saving..." : "Save photo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PersonalDetails({
  details,
  setDetails,
  saving,
  onSave,
}: {
  details: ReturnType<typeof normalizeDetails>;
  setDetails: (details: ReturnType<typeof normalizeDetails>) => void;
  saving: boolean;
  onSave: () => void;
}) {
  function update(key: keyof typeof details, value: string | string[]) {
    setDetails({ ...details, [key]: value });
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Legal name" value={details.fullLegalName} locked />
        <Field label="Email address" value={details.email} locked />
        <Field label="Preferred name" value={details.preferredName} onChange={(v) => update("preferredName", v)} />
        <Field label="Date of birth" type="date" value={details.dateOfBirth} onChange={(v) => update("dateOfBirth", v)} />
        <Select label="Nationality / citizenship" value={details.nationality} options={COUNTRY_OPTIONS} onChange={(v) => update("nationality", v)} />
        <Select label="Country of medical degree" value={details.degreeCountry} options={COUNTRY_OPTIONS} onChange={(v) => update("degreeCountry", v)} />
        <Field label="Medical degree & institution" value={details.degreeInstitution} onChange={(v) => update("degreeInstitution", v)} />
        <Field label="Phone number" value={details.phone} onChange={(v) => update("phone", v)} />
        <Field label="Current city & country" value={details.cityCountry} onChange={(v) => update("cityCountry", v)} />
        <Field label="LinkedIn profile" value={details.linkedIn} onChange={(v) => update("linkedIn", v)} />
        <Field label="AHPRA number" value={details.ahpraNumber} onChange={(v) => update("ahpraNumber", v)} />
        <Field label="AMC candidate number" value={details.amcCandidateNumber} onChange={(v) => update("amcCandidateNumber", v)} />
        <Select label="English test type" value={details.englishTestType} options={ENGLISH_TESTS} onChange={(v) => update("englishTestType", v)} />
        <Field label="English test score" value={details.englishTestScore} onChange={(v) => update("englishTestScore", v)} />
        <Field label="English test expiry" type="date" value={details.englishTestExpiry} onChange={(v) => update("englishTestExpiry", v)} />
        <Select label="Current visa status" value={details.visaStatus} options={VISA_OPTIONS} onChange={(v) => update("visaStatus", v)} />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">Preferred specialties</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SPECIALTY_OPTIONS.map((option) => {
            const selected = details.preferredSpecialties.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() =>
                  update(
                    "preferredSpecialties",
                    selected
                      ? details.preferredSpecialties.filter((item) => item !== option)
                      : [...details.preferredSpecialties, option],
                  )
                }
                className={
                  selected
                    ? "rounded-full bg-[#759d7b] px-3 py-2 text-xs font-semibold text-white"
                    : "rounded-full border border-[#354a38] px-3 py-2 text-xs font-semibold text-[#cbecd0] hover:bg-[#425f48]"
                }
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
      <TextArea label="Additional notes" value={details.additionalNotes} onChange={(v) => update("additionalNotes", v)} />
      <TextArea label="Personal statement" value={details.personalStatement} onChange={(v) => update("personalStatement", v)} />
      <p className="rounded-xl border border-[#354a38] bg-[#243329] px-4 py-3 text-xs leading-6 text-[#a6ccac]">
        Legal name and email are locked. Medical certification and driver licence/passport documents
        can be viewed but not replaced here.
      </p>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="rounded-full bg-[#759d7b] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save details"}
      </button>
    </div>
  );
}

function DocumentsPanel({
  documents,
  uploadDocument,
}: {
  documents: Record<string, unknown>;
  uploadDocument: (formData: FormData) => Promise<void>;
}) {
  const [label, setLabel] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const initialDocuments = Object.entries(documentLabels)
    .map(([key, labelText]) => ({
      key,
      label: labelText,
      document: documents[key] as DocumentRecord | undefined,
      locked: lockedDocumentKeys.has(key),
    }))
    .filter((item) => item.document?.path);
  const additionalDocuments = Array.isArray(documents.additionalDocuments)
    ? (documents.additionalDocuments as DocumentRecord[])
    : [];

  async function submitUpload() {
    if (!file) return;
    const fd = new FormData();
    fd.append("kind", "additional");
    fd.append("label", label);
    fd.append("file", file);
    await uploadDocument(fd);
    setFile(null);
    setLabel("");
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h2 className="font-semibold text-white">Initial uploads</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {initialDocuments.length ? (
            initialDocuments.map((item) => (
              <DocumentCard
                key={item.key}
                label={item.label}
                document={item.document}
                locked={item.locked}
              />
            ))
          ) : (
            <p className="rounded-xl border border-[#354a38] bg-[#243329] p-4 text-sm text-[#86aa8d]">
              No initial documents are available yet.
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-white">Additional documents</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {additionalDocuments.map((doc, idx) => (
            <DocumentCard key={`${doc.path}-${idx}`} label={doc.label ?? "Additional document"} document={doc} />
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-[#354a38] bg-[#243329] p-4">
          <p className="text-sm font-semibold text-white">Add another document</p>
          <p className="mt-1 text-xs text-[#86aa8d]">PDF, JPG, or PNG. Max {MAX_DOCUMENT_MB} MB.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Document label"
              className="rounded-xl border border-[#354a38] bg-[#1a2b1e] px-3 py-2 text-sm text-white outline-none"
            />
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="rounded-xl border border-[#354a38] bg-[#1a2b1e] px-3 py-2 text-sm text-[#cbecd0] file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#759d7b] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white"
            />
            <button
              type="button"
              onClick={submitUpload}
              disabled={!file}
              className="rounded-full bg-[#759d7b] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordPanel({
  setError,
  setMessage,
}: {
  setError: (message: string | null) => void;
  setMessage: (message: string | null) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const checks = getPasswordChecks(newPassword);

  async function changePassword() {
    setSaving(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/applicant-profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const body = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(body.error ?? "Could not change password.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setMessage("Password changed successfully. We sent you a confirmation email.");
  }

  return (
    <div className="mt-6 max-w-xl space-y-4">
      <Field label="Current password" type="password" value={currentPassword} onChange={setCurrentPassword} />
      <Field label="New password" type="password" value={newPassword} onChange={setNewPassword} />
      <ul className="grid gap-1 rounded-2xl border border-[#354a38] bg-[#243329] p-4 text-sm text-[#a6ccac] sm:grid-cols-2">
        <Check ok={checks.length} text="At least 12 characters" />
        <Check ok={checks.upper} text="Uppercase letter" />
        <Check ok={checks.lower} text="Lowercase letter" />
        <Check ok={checks.number} text="Number" />
        <Check ok={checks.special} text="Special character" />
      </ul>
      <button
        type="button"
        onClick={changePassword}
        disabled={saving}
        className="rounded-full bg-[#759d7b] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Changing..." : "Change password"}
      </button>
    </div>
  );
}

function DocumentCard({
  label,
  document,
  locked,
}: {
  label: string;
  document?: DocumentRecord;
  locked?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-[#354a38] bg-[#243329] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{label}</h3>
          <p className="mt-1 break-all text-xs text-[#86aa8d]">{document?.name ?? "Uploaded file"}</p>
          {document?.size ? <p className="mt-1 text-xs text-[#86aa8d]">{formatBytes(document.size)}</p> : null}
        </div>
        {locked ? (
          <span className="rounded-full border border-[#5f7362] px-2 py-1 text-[11px] font-semibold text-[#cbecd0]">
            Locked
          </span>
        ) : null}
      </div>
      {document?.path ? (
        <button
          type="button"
          onClick={() => openDocument(document.path, true)}
          className="mt-4 rounded-full bg-[#759d7b] px-4 py-1.5 text-xs font-semibold text-white"
        >
          View document
        </button>
      ) : null}
    </article>
  );
}

async function openDocument(path: string | undefined, openWindow: boolean) {
  if (!path) return null;
  const res = await fetch("/api/applicant-profile/documents/link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.url) return null;
  if (openWindow) window.open(body.url, "_blank", "noopener,noreferrer");
  return body.url as string;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  locked,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  locked?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold text-[#cbecd0]">
      {label}
      <input
        type={type}
        value={value}
        disabled={locked}
        onChange={(event) => onChange?.(event.target.value)}
        className="mt-1 w-full rounded-xl border border-[#354a38] bg-[#243329] px-3 py-2 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-70"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-[#cbecd0]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-[#354a38] bg-[#243329] px-3 py-2 text-sm text-white outline-none"
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
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-[#cbecd0]">
      {label}
      <textarea
        value={value}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-[#354a38] bg-[#243329] px-3 py-2 text-sm text-white outline-none"
      />
    </label>
  );
}

function Check({ ok, text }: { ok: boolean; text: string }) {
  return <li className={ok ? "text-[#9bd4a4]" : "text-[#86aa8d]"}>{ok ? "OK" : "-"} {text}</li>;
}

function normalizeDetails(details: Record<string, unknown>, email: string, fullName: string) {
  return {
    fullLegalName: stringValue(details.fullLegalName) || fullName,
    preferredName: stringValue(details.preferredName),
    dateOfBirth: stringValue(details.dateOfBirth),
    nationality: stringValue(details.nationality),
    degreeCountry: stringValue(details.degreeCountry),
    degreeInstitution: stringValue(details.degreeInstitution),
    email: stringValue(details.email) || email,
    phone: stringValue(details.phone),
    cityCountry: stringValue(details.cityCountry),
    linkedIn: stringValue(details.linkedIn),
    ahpraNumber: stringValue(details.ahpraNumber),
    amcCandidateNumber: stringValue(details.amcCandidateNumber),
    englishTestType: stringValue(details.englishTestType),
    englishTestScore: stringValue(details.englishTestScore),
    englishTestExpiry: stringValue(details.englishTestExpiry),
    visaStatus: stringValue(details.visaStatus),
    preferredSpecialties: Array.isArray(details.preferredSpecialties)
      ? details.preferredSpecialties.filter((item): item is string => typeof item === "string")
      : [],
    additionalNotes: stringValue(details.additionalNotes),
    personalStatement: stringValue(details.personalStatement),
  };
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function parseObjectPosition(value: string) {
  const [x = "50%", y = "50%"] = value.split(" ");
  return [Number.parseFloat(x) || 50, Number.parseFloat(y) || 50] as const;
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? "D"}${parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : ""}`.toUpperCase();
}

function getPasswordChecks(password: string) {
  return {
    length: password.length >= 12,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
