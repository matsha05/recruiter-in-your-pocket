"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { PocketMark } from "@/components/icons";

import LandingContent from "@/components/landing/LandingContent";
import { LandingDataDriven } from "@/components/landing-showcase/LandingDataDriven";

const landingPages = [
  {
    id: "prod",
    name: "★ Production (Live)",
    description: "The current production landing page.",
    tags: ["Live"],
    component: LandingContent,
  },
  {
    id: "original",
    name: "Original (Standalone)",
    description: "The original design without production wiring.",
    tags: ["Reference"],
    component: LandingDataDriven,
  },
];

export default function LandingOptionsClient() {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const selectedLanding = landingPages.find((p) => p.id === selectedPage);
  const currentIndex = landingPages.findIndex((p) => p.id === selectedPage);

  const goToNext = useCallback(() => {
    if (currentIndex < landingPages.length - 1) {
      setSelectedPage(landingPages[currentIndex + 1].id);
    }
  }, [currentIndex]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setSelectedPage(landingPages[currentIndex - 1].id);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPage) return;
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape") setSelectedPage(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPage, goToPrev, goToNext]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <PocketMark className="h-6 w-6 text-teal-600" />
            <div>
              <h1 className="font-semibold">Landing Page</h1>
              <p className="text-xs text-slate-500">Production Ready vs Reference</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {landingPages.map((page, index) => (
            <motion.button
              key={page.id}
              onClick={() => setSelectedPage(page.id)}
              className={`group rounded-xl border-2 bg-white p-6 text-left transition-all ${
                page.id === "prod"
                  ? "border-teal-500 shadow-lg shadow-teal-500/10"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="mb-3 flex items-center gap-2">
                {page.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                      tag === "Ship" || tag === "Wired"
                        ? "bg-teal-100 text-teal-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3
                className={`mb-1 text-lg font-semibold ${
                  page.id === "prod" ? "text-teal-700" : "transition-colors group-hover:text-teal-600"
                }`}
              >
                {page.name}
              </h3>
              <p className="text-sm text-slate-500">{page.description}</p>
            </motion.button>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {selectedLanding && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="fixed left-4 right-4 top-4 z-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedPage(null)}
                  className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
                <span className="ml-2 font-medium text-white">{selectedLanding.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrev}
                  disabled={currentIndex === 0}
                  className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20 disabled:opacity-30"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={goToNext}
                  disabled={currentIndex === landingPages.length - 1}
                  className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20 disabled:opacity-30"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            <motion.div
              className="fixed inset-4 top-16 overflow-hidden rounded-xl bg-white"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="h-full overflow-auto">
                <selectedLanding.component />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
