import { useEffect, useId, useRef, useState } from "react";

export type FilterDropdownOption = {
  key: string;
  label: string;
};

type Props = {
  value: string | null;
  options: FilterDropdownOption[];
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string | null) => void;
};

/**
 * Fomantic-style dropdown rendered as a styled `<div>` so the open menu
 * picks up Fomantic's `.ui.dropdown .menu` styling instead of the native
 * `<select>` chrome. Behaves like a single-select with a placeholder
 * (empty value) and an option list.
 */
export default function FilterDropdown({
  value,
  options,
  placeholder,
  disabled,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.key === value);
  const displayText = selected ? selected.label : placeholder;

  function pick(next: string | null) {
    onChange(next);
    setOpen(false);
  }

  const className = [
    "ui dropdown link item",
    disabled ? "disabled" : "",
    open ? "active visible" : "",
    selected ? "" : "default",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={ref}
      className={className}
      role="listbox"
      aria-expanded={open}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      onClick={() => {
        if (!disabled) setOpen((v) => !v);
      }}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen((v) => !v);
        }
      }}
    >
      <div className={selected ? "text" : "default text"}>{displayText}</div>
      <i className="dropdown icon" />
      <div
        id={menuId}
        className={`menu transition ${open ? "visible" : "hidden"}`}
        style={{ display: open ? "block" : undefined }}
      >
        <div
          className={`item${value == null ? " active selected" : ""}`}
          role="option"
          tabIndex={open ? 0 : -1}
          aria-selected={value == null}
          onClick={(e) => {
            e.stopPropagation();
            pick(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              pick(null);
            }
          }}
        >
          {placeholder}
        </div>
        {options.map((o) => (
          <div
            key={o.key}
            className={`item${o.key === value ? " active selected" : ""}`}
            role="option"
            tabIndex={open ? 0 : -1}
            aria-selected={o.key === value}
            onClick={(e) => {
              e.stopPropagation();
              pick(o.key);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                pick(o.key);
              }
            }}
          >
            {o.label}
          </div>
        ))}
      </div>
    </div>
  );
}
