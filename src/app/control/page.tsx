import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function ControlHomePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Operations</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
          Internal control panel. Next steps: application queue, hospital
          onboarding, and account management will live here.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-6">
          <h2 className="text-lg font-semibold text-white">Signed in as</h2>
          <p className="mt-2 text-sm text-[#cbecd0]">{user?.email}</p>
        </section>
        <section className="rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-6">
          <h2 className="text-lg font-semibold text-white">Quick links</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#a6ccac]">
            <li>
              —{" "}
              <Link
                href="/control/waitlist"
                className="font-medium text-[#cbecd0] underline-offset-2 hover:text-white hover:underline"
              >
                Wait list applications
              </Link>
            </li>
            <li>
              —{" "}
              <Link
                href="/control/sales/brochures"
                className="font-medium text-[#cbecd0] underline-offset-2 hover:text-white hover:underline"
              >
                Sales brochures
              </Link>
            </li>
            <li>— Hospital accounts (coming soon)</li>
            <li>— Platform settings (coming soon)</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
