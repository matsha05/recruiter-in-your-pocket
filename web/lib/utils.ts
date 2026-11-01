import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Keep our semantic type sizes when a component also supplies a text color.
// Unknown `text-*` names otherwise get mistaken for competing color utilities.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Type roles from tailwind.config.js, plus the two deprecated aliases still in use.
      "font-size": [{ text: [
        "display", "headline", "title", "heading", "lead", "prose", "body", "small", "label",
        "verdict", "note", "report-title", "data",
      ] }],
      "max-w": [{ "max-w": ["marketing", "workspace", "form", "report", "auth", "account", "reading"] }],
      rounded: [{ rounded: ["sheet", "inset"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
