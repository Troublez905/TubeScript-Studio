"use client";

import {
  BarChart3,
  Bell,
  BookOpen,
  Check,
  Clapperboard,
  Clipboard,
  Download,
  FileText,
  Film,
  Lightbulb,
  Library,
  Loader2,
  Menu,
  Play,
  RefreshCcw,
  Search,
  Settings,
  Sparkles,
  Timer,
  Wand2
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { exportMarkdown, exportTeleprompter } from "@/lib/export";
import { formatLabel, wordsAndMinutes } from "@/lib/studio-data";
import type { Angle, ProductionPack, ProjectInput, VideoMode } from "@/lib/types";

const niches = [
  "Tech & Reviews",
  "Cybersecurity",
  "Gaming",
  "Tutorials",
  "Storytelling/Vlog",
  "Business/Finance"
];

type StudioState = {
  input: ProjectInput;
  angles: Angle[];
  selectedAngle: Angle | null;
  production: ProductionPack | null;
  setInput: (input: Partial<ProjectInput>) => void;
  setAngles: (angles: Angle[]) => void;
  selectAngle: (angle: Angle) => void;
  setProduction: (production: ProductionPack) => void;
  reset: () => void;
};

const initialInput: ProjectInput = {
  mode: "short",
  niche: "Cybersecurity",
  topic: "Best hardware security keys in 2026"
};

const useStudio = create<StudioState>()(
  persist(
    (set) => ({
      input: initialInput,
      angles: [],
      selectedAngle: null,
      production: null,
      setInput: (input) => set((state) => ({ input: { ...state.input, ...input } })),
      setAngles: (angles) => set({ angles, selectedAngle: null, production: null }),
      selectAngle: (angle) => set({ selectedAngle: angle }),
      setProduction: (production) => set({ production }),
      reset: () => set({ input: initialInput, angles: [], selectedAngle: null, production: null })
    }),
    { name: "tubescript-studio-v1" }
  )
);

export default function Home() {
  const { input, angles, selectedAngle, production, setInput, setAngles, selectAngle, setProduction, reset } = useStudio();
  const [loadingAngles, setLoadingAngles] = useState(false);
  const [loadingProduction, setLoadingProduction] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const scriptStats = useMemo(() => {
    const script = production?.storyboard.map((block) => block.script).join(" ") ?? "";
    return wordsAndMinutes(script);
  }, [production]);

  async function generateAngles() {
    setLoadingAngles(true);
    try {
      const response = await fetch("/api/angles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const data = (await response.json()) as { angles: Angle[] };
      setAngles(data.angles);
    } finally {
      setLoadingAngles(false);
    }
  }

  async function buildStoryboard(angle: Angle) {
    selectAngle(angle);
    setLoadingProduction(true);
    try {
      const response = await fetch("/api/storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ angle, input })
      });
      const data = (await response.json()) as { production: ProductionPack };
      setProduction(data.production);
    } finally {
      setLoadingProduction(false);
    }
  }

  async function copyText(label: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1400);
  }

  const markdown = exportMarkdown(selectedAngle, production);
  const teleprompter = exportTeleprompter(production);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,21,40,0.2),transparent_30%),radial-gradient(circle_at_70%_0%,rgba(40,184,255,0.08),transparent_24%),linear-gradient(145deg,#030406_0%,#0a0d14_48%,#05050a_100%)] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-white/10 bg-black/35 px-4 py-5 lg:block">
          <div className="mb-8">
            <Image
              src="/brand/tubescript-studio-logo-header.png"
              alt="TubeScript Studio"
              width={310}
              height={103}
              priority
              className="h-auto w-full object-contain drop-shadow-[0_0_22px_rgba(255,21,40,0.22)]"
            />
          </div>
          <nav className="space-y-1">
            {([
              [Clapperboard, "Dashboard", true],
              [Film, "Projects", false],
              [BarChart3, "Analytics", false],
              [Library, "Asset Library", false],
              [Settings, "Settings", false]
            ] satisfies [LucideIcon, string, boolean][]).map(([Icon, label, active]) => (
              <button
                key={label as string}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                  active ? "border border-studio-red/55 bg-studio-red/12 text-white shadow-redglow" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-studio-ink/88 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 lg:hidden">
                <Menu />
                <Image src="/brand/tubescript-studio-logo-header.png" alt="TubeScript Studio" width={190} height={63} className="h-9 w-auto object-contain" />
              </div>
              <div className="hidden max-w-xl flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-slate-400 md:flex">
                <Search size={17} />
                <span className="text-sm">Search projects, hooks, storyboards</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04]">
                  <Bell size={18} />
                </button>
                <button
                  onClick={reset}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
                >
                  Reset
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
            <section className="mb-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="mb-4 hidden max-w-[420px] lg:block">
                  <Image
                    src="/brand/tubescript-studio-logo-header.png"
                    alt="TubeScript Studio"
                    width={620}
                    height={207}
                    priority
                    className="h-auto w-full object-contain drop-shadow-[0_0_30px_rgba(255,21,40,0.24)]"
                  />
                </div>
                <p className="mb-2 text-xs uppercase tracking-[0.26em] text-studio-red">Creator production pipeline</p>
                <h1 className="max-w-3xl text-3xl font-black leading-tight text-white md:text-5xl">
                  Build the angle, research pack, script, and storyboard in one flow.
                </h1>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat label="Words" value={scriptStats.words.toString()} icon={<FileText size={18} />} />
                <Stat label="Speak Time" value={`${scriptStats.minutesLow}-${scriptStats.minutesHigh}m`} icon={<Timer size={18} />} />
                <Stat label="Format" value={formatLabel[input.mode]} icon={<Clapperboard size={18} />} />
              </div>
            </section>

            <Stepper hasAngles={angles.length > 0} hasProduction={Boolean(production)} />

            <section className="mt-6 grid gap-5 xl:grid-cols-[360px_1fr]">
              <ProjectPanel input={input} setInput={setInput} generateAngles={generateAngles} loading={loadingAngles} />

              <div className="space-y-5">
                <AngleGrid
                  angles={angles}
                  selectedAngle={selectedAngle}
                  loading={loadingAngles}
                  loadingProduction={loadingProduction}
                  onSelect={buildStoryboard}
                />

                {production && selectedAngle ? (
                  <ProductionWorkspace
                    angle={selectedAngle}
                    production={production}
                    copied={copied}
                    markdown={markdown}
                    teleprompter={teleprompter}
                    copyText={copyText}
                  />
                ) : null}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function ProjectPanel({
  input,
  setInput,
  generateAngles,
  loading
}: {
  input: ProjectInput;
  setInput: (input: Partial<ProjectInput>) => void;
  generateAngles: () => void;
  loading: boolean;
}) {
  return (
    <aside className="h-fit rounded-lg border border-white/10 bg-studio-panel/82 p-4 shadow-2xl shadow-black/20">
      <div className="mb-4 flex items-center gap-2">
        <Wand2 className="text-studio-red" size={20} />
        <h2 className="text-lg font-bold">Project Setup</h2>
      </div>

      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Mode</label>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {[
          ["short", "YouTube Short"],
          ["long", "Long-Form"]
        ].map(([mode, label]) => (
          <button
            key={mode}
            onClick={() => setInput({ mode: mode as VideoMode })}
            className={`rounded-lg border px-3 py-3 text-sm font-semibold ${
              input.mode === mode ? "border-studio-red bg-studio-red/18 text-white" : "border-white/10 bg-white/[0.03] text-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Genre / Niche</label>
      <select
        value={input.niche}
        onChange={(event) => setInput({ niche: event.target.value })}
        className="mb-3 w-full rounded-lg border border-white/10 bg-studio-panel2 px-3 py-3 text-sm outline-none ring-studio-cyan/30 focus:ring-4"
      >
        {niches.map((niche) => (
          <option key={niche}>{niche}</option>
        ))}
      </select>

      <input
        value={input.customNiche ?? ""}
        onChange={(event) => setInput({ customNiche: event.target.value })}
        placeholder="Custom niche"
        className="mb-4 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-sm outline-none ring-studio-cyan/30 placeholder:text-slate-500 focus:ring-4"
      />

      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Seed Topic</label>
      <textarea
        value={input.topic ?? ""}
        onChange={(event) => setInput({ topic: event.target.value })}
        rows={4}
        placeholder="Enter a rough topic or leave blank for Surprise Me."
        className="mb-4 w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-sm outline-none ring-studio-cyan/30 placeholder:text-slate-500 focus:ring-4"
      />

      <button
        onClick={generateAngles}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-studio-red px-4 py-3 font-bold text-white shadow-redglow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
        {input.topic?.trim() ? "Generate 5 Angles" : "Surprise Me"}
      </button>
    </aside>
  );
}

function Stepper({ hasAngles, hasProduction }: { hasAngles: boolean; hasProduction: boolean }) {
  const steps = [
    [Lightbulb, "Ideation", true],
    [Search, "Context & Research", hasAngles],
    [BookOpen, "Storyboard & Script", hasProduction],
    [RefreshCcw, "Review & Loop", hasProduction]
  ] satisfies [LucideIcon, string, boolean][];

  return (
    <div className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.035] p-2 md:grid-cols-4">
      {steps.map(([Icon, label, active]) => (
        <div
          key={label as string}
          className={`flex items-center gap-3 rounded-md px-3 py-3 ${active ? "bg-studio-red/12 text-white" : "text-slate-500"}`}
        >
          <Icon size={18} className={active ? "text-studio-red" : ""} />
          <span className="text-sm font-bold uppercase tracking-[0.12em]">{label}</span>
        </div>
      ))}
    </div>
  );
}

function AngleGrid({
  angles,
  selectedAngle,
  loading,
  loadingProduction,
  onSelect
}: {
  angles: Angle[];
  selectedAngle: Angle | null;
  loading: boolean;
  loadingProduction: boolean;
  onSelect: (angle: Angle) => void;
}) {
  if (loading) {
    return (
      <div className="grid min-h-[320px] place-items-center rounded-lg border border-white/10 bg-studio-panel/70">
        <Loader2 className="animate-spin text-studio-green" size={34} />
      </div>
    );
  }

  if (!angles.length) {
    return (
      <div className="grid min-h-[320px] place-items-center rounded-lg border border-dashed border-white/15 bg-studio-panel/55 p-8 text-center">
        <div>
          <Lightbulb className="mx-auto mb-3 text-studio-cyan" size={34} />
          <h2 className="mb-2 text-xl font-bold">Generate five production angles</h2>
          <p className="max-w-md text-sm text-slate-400">Use a niche, a seed idea, or let the app surprise you with hook-ready concepts.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      {angles.map((angle, index) => {
        const active = selectedAngle?.id === angle.id;
        return (
          <article
            key={angle.id}
            className={`flex min-h-[270px] flex-col rounded-lg border p-4 transition ${
              active ? "border-studio-red bg-studio-red/10 shadow-redglow" : "border-white/10 bg-studio-panel/82 hover:border-studio-red/50"
            }`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-bold text-slate-200">#{index + 1}</span>
              <span className="rounded-md border border-studio-cyan/30 bg-studio-cyan/10 px-2 py-1 text-xs font-bold text-studio-cyan">
                {angle.type}
              </span>
            </div>
            <h3 className="mb-3 text-xl font-black leading-snug text-white">{angle.title}</h3>
            <p className="mb-3 text-sm leading-6 text-slate-300">{angle.hook}</p>
            <p className="mb-4 text-sm text-slate-400">{angle.value}</p>
            <div className="mt-auto flex items-center justify-between gap-3">
              <span className="rounded-md bg-black/24 px-2 py-2 text-xs font-semibold text-slate-300">{formatLabel[angle.recommendedFormat]}</span>
              <button
                onClick={() => onSelect(angle)}
                disabled={loadingProduction}
                className="flex items-center gap-2 rounded-lg bg-studio-red px-3 py-2 text-sm font-black text-white hover:brightness-110 disabled:opacity-60"
              >
                {active ? <Check size={16} /> : <Clapperboard size={16} />}
                {active && loadingProduction ? "Building" : "Select Angle"}
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function ProductionWorkspace({
  angle,
  production,
  copied,
  markdown,
  teleprompter,
  copyText
}: {
  angle: Angle;
  production: ProductionPack;
  copied: string | null;
  markdown: string;
  teleprompter: string;
  copyText: (label: string, text: string) => void;
}) {
  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-white/10 bg-studio-panel/86 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-studio-red">Production pack</p>
            <h2 className="text-2xl font-black">{angle.title}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => copyText("Markdown", markdown)} className="actionButton">
              <Download size={16} /> {copied === "Markdown" ? "Copied" : "Markdown"}
            </button>
            <button onClick={() => copyText("Teleprompter", teleprompter)} className="actionButton">
              <Clipboard size={16} /> {copied === "Teleprompter" ? "Copied" : "Teleprompter"}
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <InfoList title="Core Knowledge" items={production.research.coreKnowledge} />
          <InfoList title="Media Ideas" items={production.research.mediaIdeas} />
          <InfoList title="Shorts Safe Zones" items={production.safeZoneGuide} />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-studio-panel/86">
        <div className="grid grid-cols-[120px_1.1fr_1.2fr_0.8fr] gap-0 border-b border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-400 max-xl:hidden">
          <span>Time</span>
          <span>Visual Direction</span>
          <span>Audio / Spoken Script</span>
          <span>Cue</span>
        </div>
        {production.storyboard.map((block) => (
          <div
            key={block.timestamp}
            className="grid gap-3 border-b border-white/10 px-4 py-4 last:border-b-0 xl:grid-cols-[120px_1.1fr_1.2fr_0.8fr]"
          >
            <div className="font-black text-studio-cyan">{block.timestamp}</div>
            <div>
              <p className="text-sm leading-6 text-slate-200">{block.visual}</p>
              <p className="mt-2 text-xs text-studio-amber">{block.retentionNote}</p>
            </div>
            <p className="text-sm leading-6 text-white">{block.script}</p>
            <span className="h-fit rounded-md border border-white/10 bg-black/20 px-2 py-2 text-xs font-bold text-slate-300">{block.voiceoverCue}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InfoList title="Reference Searches" items={production.research.references.map((item) => `${item.label}: ${item.query}`)} />
        <InfoList title="B-Roll & SFX" items={production.brollAndSfx} />
      </div>
    </section>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/18 p-4">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-slate-300">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-slate-300">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-studio-red" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <div className="mb-3 text-studio-cyan">{icon}</div>
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}
