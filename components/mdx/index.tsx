import { Figure, Note, Correction, makeH2, H3, Table } from "./Blocks";
import { Term } from "./Term";
import { Stat, Sketch, CardList, TokenReturns, KeySplit, SeamDiagram, AgentGain } from "@/components/viz/Inline";
import dynamic from "next/dynamic";

// Each figure is its own chunk: a post downloads only the figures it uses.
const HybridStack = dynamic(() => import("@/components/viz/HybridStack").then((m) => m.HybridStack));
const TonnLayer = dynamic(() => import("@/components/viz/TonnLayer").then((m) => m.TonnLayer));
const CircuitMenu = dynamic(() => import("@/components/viz/CircuitMenu").then((m) => m.CircuitMenu));
const SwarmBoard = dynamic(() => import("@/components/viz/SwarmBoard").then((m) => m.SwarmBoard));
const RetrievalFlow = dynamic(() => import("@/components/viz/RetrievalFlow").then((m) => m.RetrievalFlow));
const RelayChart = dynamic(() => import("@/components/viz/SmallCharts").then((m) => m.RelayChart));
const SwarmTextChart = dynamic(() => import("@/components/viz/SmallCharts").then((m) => m.SwarmTextChart));
const LookupChart = dynamic(() => import("@/components/viz/SmallCharts").then((m) => m.LookupChart));
const TokenizerChart = dynamic(() => import("@/components/viz/SmallCharts").then((m) => m.TokenizerChart));
const HitRate = dynamic(() => import("@/components/viz/SmallCharts").then((m) => m.HitRate));
const EqualCompute = dynamic(() => import("@/components/viz/EqualCompute").then((m) => m.EqualCompute));
const LossCurves = dynamic(() => import("@/components/viz/LossCurves").then((m) => m.LossCurves));
const SpeedBars = dynamic(() => import("@/components/viz/SpeedBars").then((m) => m.SpeedBars));
const SweepTimeline = dynamic(() => import("@/components/viz/SweepTimeline").then((m) => m.SweepTimeline));
import type { Lang } from "@/lib/i18n";

type P = Record<string, unknown>;

/** The components a post can use, bound to the page language. */
export function mdxComponents(lang: Lang, order: string[] = []) {
  const withLang =
    <T extends React.ComponentType<any>>(C: T) => // eslint-disable-line @typescript-eslint/no-explicit-any
    (p: P) => <C {...(p as any)} lang={lang} />; // eslint-disable-line @typescript-eslint/no-explicit-any
  return {
    h2: makeH2(order),
    h3: H3,
    table: Table,
    Figure: withLang(Figure),
    Note,
    Correction,
    Term: withLang(Term),
    Stat,
    Sketch,
    CardList,
    TokenReturns: withLang(TokenReturns),
    KeySplit: withLang(KeySplit),
    SeamDiagram: withLang(SeamDiagram),
    AgentGain: withLang(AgentGain),
    HybridStack: withLang(HybridStack),
    TonnLayer: withLang(TonnLayer),
    CircuitMenu: withLang(CircuitMenu),
    SwarmBoard: withLang(SwarmBoard),
    RetrievalFlow: withLang(RetrievalFlow),
    RelayChart: withLang(RelayChart),
    SwarmTextChart: withLang(SwarmTextChart),
    LookupChart: withLang(LookupChart),
    TokenizerChart: withLang(TokenizerChart),
    HitRate: withLang(HitRate),
    EqualCompute: withLang(EqualCompute),
    LossCurves: withLang(LossCurves),
    SpeedBars: withLang(SpeedBars),
    SweepTimeline: withLang(SweepTimeline),
  };
}
