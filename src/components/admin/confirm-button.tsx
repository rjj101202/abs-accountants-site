"use client";

export function ConfirmButton({
  message,
  className,
  children,
  formAction,
}: {
  message: string;
  className?: string;
  children: React.ReactNode;
  formAction?: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <button
      type="submit"
      className={className}
      formAction={formAction}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
