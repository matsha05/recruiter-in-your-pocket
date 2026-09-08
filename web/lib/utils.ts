import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Keep our semantic type sizes when a component also supplies a text color.
// Unknown `text-*` names otherwise get mistaken for competing color utilities.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [
        "page-title", "section-title", "workspace-title", "report-title",
        "verdict", "eyebrow", "control", "prose", "label", "data",
      ] }],
      "max-w": [{ "max-w": ["marketing", "workspace", "form", "report", "auth", "account", "reading"] }],
      rounded: [{ rounded: ["sheet", "inset"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
