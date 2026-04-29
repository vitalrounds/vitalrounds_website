import Link from "next/link";

const tabs = [
  { href: "/control/applicants", label: "Active" },
  { href: "/control/applicants/pending", label: "Pending" },
  { href: "/control/applicants/waitlist", label: "Wait list" },
] as const;

export function ApplicantsTabs({ active }: { active: "active" | "pending" | "waitlist" }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive =
          (active === "active" && tab.href === "/control/applicants") ||
          (active === "pending" && tab.href === "/control/applicants/pending") ||
          (active === "waitlist" && tab.href === "/control/applicants/waitlist");

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={
              isActive
                ? "rounded-full bg-[#759d7b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5f7362]"
                : "rounded-full border border-[#5f7362] px-4 py-2 text-sm font-semibold text-[#a6ccac] hover:bg-[#354a38] hover:text-white"
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
