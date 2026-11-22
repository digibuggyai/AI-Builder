"use client";

import type { Selection } from "@pcb/shared";
import { FileText, ImageUp, Loader2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { requestImport, type ImportResponse } from "@/lib/api";

type Tab = "text" | "image";
type State =
  | { status: "idle" }
  | { status: "busy" }
  | { status: "error"; message: string }
  | { status: "done"; result: ImportResponse };

const MAX_FILE_BYTES = 15 * 1024 * 1024;

async function toJpegBase64(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.88).split(",")[1]!;
}

const PLACEHOLDER = `Paste a parts list or a shop quote, for example:

Ryzen 7 7800X3D
MSI B650M Gaming Plus WiFi
Corsair Vengeance RGB 32GB DDR5 6000
Asus Prime RTX 5070 12GB
Samsung 990 Pro 2TB
Corsair RM850e`;

export function ImportPanel({ onImport }: { onImport: (selection: Selection) => void }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [state, setState] = useState<State>({ status: "idle" });

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => {
      URL.revokeObjectURL(url);
      setPreview(null);
    };
  }, [file]);

  useEffect(() => {
    if (!open) return;
    function onPaste(e: ClipboardEvent) {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith("image/"));
      const pasted = item?.getAsFile();
      if (pasted) {
        e.preventDefault();
        choose(pasted);
        setTab("image");
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [open]);

  function choose(next: File) {
    if (!next.type.startsWith("image/")) {
      setState({ status: "error", message: "That file isn't an image. Use a PNG, JPG or screenshot." });
      return;
    }
    if (next.size > MAX_FILE_BYTES) {
      setState({ status: "error", message: "That image is over 15 MB. Try a screenshot instead." });
      return;
    }
    setFile(next);
    setState({ status: "idle" });
  }

  async function submit() {
    setState({ status: "busy" });
    try {
      const result =
        tab === "text"
          ? await requestImport({ text })
          : await requestImport({ imageBase64: await toJpegBase64(file!), mediaType: "image/jpeg" });
      if (result.matched > 0) onImport(result.selection);
      setState({ status: "done", result });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Import failed. Try again." });
    }
  }

  const canSubmit = state.status !== "busy" && (tab === "text" ? text.trim().length >= 3 : file != null);

  return (
    <section className="rounded-xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
      >
        <span className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-accent-tint text-accent-text">
            <Upload className="size-4" aria-hidden />
          </span>
          <span>
            <span className="block font-medium">Import a build list</span>
            <span className="block text-sm text-muted">Paste a quote, or upload a screenshot or photo. We&apos;ll fill in the parts.</span>
          </span>
        </span>
        <span className="shrink-0 text-sm font-medium text-accent-text">{open ? "Close" : "Import"}</span>
      </button>

      {open && (
        <div className="step-in border-t border-border p-4">
          <div role="tablist" aria-label="Import from" className="inline-flex rounded-lg bg-surface-2 p-1 text-sm">
            {(
              [
                ["text", "Paste text", FileText],
                ["image", "Upload image", ImageUp],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
                  tab === id ? "bg-surface shadow-sm" : "text-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-4" aria-hidden /> {label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {tab === "text" ? (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={PLACEHOLDER}
                rows={8}
                aria-label="Parts list"
                className="w-full resize-y btn-secondary rounded-xl bg-background p-3 tabular-nums text-sm outline-none placeholder:text-muted focus:border-accent"
              />
            ) : preview ? (
              <div className="relative inline-block">
                <img src={preview} alt="Your build list" className="max-h-72 rounded-lg border border-border object-contain" />
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  aria-label="Remove image"
                  className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-black/70 text-white hover:bg-black"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const dropped = e.dataTransfer.files[0];
                  if (dropped) choose(dropped);
                }}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
                  dragging ? "border-accent bg-accent-tint" : "border-border-strong hover:border-accent"
                }`}
              >
                <ImageUp className="size-8 text-muted" aria-hidden />
                <span className="font-medium">Drop an image here, or click to choose</span>
                <span className="text-sm text-muted">Screenshot, photo of a quote, or invoice. You can also press Ctrl+V.</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const picked = e.target.files?.[0];
                    if (picked) choose(picked);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted">We only use it to read the parts. It isn&apos;t saved.</p>
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium"
            >
              {state.status === "busy" && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {state.status === "busy" ? "Reading your list…" : "Import and fill"}
            </button>
          </div>

          <div aria-live="polite">
            {state.status === "error" && <p className="mt-4 text-sm text-error">{state.message}</p>}
            {state.status === "done" && (
              <div className="mt-4 rounded-lg border border-border bg-background p-3 text-sm">
                {state.result.matched > 0 ? (
                  <p className="font-medium text-ok">
                    ✓ Filled {state.result.matched} part{state.result.matched === 1 ? "" : "s"}. Check them below.
                  </p>
                ) : (
                  <p className="font-medium text-error">We couldn&apos;t match any parts to our catalogue.</p>
                )}
                {state.result.unmatched.length > 0 && (
                  <>
                    <p className="mt-2 text-muted">Not in our catalogue yet, pick these yourself:</p>
                    <ul className="mt-1 list-inside list-disc tabular-nums text-xs">
                      {state.result.unmatched.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </>
                )}
                {state.result.extras.length > 0 && (
                  <>
                    <p className="mt-2 text-muted">Also in your list (the builder holds one of each part type):</p>
                    <ul className="mt-1 list-inside list-disc tabular-nums text-xs">
                      {state.result.extras.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
