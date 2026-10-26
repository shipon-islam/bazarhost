"use client";

import { ArrowLeft, ArrowRight, ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Multi/single image picker with preview, reorder (←/→ buttons: keyboard friendly) and remove.
 *
 * MOCK: files become session-only `blob:` URLs: nothing is uploaded.
 * TODO(api): replace `URL.createObjectURL(file)` with an upload call that
 * returns the stored file's URL, and send those URLs to the backend.
 */
export function ImageUploader({
  value,
  onChange,
  max = 8,
  label,
  error,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  label: string;
  error?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setProblem(null);
    const room = max - value.length;
    const next: string[] = [];
    for (const file of Array.from(files)) {
      if (next.length >= room) {
        setProblem(`You can add up to ${max} image${max === 1 ? "" : "s"}.`);
        break;
      }
      if (!ACCEPT.includes(file.type)) {
        setProblem(`"${file.name}" isn't a supported image (use JPG, PNG, WebP or GIF).`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        setProblem(`"${file.name}" is larger than 5 MB.`);
        continue;
      }
      next.push(URL.createObjectURL(file));
    }
    if (next.length > 0) onChange(max === 1 ? next.slice(0, 1) : [...value, ...next]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (index: number) => {
    const url = value[index];
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    onChange(value.filter((_, i) => i !== index));
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    const [item] = next.splice(index, 1);
    if (item === undefined) return;
    next.splice(target, 0, item);
    onChange(next);
  };

  const canAdd = value.length < max || max === 1;
  const message = error ?? problem;

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" aria-label={label}>
        {value.map((url, i) => (
          <li key={url} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <Image
              src={url}
              alt={`${label} ${i + 1}`}
              width={200}
              height={200}
              unoptimized
              className="aspect-square h-auto w-full object-cover"
            />
            {i === 0 && max > 1 && (
              <span className="absolute left-2 top-2 rounded-md bg-gray-900/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
                Cover
              </span>
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove image ${i + 1}`}
              className="absolute right-2 top-2 rounded-full bg-white/95 p-1 text-gray-700 shadow hover:bg-red-50 hover:text-red-700"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
            {max > 1 && value.length > 1 && (
              <div className="absolute inset-x-2 bottom-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move image ${i + 1} earlier`}
                  className="rounded-full bg-white/95 p-1 text-gray-700 shadow hover:bg-gray-100 disabled:opacity-40"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === value.length - 1}
                  aria-label={`Move image ${i + 1} later`}
                  className="rounded-full bg-white/95 p-1 text-gray-700 shadow hover:bg-gray-100 disabled:opacity-40"
                >
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            )}
          </li>
        ))}
        {canAdd && (
          <li>
            <label
              htmlFor={inputId}
              className={cn(
                "flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 focus-within:border-brand-500",
              )}
            >
              <ImagePlus className="h-6 w-6" aria-hidden />
              <span className="text-xs font-medium">{max === 1 && value.length > 0 ? "Replace" : "Add image"}</span>
              <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept={ACCEPT.join(",")}
                multiple={max > 1}
                className="sr-only"
                onChange={(e) => addFiles(e.target.files)}
              />
            </label>
          </li>
        )}
      </ul>
      <p className="mt-2 text-xs text-gray-500">
        JPG, PNG, WebP or GIF · up to 5 MB each{max > 1 ? ` · up to ${max} images · first image is the cover` : ""}.
      </p>
      {message && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {message}
        </p>
      )}
    </div>
  );
}
