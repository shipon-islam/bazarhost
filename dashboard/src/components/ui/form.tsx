import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
  action,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
  /** Optional element shown on the label row's right side (e.g. "Regenerate"). */
  action?: ReactNode;
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
          {label}
          {required && (
            <span className="text-red-600" aria-hidden>
              {" "}
              *
            </span>
          )}
        </label>
        {action}
      </div>
      {children}
      {hint && !error && (
        <p id={`${htmlFor}-hint`} className="mt-1.5 text-xs text-gray-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

const controlBase =
  "block w-full rounded-lg border bg-white text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

function controlClass(error?: string, extra?: string): string {
  return cn(
    controlBase,
    error ? "border-red-400 focus:border-red-500" : "border-gray-300 hover:border-gray-400 focus:border-brand-500",
    extra,
  );
}

function aria(id: string | undefined, error: string | undefined, hint: boolean) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": id ? (error ? `${id}-error` : hint ? `${id}-hint` : undefined) : undefined,
  } as const;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  hasHint?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error, hasHint = false, className, id, ...rest },
  ref,
) {
  return <input ref={ref} id={id} className={controlClass(error, cn("h-10 px-3", className))} {...aria(id, error, hasHint)} {...rest} />;
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  hasHint?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { error, hasHint = false, className, id, rows = 4, ...rest },
  ref,
) {
  return <textarea ref={ref} id={id} rows={rows} className={controlClass(error, cn("px-3 py-2.5", className))} {...aria(id, error, hasHint)} {...rest} />;
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  hasHint?: boolean;
  /** "sm" is used in filter toolbars. */
  size?: never;
  compact?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { error, hasHint = false, className, id, compact, children, ...rest },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        id={id}
        className={controlClass(error, cn("appearance-none pr-9", compact ? "h-9 pl-3" : "h-10 pl-3", className))}
        {...aria(id, error, hasHint)}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
    </div>
  );
});

export const Checkbox = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "type">>(function Checkbox(
  { className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type="checkbox"
      className={cn("h-4 w-4 cursor-pointer rounded border-gray-300 text-brand-600 accent-[var(--color-brand-600)] disabled:cursor-not-allowed", className)}
      {...rest}
    />
  );
});

export function Switch({
  checked,
  onChange,
  label,
  id,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  /** Accessible name for the switch. */
  label: string;
  id?: string;
  disabled?: boolean;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-brand-600" : "bg-gray-300",
      )}
    >
      <span
        aria-hidden
        className={cn("inline-block h-5 w-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-5" : "translate-x-0.5")}
      />
    </button>
  );
}

/** Card wrapper used by forms and detail pages. */
export function Card({
  title,
  description,
  actions,
  children,
  className,
  padded = true,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={cn("rounded-xl border border-gray-200 bg-white shadow-sm", className)}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            {title && <h2 className="text-base font-semibold text-gray-900">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={padded ? "p-5" : undefined}>{children}</div>
    </section>
  );
}
