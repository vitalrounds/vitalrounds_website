"use client";

import { useControlTheme } from "../control-shell";

const options = [
  {
    id: "dark",
    title: "Dark olive",
    description: "Current control-room look with deep green surfaces and soft mint text.",
    swatches: ["#1a241c", "#2c3d2f", "#759d7b", "#cbecd0"],
  },
  {
    id: "light",
    title: "Light olive",
    description: "A brighter professional workspace using warm whites and muted olive accents.",
    swatches: ["#f4faf5", "#ffffff", "#d9eadc", "#5f7362"],
  },
] as const;

export default function SettingsPanel() {
  const { theme, setTheme } = useControlTheme();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {options.map((option) => {
        const active = theme === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setTheme(option.id)}
            className={
              active
                ? "rounded-2xl border border-[#759d7b] bg-[#354a38] p-5 text-left shadow-sm"
                : "rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-5 text-left transition hover:border-[#759d7b]"
            }
            aria-pressed={active}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{option.title}</h2>
                <p className="mt-2 text-sm leading-7 text-[#a6ccac]">{option.description}</p>
              </div>
              <span
                className={
                  active
                    ? "rounded-full bg-[#759d7b] px-3 py-1 text-xs font-semibold text-white"
                    : "rounded-full border border-[#5f7362] px-3 py-1 text-xs font-semibold text-[#cbecd0]"
                }
              >
                {active ? "Active" : "Use"}
              </span>
            </div>
            <div className="mt-5 flex gap-2">
              {option.swatches.map((swatch) => (
                <span
                  key={swatch}
                  className="h-8 flex-1 rounded-full border border-black/10"
                  style={{ backgroundColor: swatch }}
                />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
