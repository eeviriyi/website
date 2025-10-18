import type { MDXComponents } from "mdx/types";
import GaussianCurve from "./Build-An-OKLCH-Color-Palette/GaussianCurve.tsx";
import OKLCHColorPalette from "./Build-An-OKLCH-Color-Palette/OKLCHColorPalette.tsx";
import SigmoidFunction from "./Build-An-OKLCH-Color-Palette/SigmoidFunction.tsx";
import LiquidGlass, { GlassControlsConnector } from "./Luquid-Glass-Live-Demo/LiquidGlass.tsx";

export const mdxComponents: MDXComponents = {
    GaussianCurve: GaussianCurve,
    GlassControlsConnector: GlassControlsConnector,
    LiquidGlass: LiquidGlass,
    OKLCHColorPalette: OKLCHColorPalette,
    SigmoidFunction: SigmoidFunction,
};
