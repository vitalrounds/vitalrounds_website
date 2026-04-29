import Link from "next/link";

const tabs = [
  { href: "/control/programs", label: "Browse Programs" },
  { href: "/control/programs/add", label: "Add Program" },
] as const;

export function ProgramTabs({ active }: { active: "browse" | "add" }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive =
          (active === "browse" && tab.href === "/control/programs") ||
          (active === "add" && tab.href === "/control/programs/add");

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
