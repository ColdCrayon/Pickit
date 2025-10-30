import React from "react";

type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
};

export function Toggle({ checked, onChange, label, disabled }: Props) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-label={label ?? "toggle"}
      onClick={() => !disabled && onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-emerald-500/80" : "bg-zinc-600/70",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:brightness-110",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}
