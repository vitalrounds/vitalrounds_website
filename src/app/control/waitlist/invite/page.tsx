import Link from "next/link";
import InviteForm from "./invite-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Invite to wait list | VitalRounds Control",
};

export default function WaitlistInvitePage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Invite to wait list</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
            Send invitation emails to potential applicants.
          </p>
        </div>
        <Link
          href="/control/waitlist"
          className="rounded-full border border-[#5f7362] px-4 py-2 text-sm text-[#cbecd0] hover:bg-[#354a38]"
        >
          ← Back to wait list
        </Link>
      </div>

      <InviteForm />
    </div>
  );
}
