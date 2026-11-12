import { Figure, Note, Correction, makeH2, H3, Table } from "./Blocks";
import { Term } from "./Term";
import { HybridStack } from "@/components/viz/HybridStack";
import { TonnLayer } from "@/components/viz/TonnLayer";
import { CircuitMenu } from "@/components/viz/CircuitMenu";
import { SwarmBoard } from "@/components/viz/SwarmBoard";
import { RetrievalFlow } from "@/components/viz/RetrievalFlow";
import { RelayChart, SwarmTextChart, LookupChart, TokenizerChart, HitRate } from "@/components/viz/SmallCharts";
import { EqualCompute } from "@/components/viz/EqualCompute";
import { LossCurves } from "@/components/viz/LossCurves";
import { SpeedBars } from "@/components/viz/SpeedBars";
import { SweepTimeline } from "@/components/viz/SweepTimeline";
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
