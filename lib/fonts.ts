import { Fraunces, DM_Mono, Shippori_Mincho } from "next/font/google";

// The Arrival pairing: Fraunces (optical sizes) for the display and reading voice, DM Mono for labels and numbers.
export const serif = Fraunces({ subsets: ["latin"], variable: "--f-serif", display: "swap", axes: ["opsz"] });
export const mono = DM_Mono({ subsets: ["latin"], variable: "--f-mono", display: "swap", weight: ["400", "500"] });
// Japanese text falls back to a Mincho that sits beside Fraunces.
export const ja = Shippori_Mincho({ subsets: ["latin"], variable: "--f-ja", display: "swap", weight: ["400", "500", "600"], preload: false });

export const fontVars = [serif.variable, mono.variable, ja.variable].join(" ");
