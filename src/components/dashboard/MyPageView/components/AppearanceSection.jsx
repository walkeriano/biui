"use client";

import { useState } from "react";
import { inputClassName } from "@/components/dashboard/MyPageView/data";
import Field from "@/components/dashboard/MyPageView/components/Field";
import ImagePicker from "@/components/dashboard/MyPageView/components/ImagePicker";
import SectionHeader from "@/components/dashboard/MyPageView/components/SectionHeader";

export default function AppearanceSection({ data, handleImage, updateData }) {
  return (
    <article className="rounded-card border border-line bg-surface p-4 shadow-card">
      <SectionHeader
        number="1"
        title="Apariencia"
        description="Define los colores, tipografias y el estilo visual de tu pagina."
      />

      <div className="grid gap-5">
        <ImagePicker
          label="Logo de la empresa"
          image={data.logoImage}
          onChange={handleImage(
            (image) => updateData("logoImage", image),
            "brand/logo",
            "logoImage",
          )}
          onClear={() => updateData("logoImage", "")}
          hint="Se mostrara en el encabezado, confirmaciones y vista publica."
        />
        <ColorPicker
          label="Color principal"
          value={data.primaryColor}
          onChange={(color) => updateData("primaryColor", color)}
        />
        <ColorPicker
          label="Color secundario"
          value={data.secondaryColor}
          onChange={(color) => updateData("secondaryColor", color)}
        />
      </div>

      <div className="mt-5 grid gap-4">
        <Field label="Tipografia de titulos">
          <select
            value={data.titleFont}
            onChange={(event) => updateData("titleFont", event.target.value)}
            className={inputClassName}
          >
            <option>Playfair Display</option>
            <option>Georgia</option>
            <option>Inter</option>
          </select>
        </Field>
        <Field label="Tipografia de texto">
          <select
            value={data.textFont}
            onChange={(event) => updateData("textFont", event.target.value)}
            className={inputClassName}
          >
            <option>Inter</option>
            <option>Arial</option>
            <option>Georgia</option>
          </select>
        </Field>
        <Field label="Estilo de botones">
          <div className="grid gap-2">
            {["rounded", "square", "minimal"].map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => updateData("buttonStyle", style)}
                className={
                  data.buttonStyle === style
                    ? "rounded-md border border-success bg-success-soft px-3 py-2 text-[0.8125rem] font-bold text-success"
                    : "rounded-md border border-line px-3 py-2 text-[0.8125rem] font-bold text-muted"
                }
              >
                {style === "rounded"
                  ? "Redondeado"
                  : style === "square"
                    ? "Cuadrado"
                    : "Minimalista"}
              </button>
            ))}
          </div>
        </Field>
      </div>
    </article>
  );
}

function ColorPicker({ label, value, onChange }) {
  const [draftColor, setDraftColor] = useState(value);

  const selectColor = (color) => {
    setDraftColor(color);
    onChange(color);
  };

  const handleTextColorChange = (event) => {
    const nextColor = sanitizeHexColor(event.target.value);
    setDraftColor(nextColor);

    if (isValidHexColor(nextColor)) {
      selectColor(nextColor);
    }
  };

  return (
    <div>
      <p className="mb-3 text-[0.75rem] font-bold text-foreground">{label}</p>
      <div className="grid gap-3 rounded-card border border-line bg-surface-muted p-3">
        <label className="grid gap-2">
          <span className="text-[0.75rem] font-bold text-muted">
            Selector visual
          </span>
          <input
            type="color"
            value={value}
            onChange={(event) => selectColor(event.target.value)}
            className="h-12 w-full cursor-pointer rounded-md border border-line bg-surface p-1"
            aria-label={`Elegir ${label.toLowerCase()}`}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-[0.75rem] font-bold text-muted">
            Color exacto
          </span>
          <div className="flex items-center gap-2">
            <span
              className="size-10 shrink-0 rounded-md border border-line"
              style={{ backgroundColor: value }}
            />
            <input
              value={draftColor}
              onChange={handleTextColorChange}
              maxLength={7}
              className={inputClassName}
              aria-label={`Codigo hexadecimal de ${label.toLowerCase()}`}
            />
          </div>
        </label>
      </div>
    </div>
  );
}

function sanitizeHexColor(color) {
  const cleanColor = color.trim().replace(/[^a-fA-F0-9]/g, "");
  return `#${cleanColor.slice(0, 6)}`;
}

function isValidHexColor(color) {
  return /^#[0-9a-fA-F]{6}$/.test(color);
}
