import { useId } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
export type DSButtonVariant = "primary" | "secondary" | "ghost";
export interface DSButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: DSButtonVariant;
  icon?: LucideIcon;
}
export function DSButton({
  variant = "secondary", icon: Icon, className = "", children, ...rest
}: DSButtonProps) {
  return <button type="button" {...rest} className={"ds-button ds-button--" + variant + " " + className}>
    {Icon && <Icon size={18} strokeWidth={1.8} aria-hidden="true" />}
    {children}
  </button>;
}
export function DSCard({className = "", ...rest}: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={"ds-card " + className}/>;
}
export interface DSFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}
export function DSField({label, error, id, className = "", ...rest}: DSFieldProps) {
  const fieldId = id || useId();
  const errorId = fieldId + "-error";
  return <div className={"ds-field " + className}>
    <label htmlFor={fieldId}>{label}</label>
    <input {...rest} id={fieldId} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : rest["aria-describedby"]}/>
    {error && <p id={errorId} role="alert">{error}</p>}
  </div>;
}
