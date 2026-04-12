import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function CustomerDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-[#2c3d2f]">Your observerships</h1>
      <p className="max-w-2xl text-sm leading-7 text-[#6e706e]">
        Welcome{user?.email ? `, ${user.email}` : ""}. Program listings, application
        status, and progress tracking will appear here.
      </p>
      <div className="rounded-3xl border border-[#a6ccac] bg-white p-8 text-center text-sm text-[#6e706e]">
        No active programs yet — this area will populate once you are enrolled.
      </div>
    </div>
  );
}
