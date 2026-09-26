import type { FormState } from "@/lib/forms";

type Props = {
  name: string;
  label: string;
  state?: FormState;
  hint?: string;
  optional?: boolean;
  as?: "input" | "textarea" | "select";
  children?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  React.SelectHTMLAttributes<HTMLSelectElement>;

/** Campo de formulario con label, error y valor previo (se conserva tras un envío con errores). */
export function Field({ name, label, state, hint, optional, as = "input", children, className, ...rest }: Props) {
  const error = state?.errors?.[name];
  const prev = state?.values?.[name];
  const defaultValue = typeof prev === "string" ? prev : (rest.defaultValue as string | undefined);
  const id = `f-${name}`;
  const common = {
    id,
    name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
    ...(rest.value !== undefined ? {} : { defaultValue }),
  };

  return (
    <div className={`tp-field ${className ?? ""}`}>
      <label className="tp-label" htmlFor={id}>
        {label} {optional && <small>(opcional)</small>}
      </label>
      {as === "textarea" ? (
        <textarea className="tp-textarea" {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} {...common} />
      ) : as === "select" ? (
        <select className="tp-select" {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)} {...common}>
          {children}
        </select>
      ) : (
        <input className="tp-input" {...(rest as React.InputHTMLAttributes<HTMLInputElement>)} {...common} />
      )}
      {hint && !error && (
        <span id={`${id}-hint`} className="tp-hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} className="tp-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
