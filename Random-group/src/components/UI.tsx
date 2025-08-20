import { PropsWithChildren } from "react";

export function Page({ children }: PropsWithChildren) {
  return <main className="container">{children}</main>;
}

export function Button(
  {
    kind = "default",
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { kind?: "default" | "primary" | "warn" }
) {
  return <button className={`btn ${kind}`} {...props} />;
}

export function InputLabel({ label, children }: PropsWithChildren<{ label: string }>) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}