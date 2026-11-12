import { Fraunces, DM_Mono } from "next/font/google";

// The Arrival pairing: Fraunces (optical sizes) for the display and reading voice, DM Mono for labels and numbers.
export const serif = Fraunces({ subsets: ["latin"], variable: "--f-serif", display: "swap", axes: ["opsz"] });
export const mono = DM_Mono({ subsets: ["latin"], variable: "--f-mono", display: "swap", weight: ["400", "500"] });
// Japanese text uses the system Mincho (Hiragino on Apple, Yu Mincho on Windows): no download, and it sits beside
// Fraunces. A web Mincho cost 500 KB per page.
export const fontVars = [serif.variable, mono.variable].join(" ");
