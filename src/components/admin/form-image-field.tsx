"use client";

import { useState } from "react";
import { ImageField } from "./image-field";

// Afbeeldingsveld voor gewone formulieren: de gekozen URL gaat mee als
// hidden input onder de opgegeven naam.
export function FormImageField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <>
      <input type="hidden" name={name} value={value} />
      <ImageField label={label} value={value} onChange={(v) => setValue(String(v))} />
    </>
  );
}
