import { useId } from "react";

export function SearchBar({
  value,
  onChange,
  placeholder,
  label,
  busy,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
  busy?: boolean;
  /** Optional filters rendered beside the input. */
  children?: React.ReactNode;
}) {
  const id = useId();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative grow min-w-[14rem] max-w-md">
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <span aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M9.8 9.8L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </span>
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 pl-10 pr-10 surface surface-control rounded-full text-[0.86rem] outline-none transition-colors hover:border-faint focus:border-sage placeholder:text-faint"
        />
        {busy && (
          <span
            aria-hidden
            className="a-spin absolute right-4 top-1/2 -translate-y-1/2 size-3 rounded-full border-[1.5px] border-faint border-t-transparent"
          />
        )}
      </div>
      {children}
    </div>
  );
}

/** Compact select used for the order status / payment filters. */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="u-label">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 px-3 pr-7 surface surface-control rounded-full text-[0.84rem] outline-none cursor-pointer transition-colors hover:border-faint focus:border-sage"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
