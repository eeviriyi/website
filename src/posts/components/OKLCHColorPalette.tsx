"use client";

import type React from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

interface OKLCHColorPaletteProps {
  width?: number;
  height?: number;
  initialHue?: number;
  paletteSize?: number;
}

export default function OKLCHColorPalette({ width = 1000, height = 600, initialHue = 180, paletteSize = 12 }: OKLCHColorPaletteProps) {
  const [currentHue, setCurrentHue] = useState(initialHue);
  const [leftLightness, setLeftLightness] = useState(0.95);
  const [rightLightness, setRightLightness] = useState(0.38);
  const [chromaPercentage, setChromaPercentage] = useState(0.5);
  const [minChroma, setMinChroma] = useState(0.1);
  const [isMounted, setIsMounted] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const gridId = useId();
  const minX = 100;
  const maxX = 900;
  const centerX = 500;

  // 检测组件是否在客户端挂载
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 计算 OKLCH 颜色空间中给定 lightness 和 hue 下的理论最大 chroma
  const calculateMaxChroma = useCallback((l: number, h: number): number => {
    // 模拟不同色相的最大饱和度差异
    let hueMultiplier = 1;
    if (h >= 0 && h < 60) {
      // 红色到黄色区域，饱和度较高
      hueMultiplier = 0.9 + 0.1 * Math.sin((h / 60) * Math.PI);
    } else if (h >= 60 && h < 180) {
      // 黄色到青色区域
      hueMultiplier = 0.8 + 0.2 * Math.cos(((h - 60) / 120) * Math.PI);
    } else if (h >= 180 && h < 240) {
      // 青色到蓝色区域，饱和度中等
      hueMultiplier = 0.7 + 0.15 * Math.sin(((h - 180) / 60) * Math.PI);
    } else if (h >= 240 && h < 300) {
      // 蓝色到紫色区域
      hueMultiplier = 0.6 + 0.25 * Math.cos(((h - 240) / 60) * Math.PI);
    } else {
      // 紫色到红色区域
      hueMultiplier = 0.75 + 0.15 * Math.sin(((h - 300) / 60) * Math.PI);
    }

    // lightness 对最大 chroma 的影响（中间亮度饱和度最高）
    const lightnessMultiplier = 4 * l * (1 - l);

    // 基础最大 chroma 值
    const baseMaxChroma = 0.4;

    return baseMaxChroma * hueMultiplier * lightnessMultiplier;
  }, []);

  // 计算 sigmoid 函数参数
  const calculateSigmoidParams = useCallback(
    (y1: number, y2: number) => {
      const clampedY1 = Math.max(0.01, Math.min(0.99, y1));
      const clampedY2 = Math.max(0.01, Math.min(0.99, y2));

      const x1 = minX;
      const x2 = maxX;

      const logit1 = Math.log(clampedY1 / (1 - clampedY1));
      const logit2 = Math.log(clampedY2 / (1 - clampedY2));

      const a = (logit2 - logit1) / (x2 - x1);
      const b = logit1 - a * x1;

      return { a, b };
    },
    [minX, maxX],
  );

  // sigmoid 函数
  const sigmoid = useCallback((x: number, a: number, b: number) => {
    return 1 / (1 + Math.exp(-(a * x + b)));
  }, []);

  // 高斯函数
  const gaussian = useCallback((x: number, center: number, peak: number, sigma: number, baseline: number): number => {
    return baseline + peak * Math.exp(-((x - center) ** 2) / (2 * sigma ** 2));
  }, []);

  // 根据位置计算亮度值（使用 sigmoid）
  const calculateLightness = useCallback(
    (x: number): number => {
      const { a, b } = calculateSigmoidParams(leftLightness, rightLightness);
      return sigmoid(x, a, b);
    },
    [leftLightness, rightLightness, calculateSigmoidParams, sigmoid],
  );

  // 根据位置和亮度计算 chroma 值（使用高斯）
  const calculateChroma = useCallback(
    (x: number, lightness: number): number => {
      const maxChroma = calculateMaxChroma(lightness, currentHue);
      const peakValue = maxChroma * chromaPercentage;
      const sigma = (maxX - minX) / 6;

      return gaussian(x, centerX, peakValue, sigma, minChroma);
    },
    [currentHue, chromaPercentage, minChroma, maxX, minX, centerX, calculateMaxChroma, gaussian],
  );

  // 生成色卡颜色数组
  const generatePalette = useCallback((): Array<{ x: number; lightness: number; chroma: number; color: string }> => {
    if (!isMounted) return [];

    const palette = [];
    const step = (maxX - minX) / (paletteSize - 1);

    for (let i = 0; i < paletteSize; i++) {
      const x = minX + i * step;
      const lightness = calculateLightness(x);
      const chroma = calculateChroma(x, lightness);
      const color = `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${currentHue})`;

      palette.push({
        chroma: Number(chroma.toFixed(3)),
        color,
        lightness: Number(lightness.toFixed(3)),
        x: Math.round(x),
      });
    }

    return palette;
  }, [isMounted, paletteSize, minX, maxX, calculateLightness, calculateChroma, currentHue]);

  // 生成亮度曲线路径
  const generateLightnessPath = useCallback(() => {
    if (!isMounted) return "";

    const { a, b } = calculateSigmoidParams(leftLightness, rightLightness);
    const points: string[] = [];
    const lightnessHeight = height * 0.3; // 亮度图表占总高度的30%

    for (let x = minX; x <= maxX; x += 5) {
      const y = sigmoid(x, a, b);
      const svgX = Math.round(((x - minX) / (maxX - minX)) * (width - 80) + 40);
      const svgY = Math.round(lightnessHeight - 40 - y * (lightnessHeight - 80));

      if (points.length === 0) {
        points.push(`M ${svgX} ${svgY}`);
      } else {
        points.push(`L ${svgX} ${svgY}`);
      }
    }

    return points.join(" ");
  }, [isMounted, leftLightness, rightLightness, calculateSigmoidParams, sigmoid, minX, maxX, width, height]);

  // 生成 chroma 曲线路径
  const generateChromaPath = useCallback(() => {
    if (!isMounted) return "";

    const points: string[] = [];
    const lightnessHeight = height * 0.3;
    const chromaHeight = height * 0.3;
    const chromaStartY = lightnessHeight + 40;
    const sigma = (maxX - minX) / 6;

    for (let x = minX; x <= maxX; x += 5) {
      const lightness = calculateLightness(x);
      const maxChroma = calculateMaxChroma(lightness, currentHue);
      const peakValue = maxChroma * chromaPercentage;
      const chroma = gaussian(x, centerX, peakValue, sigma, minChroma);

      const svgX = Math.round(((x - minX) / (maxX - minX)) * (width - 80) + 40);
      const svgY = Math.round(chromaStartY + chromaHeight - 40 - (chroma / 0.5) * (chromaHeight - 80));

      if (points.length === 0) {
        points.push(`M ${svgX} ${svgY}`);
      } else {
        points.push(`L ${svgX} ${svgY}`);
      }
    }

    return points.join(" ");
  }, [isMounted, currentHue, chromaPercentage, minChroma, calculateLightness, calculateMaxChroma, gaussian, minX, maxX, centerX, width, height]);

  const palette = generatePalette();

  return (
    <div className="mx-auto w-full">
      {/* 控制面板 */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-sm" htmlFor="hue-input">
            Hue:
          </label>
          <input
            className="w-20 rounded border px-2 py-1 text-sm"
            id="hue-input"
            max={360}
            min={0}
            onChange={(e) => setCurrentHue(Number(e.target.value))}
            step={1}
            type="number"
            value={currentHue}
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-sm" htmlFor="left-lightness">
            Left L:
          </label>
          <input
            className="w-20 rounded border px-2 py-1 text-sm"
            id="left-lightness"
            max={1}
            min={0.1}
            onChange={(e) => setLeftLightness(Number(e.target.value))}
            step={0.01}
            type="number"
            value={leftLightness.toFixed(2)}
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-sm" htmlFor="right-lightness">
            Right L:
          </label>
          <input
            className="w-20 rounded border px-2 py-1 text-sm"
            id="right-lightness"
            max={1}
            min={0.1}
            onChange={(e) => setRightLightness(Number(e.target.value))}
            step={0.01}
            type="number"
            value={rightLightness.toFixed(2)}
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-sm" htmlFor="chroma-percentage">
            C %:
          </label>
          <input
            className="w-20 rounded border px-2 py-1 text-sm"
            id="chroma-percentage"
            max={1}
            min={0.1}
            onChange={(e) => setChromaPercentage(Number(e.target.value))}
            step={0.01}
            type="number"
            value={chromaPercentage.toFixed(2)}
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-sm" htmlFor="min-chroma">
            Min C:
          </label>
          <input
            className="w-20 rounded border px-2 py-1 text-sm"
            id="min-chroma"
            max={0.1}
            min={0}
            onChange={(e) => setMinChroma(Number(e.target.value))}
            step={0.001}
            type="number"
            value={minChroma.toFixed(3)}
          />
        </div>
      </div>

      {/* 函数图表 */}
      <div className="mb-6">
        <svg
          className="rounded border border-gray-200"
          height={height * 0.7}
          ref={svgRef}
          style={{ display: "block", margin: "0 auto" }}
          width={width}
        >
          {/* 背景网格 */}
          <defs>
            <pattern height="40" id={gridId} patternUnits="userSpaceOnUse" width="40">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1" />
            </pattern>
          </defs>
          <rect fill={`url(#${gridId})`} height="100%" width="100%" />

          {/* X 轴 */}
          <line stroke="#333" strokeWidth="2" x1={40} x2={width - 40} y1={height * 0.3 - 40} y2={height * 0.3 - 40} />
          <line stroke="#333" strokeWidth="2" x1={40} x2={width - 40} y1={height * 0.7 - 40} y2={height * 0.7 - 40} />

          {/* Y 轴 */}
          <line stroke="#333" strokeWidth="2" x1={40} x2={40} y1={40} y2={height * 0.3 - 40} />
          <line stroke="#333" strokeWidth="2" x1={40} x2={40} y1={height * 0.3 + 40} y2={height * 0.7 - 40} />

          {/* 亮度曲线 */}
          {isMounted && <path d={generateLightnessPath()} fill="none" stroke="#dc2626" strokeWidth="3" />}

          {/* Chroma 曲线 */}
          {isMounted && <path d={generateChromaPath()} fill="none" stroke="#059669" strokeWidth="3" />}

          {/* 图表标签 */}
          <text
            fill="#dc2626"
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
            transform={`rotate(-90, 20, ${height * 0.15})`}
            x={20}
            y={height * 0.15}
          >
            Lightness
          </text>
          <text
            fill="#059669"
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
            transform={`rotate(-90, 20, ${height * 0.55})`}
            x={20}
            y={height * 0.55}
          >
            Chroma
          </text>
          <text fill="#333" fontSize="14" fontWeight="bold" textAnchor="middle" x={width / 2} y={height * 0.7 - 10}>
            Position (100-900)
          </text>
        </svg>
      </div>

      {/* 生成的色卡 */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Generated Color Palette</h4>
        <div className="grid grid-cols-5 gap-4">
          {palette.map((color, index) => (
            <div className="rounded-lg border p-3 shadow-sm" key={index}>
              <div className="mb-2 h-20 w-full rounded border" style={{ backgroundColor: color.color }} />
              <div className="space-y-1 text-xs">
                <div className="font-mono">X: {color.x}</div>
                <div className="font-mono">L: {color.lightness}</div>
                <div className="font-mono">C: {color.chroma}</div>
                <div className="font-mono">H: {currentHue}</div>
                <div className="font-mono text-gray-500">{color.color}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
