import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const control =
  "w-full bg-transparent text-ink text-[0.92rem] border-0 border-b border-line " +
  "py-2 px-0.5 outline-none transition-colors duration-200 " +
  "hover:border-faint focus:border-sage focus:ring-0 " +
  "placeholder:text-faint disabled:opacity-50";

interface Wrap {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (id: string, describedBy?: string) => ReactNode;
}

/** Shared label/hint/error chrome so every control is announced identically. */
function FieldShell({ label, hint, error, required, children }: Wrap) {
  const id = useId();
  const messageId = error || hint ? `${id}-msg` : undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="u-label">
        {label}
        {required && (
          <span aria-hidden className="text-clay ml-1">
            *
          </span>
        )}
      </label>
      {children(id, messageId)}
      {(error || hint) && (
        <p
          id={messageId}
          className={cn("text-[0.74rem] mt-0.5", error ? "text-danger" : "text-muted")}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}

interface TextProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  hint?: string;
  error?: string;
}

export function TextField({ label, hint, error, className, ...rest }: TextProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={rest.required}>
      {(id, describedBy) => (
        <input
          {...rest}
          id={id}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(control, error && "border-danger", className)}
        />
      )}
    </FieldShell>
  );
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  label: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function SelectField({
  label,
  hint,
  error,
  options,
  className,
  ...rest
}: SelectProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={rest.required}>
      {(id, describedBy) => (
        <select
          {...rest}
          id={id}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(control, "cursor-pointer", error && "border-danger", className)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

/** Two-up / three-up row that collapses to a stack on small screens. */
export function FieldRow({
  cols = 2,
  children,
}: {
  cols?: 2 | 3;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid gap-x-6 gap-y-5",
        cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3",
      )}
    >
      {children}
    </div>
  );
}
