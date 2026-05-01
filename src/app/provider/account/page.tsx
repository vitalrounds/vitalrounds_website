import { createServerSupabaseClient } from "@/lib/supabase/server";

const fields = [
  ["Organisation legal name", "Royal Example Health Network"],
  ["Trading name", "Example Hospital"],
  ["Facility type", "Hospital, clinic, or health service"],
  ["ABN / ACN", "Business registration number"],
  ["Primary contact name", "Program coordinator or clinical lead"],
  ["Primary contact role", "Director of Medical Services, Education Lead, HR, etc."],
  ["Contact email", "partner@example.com"],
  ["Contact phone", "+61 ..."],
  ["Physical address", "Street, suburb, state, postcode"],
  ["Website", "https://..."],
] as const;

export default async function PartnerAccountPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-white">Account</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#86aa8d]">
          Organisation profile for the hospital or clinic partner account.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl border border-[#223a29] bg-[#1a2b1e] p-5 text-center">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border border-[#759d7b] bg-[#28452f] text-3xl font-semibold text-white">
            {getInitials(user?.user_metadata?.organization_name ?? user?.email ?? "Partner")}
          </div>
          <p className="mt-3 text-sm font-semibold text-white">
            {user?.user_metadata?.organization_name ?? "Partner account"}
          </p>
          <p className="mt-1 break-all text-xs leading-6 text-[#86aa8d]">{user?.email}</p>
        </aside>

        <div className="space-y-5 rounded-2xl border border-[#223a29] bg-[#1a2b1e] p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#86aa8d]">
              Partner registration profile
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">Hospital / clinic details</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#86aa8d]">
              These are the suitable fields for partner onboarding. Editing and submission will be
              connected after the admin partner-management workflow is enabled.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {fields.map(([label, placeholder]) => (
              <label key={label} className="block text-sm font-semibold text-[#cbecd0]">
                {label}
                <input
                  disabled
                  placeholder={placeholder}
                  className="mt-1 w-full rounded-xl border border-[#354a38] bg-[#243329] px-3 py-2 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-75"
                />
              </label>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-[#cbecd0]">
              Departments / specialties offered
              <textarea
                disabled
                rows={4}
                placeholder="Emergency, cardiology, surgery, general medicine..."
                className="mt-1 w-full rounded-xl border border-[#354a38] bg-[#243329] px-3 py-2 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-75"
              />
            </label>
            <label className="block text-sm font-semibold text-[#cbecd0]">
              Notes for VitalRounds admin
              <textarea
                disabled
                rows={4}
                placeholder="Placement capacity, onboarding requirements, preferred contact method..."
                className="mt-1 w-full rounded-xl border border-[#354a38] bg-[#243329] px-3 py-2 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-75"
              />
            </label>
          </div>

          <p className="rounded-xl border border-[#354a38] bg-[#243329] px-4 py-3 text-xs leading-6 text-[#a6ccac]">
            This section is intentionally read-only for now. Partner account details should be
            verified by admin before partners can update public-facing program information.
          </p>
        </div>
      </section>
    </div>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? "P"}${parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : ""}`.toUpperCase();
}
