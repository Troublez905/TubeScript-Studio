"use client";

import {
  BarChart3,
  Bell,
  Bookmark,
  Check,
  ChevronRight,
  Clapperboard,
  Clipboard,
  Download,
  FileText,
  Flame,
  Grid2X2,
  History,
  ImageIcon,
  LayoutList,
  Lightbulb,
  Loader2,
  Menu,
  MonitorPlay,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  Shuffle,
  Sparkles,
  Star,
  Target,
  Timer,
  Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { exportMarkdown, exportTeleprompter } from "@/lib/export";
import { formatLabel, wordsAndMinutes } from "@/lib/studio-data";
import type { Angle, ProductionPack, ProjectInput } from "@/lib/types";

const niches = ["Tech & Reviews", "Cybersecurity", "Gaming", "Tutorials", "Storytelling/Vlog", "Business/Finance"];
const formatStyles = ["Tutorial", "Explainer", "Review", "Listicle", "Storytime", "Case Study"];
const suggestions = [
  ["Best beginner camera in 2026?", "Gear breakdown for first-time creators"],
  ["How to stay consistent on YouTube", "Workflow and schedule system"],
  ["Tools that actually help YouTubers grow", "Creator stack comparison"]
];
const navItems = [
  [Zap, "Create", true],
  [History, "History", false],
  [MonitorPlay, "My Videos", false],
  [Grid2X2, "Popular Formats", false],
  [FileText, "Templates", false],
  [BarChart3, "Analytics", false],
  [Settings, "Settings", false]
] as const;

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
  const [activeTab, setActiveTab] = useState("layout");

  const scriptStats = useMemo(() => {
    const script = production?.storyboard.map((block) => block.script).join(" ") ?? "";
    return wordsAndMinutes(script);
  }, [production]);

  async function generateAngles(nextInput = input) {
    setLoadingAngles(true);
    try {
      const response = await fetch("/api/angles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextInput)
      });
      const data = (await response.json()) as { angles: Angle[] };
      setAngles(data.angles);
    } finally {
      setLoadingAngles(false);
    }
  }

  async function pickSuggestion(topic: string) {
    const nextInput = { ...input, topic };
    setInput({ topic });
    await generateAngles(nextInput);
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
      setActiveTab("layout");
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
    <main className="min-h-screen overflow-hidden bg-[#06111b] text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_35%_0%,rgba(255,42,62,0.18),transparent_24%),radial-gradient(circle_at_78%_18%,rgba(34,211,238,0.12),transparent_26%),linear-gradient(140deg,#07131f_0%,#06101a_45%,#03070d_100%)]" />
      <div className="flex min-h-screen">
        <Sidebar />
        <section className="min-w-0 flex-1">
          <TopBar reset={reset} />
          <div className="mx-auto max-w-[1420px] px-4 py-5 md:px-6">
            <WorkflowSteps hasAngles={angles.length > 0} hasProduction={Boolean(production)} />

            <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <GeneratorPanel input={input} setInput={setInput} generateAngles={() => generateAngles()} loading={loadingAngles} />
              <SmartSuggestions onPick={pickSuggestion} loading={loadingAngles} />
            </section>

            <AngleGrid angles={angles} selectedAngle={selectedAngle} loading={loadingAngles} loadingProduction={loadingProduction} onSelect={buildStoryboard} />

            {production && selectedAngle ? (
              <Blueprint
                angle={selectedAngle}
                production={production}
                copied={copied}
                markdown={markdown}
                teleprompter={teleprompter}
                copyText={copyText}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                regenerate={() => buildStoryboard(selectedAngle)}
                scriptStats={scriptStats}
                input={input}
              />
            ) : (
              <EmptyBlueprint />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Sidebar() {
  return (
    <aside className="hidden w-[238px] shrink-0 border-r border-sky-100/10 bg-[#081522]/95 px-3 py-4 shadow-[20px_0_55px_rgba(0,0,0,0.22)] lg:block">
      <div className="mb-6 flex items-center gap-3 px-2">
        <Image src="/brand/tubescript-studio-logo-header.png" alt="TubeScript Studio" width={184} height={61} priority className="h-12 w-auto object-contain" />
      </div>
      <nav className="space-y-2">
        {navItems.map(([Icon, label, active]) => (
          <button key={label} className={`navItem ${active ? "navItemActive" : ""}`}>
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-8 rounded-lg border border-sky-100/10 bg-[#0b1b2a] p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
          <Flame size={16} className="text-studio-red" />
          Popular Types
        </div>
        <div className="space-y-2">
          <span className="typePill bg-indigo-500/18 text-indigo-200 ring-indigo-400/35">Documentary</span>
          <span className="typePill bg-emerald-500/18 text-emerald-200 ring-emerald-400/35">Tutorial</span>
          <span className="typePill bg-orange-500/18 text-orange-200 ring-orange-400/35">Reaction</span>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ reset }: { reset: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-sky-100/10 bg-[#07131f]/92 px-4 py-4 backdrop-blur-xl md:px-6">
      <div className="mx-auto flex max-w-[1420px] items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Menu className="lg:hidden" size={22} />
          <div className="flex h-11 max-w-[630px] flex-1 items-center gap-3 rounded-lg border border-sky-100/15 bg-[#0b1c2d] px-4 text-slate-400 shadow-inner shadow-black/20">
            <Search size={18} />
            <span className="truncate text-sm">Search scripts, topics, or projects...</span>
            <kbd className="ml-auto hidden rounded-md bg-white/10 px-2 py-1 text-xs text-slate-300 sm:block">Ctrl K</kbd>
          </div>
        </div>
        <button className="hidden items-center gap-2 rounded-lg bg-studio-red px-5 py-3 text-sm font-black text-white shadow-redglow transition hover:brightness-110 sm:flex">
          <Plus size={17} />
          New Project
        </button>
        <button className="grid h-11 w-11 place-items-center rounded-lg border border-sky-100/10 bg-[#0b1c2d] text-slate-300">
          <Bell size={18} />
        </button>
        <button onClick={reset} className="rounded-lg border border-sky-100/10 bg-[#0b1c2d] px-3 py-2 text-sm font-bold text-slate-200">
          Reset
        </button>
      </div>
    </header>
  );
}

function WorkflowSteps({ hasAngles, hasProduction }: { hasAngles: boolean; hasProduction: boolean }) {
  const steps: [string, string, string, boolean][] = [
    ["1", "Topic", "Enter a topic or get suggestions", true],
    ["2", "Pick a Direction", "Choose 1 of 5 ideas", hasAngles],
    ["3", "Script & Storyboard", "Get your full video plan", hasProduction]
  ];

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
      {steps.map(([number, title, caption, active], index) => (
        <div key={title} className="contents">
          <div className="flex items-center gap-3">
            <div className={`stepNumber ${active ? "stepNumberActive" : ""}`}>{number}</div>
            <div>
              <p className="text-base font-black text-white">{title}</p>
              <p className="text-xs text-slate-400">{caption}</p>
            </div>
          </div>
          {index < steps.length - 1 ? <div className="hidden items-center text-slate-600 md:flex">→</div> : null}
        </div>
      ))}
    </div>
  );
}

function GeneratorPanel({
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
    <section className="panel p-5">
      <div className="mb-4 flex items-start gap-3">
        <Sparkles className="mt-1 text-studio-red" size={27} fill="currentColor" />
        <div>
          <h1 className="text-2xl font-black leading-tight md:text-3xl">Generate Your Next Video</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
            Enter a topic, or let TubeScript Studio suggest ideas based on what is trending, your niche, and proven formats.
          </p>
        </div>
      </div>
      <textarea
        value={input.topic ?? ""}
        onChange={(event) => setInput({ topic: event.target.value })}
        rows={4}
        maxLength={500}
        placeholder="What kind of video do you want to make? e.g. beginner camera guide, crypto update, small business tips"
        className="min-h-[112px] w-full resize-none rounded-lg border border-sky-100/15 bg-[#081522] px-4 py-4 text-sm text-white outline-none ring-studio-red/25 placeholder:text-slate-500 focus:border-studio-red/60 focus:ring-4"
      />
      <div className="mt-2 text-right text-xs text-slate-500">{input.topic?.length ?? 0}/500</div>
      <div className="mt-2 grid gap-3 xl:grid-cols-[1fr_230px]">
        <div>
          <p className="mb-2 text-xs font-bold text-slate-300">Video style / genre</p>
          <div className="flex flex-wrap gap-2">
            {formatStyles.map((style, index) => (
              <button key={style} className={`formatChip ${index === 0 ? "formatChipActive" : ""}`}>
                {index === 0 ? <Clapperboard size={14} /> : index === 2 ? <Star size={14} /> : <LayoutList size={14} />}
                {style}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold text-slate-300">Niche</p>
          <select
            value={input.niche}
            onChange={(event) => setInput({ niche: event.target.value })}
            className="h-10 w-full rounded-lg border border-sky-100/15 bg-[#081522] px-3 text-sm text-slate-200 outline-none"
          >
            {niches.map((niche) => (
              <option key={niche}>{niche}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateAngles} disabled={loading} className="primaryButton min-w-[245px]">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          Generate 5 Ideas
        </button>
        <button onClick={generateAngles} disabled={loading} className="secondaryButton min-w-[210px]">
          <Shuffle size={18} />
          Pick For Me
        </button>
      </div>
    </section>
  );
}

function SmartSuggestions({ onPick, loading }: { onPick: (topic: string) => void; loading: boolean }) {
  return (
    <aside className="panel p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb size={20} className="text-amber-300" fill="currentColor" />
          <h2 className="font-black">Smart Suggestions</h2>
        </div>
        <button className="text-xs font-bold text-sky-300">See more →</button>
      </div>
      <p className="mb-4 text-sm text-slate-400">Not sure what to create? Try one of these:</p>
      <div className="space-y-3">
        {suggestions.map(([title, caption], index) => (
          <button key={title} onClick={() => onPick(title)} disabled={loading} className="suggestionRow">
            <div className={`suggestionThumb thumb${index + 1}`} />
            <div className="min-w-0 flex-1 text-left">
              <p className="line-clamp-2 text-sm font-black text-white">{title}</p>
              <p className="mt-1 truncate text-xs text-slate-400">{caption}</p>
            </div>
            <ChevronRight size={18} />
          </button>
        ))}
      </div>
    </aside>
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
  return (
    <section className="mt-5">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Target size={28} className="text-studio-red" />
            <h2 className="text-2xl font-black">Choose 1 of 5 Video Directions</h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">Pick one concept to create a full script and storyboard.</p>
        </div>
      </div>
      {loading ? (
        <div className="panel grid min-h-[245px] place-items-center">
          <Loader2 className="animate-spin text-studio-red" size={34} />
        </div>
      ) : angles.length ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {angles.map((angle, index) => (
            <AngleCard key={angle.id} angle={angle} index={index} active={selectedAngle?.id === angle.id} loading={loadingProduction} onSelect={onSelect} />
          ))}
        </div>
      ) : (
        <div className="panel grid min-h-[245px] place-items-center p-8 text-center">
          <div>
            <Target className="mx-auto mb-3 text-studio-red" size={38} />
            <h3 className="text-xl font-black">Generate five video directions</h3>
            <p className="mt-2 max-w-md text-sm text-slate-400">Your angle cards will appear here with format, hook, value, and storyboard actions.</p>
          </div>
        </div>
      )}
    </section>
  );
}

function AngleCard({
  angle,
  index,
  active,
  loading,
  onSelect
}: {
  angle: Angle;
  index: number;
  active: boolean;
  loading: boolean;
  onSelect: (angle: Angle) => void;
}) {
  return (
    <article className={`directionCard ${active ? "directionCardActive" : ""}`}>
      <div className="absolute left-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-studio-red text-lg font-black text-white shadow-redglow">
        {index + 1}
      </div>
      <div className={`ideaThumb ideaThumb${(index % 5) + 1}`}>
        <span>{angle.type}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-black leading-tight text-white">{angle.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-5 text-slate-300">{angle.hook}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="miniBadge">
            <Clapperboard size={13} />
            {formatLabel[angle.recommendedFormat]}
          </span>
          <span className="miniBadge">{angle.type}</span>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-400">Best for: {angle.value}</p>
        <button onClick={() => onSelect(angle)} disabled={loading} className="chooseButton mt-auto">
          {active && loading ? "Building" : "Choose This"}
          <ChevronRight size={16} />
        </button>
      </div>
    </article>
  );
}

function Blueprint({
  angle,
  production,
  copied,
  markdown,
  teleprompter,
  copyText,
  activeTab,
  setActiveTab,
  regenerate,
  scriptStats,
  input
}: {
  angle: Angle;
  production: ProductionPack;
  copied: string | null;
  markdown: string;
  teleprompter: string;
  copyText: (label: string, text: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  regenerate: () => void;
  scriptStats: { words: number; minutesLow: number; minutesHigh: number };
  input: ProjectInput;
}) {
  return (
    <section className="panel mt-5 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500 text-white">
            <Check size={23} />
          </div>
          <div>
            <h2 className="text-2xl font-black">Selected Video Blueprint</h2>
            <p className="mt-1 text-sm text-slate-400">
              Complete script, structure and storyboard for: <span className="text-slate-200">{angle.title}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={regenerate} className="secondaryButton px-3 py-2">
            <RefreshCcw size={16} />
            Regenerate
          </button>
          <button className="secondaryButton px-3 py-2">
            <Bookmark size={16} />
            Save Project
          </button>
          <button onClick={() => copyText("Markdown", markdown)} className="primaryButton px-3 py-2">
            <Download size={16} />
            {copied === "Markdown" ? "Copied" : "Export"}
          </button>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-4">
        {([
          ["layout", LayoutList, "Video Layout"],
          ["script", FileText, "Script"],
          ["storyboard", Grid2X2, "Storyboard"],
          ["assets", ImageIcon, "Assets & Thumbnail"]
        ] satisfies [string, LucideIcon, string][]).map(([id, Icon, label]) => (
          <button key={id as string} onClick={() => setActiveTab(id as string)} className={`blueprintTab ${activeTab === id ? "blueprintTabActive" : ""}`}>
            <Icon size={16} />
            {label as string}
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-3 xl:grid-cols-[0.8fr_1.05fr_0.95fr]">
        <StructurePanel production={production} stats={scriptStats} input={input} />
        <ScriptPanel production={production} copied={copied} copyText={copyText} teleprompter={teleprompter} />
        <StoryboardPanel production={production} />
      </div>
    </section>
  );
}

function StructurePanel({ production, stats, input }: { production: ProductionPack; stats: { words: number; minutesLow: number; minutesHigh: number }; input: ProjectInput }) {
  return (
    <div className="blueprintPanel">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-black">Video Structure</h3>
        <span className="miniBadge">
          <Timer size={13} />
          {stats.words} words
        </span>
      </div>
      <div className="space-y-3">
        {production.storyboard.map((block, index) => (
          <div key={block.timestamp} className="flex gap-3">
            <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-black ${index > 5 ? "bg-amber-500/80" : "bg-emerald-500/80"}`}>
              {index + 1}
            </div>
            <div>
              <p className="text-sm font-black text-white">{block.timestamp}</p>
              <p className="line-clamp-2 text-xs leading-5 text-slate-400">{block.retentionNote || block.voiceoverCue}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <StatTile label="Mode" value={formatLabel[input.mode]} />
        <StatTile label="Speak Time" value={`${stats.minutesLow}-${stats.minutesHigh}m`} />
      </div>
    </div>
  );
}

function ScriptPanel({
  production,
  copied,
  copyText,
  teleprompter
}: {
  production: ProductionPack;
  copied: string | null;
  copyText: (label: string, text: string) => void;
  teleprompter: string;
}) {
  return (
    <div className="blueprintPanel">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-black">Script Excerpt</h3>
        <button onClick={() => copyText("Teleprompter", teleprompter)} className="tinyButton">
          <Clipboard size={14} />
          {copied === "Teleprompter" ? "Copied" : "Copy All"}
        </button>
      </div>
      <div className="space-y-3">
        {production.storyboard.slice(0, 4).map((block) => (
          <article key={block.timestamp} className="scriptBlock">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-black text-white">{block.timestamp}</p>
              <span className="text-slate-500">...</span>
            </div>
            <p className="text-[11px] font-black uppercase tracking-wide text-sky-300">{block.voiceoverCue}</p>
            <p className="mt-1 line-clamp-4 text-xs leading-5 text-slate-300">{block.script}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function StoryboardPanel({ production }: { production: ProductionPack }) {
  return (
    <div className="blueprintPanel">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-black">Storyboard</h3>
        <button className="tinyButton">View All</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {production.storyboard.slice(0, 4).map((block, index) => (
          <article key={block.timestamp} className="storyTile">
            <div className={`storyThumb storyThumb${(index % 4) + 1}`} />
            <p className="mt-2 line-clamp-2 text-xs font-black text-white">
              {index + 1}. {block.timestamp}
            </p>
            <p className="mt-1 line-clamp-3 text-[11px] leading-4 text-slate-400">{block.visual}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function EmptyBlueprint() {
  return (
    <section className="panel mt-5 p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-700 text-slate-300">
          <FileText size={22} />
        </div>
        <div>
          <h2 className="text-xl font-black">Selected Video Blueprint</h2>
          <p className="mt-1 text-sm text-slate-400">Choose a direction to unlock the script, storyboard, research notes, assets, exports, and teleprompter text.</p>
        </div>
      </div>
    </section>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-sky-100/10 bg-[#07131f] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}
