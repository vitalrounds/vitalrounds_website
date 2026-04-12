import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function ProviderDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-[#2c3d2f]">Programs & applicants</h1>
      <p className="max-w-2xl text-sm leading-7 text-[#6e706e]">
        Signed in as {user?.email}. Observership programs, enrolled IMGs, and pending
        applications will be managed here.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-3xl border border-[#a6ccac] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#354a38]">Active programs</h2>
          <p className="mt-2 text-2xl font-semibold text-[#759d7b]">—</p>
        </section>
        <section className="rounded-3xl border border-[#a6ccac] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#354a38]">Pending reviews</h2>
          <p className="mt-2 text-2xl font-semibold text-[#759d7b]">—</p>
        </section>
        <section className="rounded-3xl border border-[#a6ccac] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#354a38]">Enrolled observers</h2>
          <p className="mt-2 text-2xl font-semibold text-[#759d7b]">—</p>
        </section>
      </div>
    </div>
  );
}
