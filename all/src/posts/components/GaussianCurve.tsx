"use client";

import type React from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

interface GaussianCurveProps {
  width?: number;
  height?: number;
  minX?: number;
  maxX?: number;
  centerX?: number;
  lightness?: number;
  hue?: number;
  percentage?: number;
  minChroma?: number;
}

export default function GaussianCurve({
  width = 800,
  height = 400,
  minX = 100,
  maxX = 900,
  centerX = 500,
  lightness = 0.7,
  hue = 180,
  percentage = 0.8,
  minChroma = 0.02,
}: GaussianCurveProps) {
  const [currentLightness, setCurrentLightness] = useState(lightness);
  const [currentHue, setCurrentHue] = useState(hue);
  const [currentPercentage, setCurrentPercentage] = useState(percentage);
  const [currentMinChroma, setCurrentMinChroma] = useState(minChroma);
  const [isDraggingPeak, setIsDraggingPeak] = useState(false);
  const [isDraggingMinChroma, setIsDraggingMinChroma] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const gridId = useId();

  // 检测组件是否在客户端挂载
  useEffect(() => {
    setIsMounted(true);
  }, []); // 计算 OKLCH 颜色空间中给定 lightness 和 hue 下的理论最大 chroma
  const calculateMaxChroma = useCallback((l: number, h: number): number => {
    // 这是一个简化的近似算法，实际的 OKLCH 最大 chroma 计算会更复杂
    // 不同的 hue 角度和 lightness 值会有不同的最大 chroma 值
    const hueRad = (h * Math.PI) / 180;

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

  // 计算并存储绝对峰值
  const maxChroma = calculateMaxChroma(currentLightness, currentHue);
  const initialAbsolutePeak = maxChroma * percentage + minChroma;
  const [absolutePeakValue, setAbsolutePeakValue] = useState(initialAbsolutePeak);

  // 当lightness或hue变化时，重新计算绝对峰值
  useEffect(() => {
    const newMaxChroma = calculateMaxChroma(currentLightness, currentHue);
    const newAbsolutePeak = newMaxChroma * currentPercentage + currentMinChroma;
    setAbsolutePeakValue(newAbsolutePeak);
  }, [currentLightness, currentHue, currentPercentage, currentMinChroma, calculateMaxChroma]);

  // 高斯函数
  const gaussian = useCallback((x: number, center: number, peak: number, sigma: number, baseline: number): number => {
    return baseline + peak * Math.exp(-((x - center) ** 2) / (2 * sigma ** 2));
  }, []);

  // 坐标转换函数 - 固定Y轴范围为0-0.5
  const fixedMaxY = 0.5;
  const xToSvg = useCallback((x: number) => ((x - minX) / (maxX - minX)) * (width - 80) + 40, [minX, maxX, width]);
  const yToSvg = useCallback((y: number) => height - 60 - (y / fixedMaxY) * (height - 100), [height]);
  const svgToY = useCallback((svgY: number) => ((height - 60 - svgY) / (height - 100)) * fixedMaxY, [height]);

  // 生成路径数据
  const generatePath = useCallback(() => {
    if (!isMounted) return ""; // SSR时返回空字符串

    const points: string[] = [];
    const sigma = (maxX - minX) / 6; // 标准差，控制曲线宽度
    const relativePeakValue = absolutePeakValue - currentMinChroma; // 相对于基线的峰值高度

    for (let x = minX; x <= maxX; x += 5) {
      const y = gaussian(x, centerX, relativePeakValue, sigma, currentMinChroma);
      const svgX = ((x - minX) / (maxX - minX)) * (width - 80) + 40;
      const svgY = yToSvg(y);

      // 使用固定精度避免浮点数不一致
      const roundedSvgX = Math.round(svgX * 100) / 100;
      const roundedSvgY = Math.round(svgY * 100) / 100;

      if (points.length === 0) {
        points.push(`M ${roundedSvgX} ${roundedSvgY}`);
      } else {
        points.push(`L ${roundedSvgX} ${roundedSvgY}`);
      }
    }

    return points.join(" ");
  }, [isMounted, minX, maxX, centerX, absolutePeakValue, currentMinChroma, width, gaussian, yToSvg]);

  // 鼠标事件处理
  const handleMouseDownPeak = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingPeak(true);
  }, []);

  const handleMouseDownMinChroma = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingMinChroma(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const svgY = e.clientY - rect.top;
      const y = Math.max(0, Math.min(fixedMaxY, svgToY(svgY)));

      if (isDraggingPeak) {
        // 直接设置绝对峰值
        const newAbsolutePeak = Math.max(currentMinChroma + 0.01, Math.min(fixedMaxY, y));
        setAbsolutePeakValue(newAbsolutePeak);
        // 同时更新百分比以保持一致性
        const newPercentage = Math.max(0.1, Math.min(1, (newAbsolutePeak - currentMinChroma) / maxChroma));
        setCurrentPercentage(newPercentage);
      } else if (isDraggingMinChroma) {
        // 更新最小 chroma 值，确保不超过绝对峰值
        const maxAllowedMinChroma = Math.min(0.1, absolutePeakValue - 0.01);
        const newMinChroma = Math.max(0, Math.min(maxAllowedMinChroma, y));
        setCurrentMinChroma(newMinChroma);
        // 同时更新百分比以保持一致性
        const newPercentage = Math.max(0.1, Math.min(1, (absolutePeakValue - newMinChroma) / maxChroma));
        setCurrentPercentage(newPercentage);
      }
    },
    [isDraggingPeak, isDraggingMinChroma, svgToY, currentMinChroma, maxChroma, absolutePeakValue],
  );

  const handleMouseUp = useCallback(() => {
    setIsDraggingPeak(false);
    setIsDraggingMinChroma(false);
  }, []);

  useEffect(() => {
    if (isDraggingPeak || isDraggingMinChroma) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDraggingPeak, isDraggingMinChroma, handleMouseMove, handleMouseUp]);

  // 生成 X 轴刻度 - 调整位置避免与颜色条重叠
  const xTicks = [];
  for (let x = minX; x <= maxX; x += 100) {
    const svgX = xToSvg(x);
    xTicks.push(
      <g key={x}>
        <line stroke="#666" strokeWidth="1" x1={svgX} x2={svgX} y1={height - 60} y2={height - 55} />
        <text fill="#666" fontSize="12" textAnchor="middle" x={svgX} y={height - 5}>
          {x}
        </text>
      </g>,
    );
  }

  // 生成 Y 轴刻度 - 固定范围0-0.5
  const yTicks = [];
  for (let i = 0; i <= 5; i++) {
    const y = (fixedMaxY * i) / 5;
    const svgY = yToSvg(y);
    yTicks.push(
      <g key={i}>
        <line stroke="#666" strokeWidth="1" x1={35} x2={40} y1={svgY} y2={svgY} />
        <text fill="#666" fontSize="12" textAnchor="middle" x={25} y={svgY + 4}>
          {y.toFixed(2)}
        </text>
      </g>,
    );
  }

  // 生成颜色预览
  const generateColorPreview = useCallback(() => {
    const colors = [];
    const relativePeakValue = absolutePeakValue - currentMinChroma;
    for (let x = minX; x <= maxX; x += 20) {
      const sigma = (maxX - minX) / 6;
      const chroma = gaussian(x, centerX, relativePeakValue, sigma, currentMinChroma);
      const color = `oklch(${currentLightness} ${chroma} ${currentHue})`;
      const svgX = xToSvg(x);

      colors.push(<rect fill={color} height={15} key={x} stroke="#ccc" strokeWidth="0.5" width={20} x={svgX - 10} y={height - 40} />);
    }
    return colors;
  }, [minX, maxX, centerX, absolutePeakValue, currentMinChroma, currentLightness, currentHue, xToSvg, gaussian]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-sm" htmlFor="lightness-input">
            Lightness:
          </label>
          <input
            className="w-20 rounded border px-2 py-1 text-sm"
            id="lightness-input"
            max={1}
            min={0}
            onChange={(e) => setCurrentLightness(Math.max(0, Math.min(1, Number(e.target.value))))}
            step={0.01}
            type="number"
            value={currentLightness.toFixed(2)}
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-sm" htmlFor="hue-input">
            Hue:
          </label>
          <input
            className="w-20 rounded border px-2 py-1 text-sm"
            id="hue-input"
            max={360}
            min={0}
            onChange={(e) => setCurrentHue(Math.max(0, Math.min(360, Number(e.target.value))))}
            step={1}
            type="number"
            value={currentHue.toFixed(0)}
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-sm" htmlFor="percentage-input">
            Percentage:
          </label>
          <input
            className="w-20 rounded border px-2 py-1 text-sm"
            id="percentage-input"
            max={1}
            min={0.1}
            onChange={(e) => setCurrentPercentage(Math.max(0.1, Math.min(1, Number(e.target.value))))}
            step={0.01}
            type="number"
            value={currentPercentage.toFixed(2)}
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-sm" htmlFor="min-chroma-input">
            Min Chroma:
          </label>
          <input
            className="w-20 rounded border px-2 py-1 text-sm"
            id="min-chroma-input"
            max={0.1}
            min={0}
            onChange={(e) => setCurrentMinChroma(Math.max(0, Math.min(0.1, Number(e.target.value))))}
            step={0.001}
            type="number"
            value={currentMinChroma.toFixed(3)}
          />
        </div>
      </div>

      {/* 信息显示 */}
      <div className="mb-4 bg-card p-4 text-sm">
        <p>
          <strong>Max Chroma:</strong> {maxChroma.toFixed(3)}
        </p>
        <p>
          <strong>Peak Value:</strong> {absolutePeakValue.toFixed(3)}
        </p>
        <p>
          <strong>Current Color:</strong>{" "}
          <span style={{ color: `oklch(${currentLightness} ${absolutePeakValue} ${currentHue})` }}>
            oklch({currentLightness} {absolutePeakValue.toFixed(3)} {currentHue})
          </span>
        </p>
      </div>

      {/* SVG 图表 */}
      <div className="flex justify-center">
        <svg
          className="rounded border border-gray-200"
          height={height}
          ref={svgRef}
          style={{ cursor: isDraggingPeak || isDraggingMinChroma ? "grabbing" : "default" }}
          title="OKLCH Chroma Gaussian Distribution Chart"
          width={width}
        >
          {/* 背景网格 */}
          <defs>
            <pattern height="40" id={gridId} patternUnits="userSpaceOnUse" width="40">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1" />
            </pattern>
          </defs>
          <rect fill={`url(#${gridId})`} height="100%" width="100%" />

          {/* 坐标轴 */}
          <line stroke="#333" strokeWidth="2" x1={40} x2={40} y1={40} y2={height - 60} />
          <line stroke="#333" strokeWidth="2" x1={40} x2={width - 40} y1={height - 60} y2={height - 60} />

          {/* 刻度 */}
          {xTicks}
          {yTicks}

          {/* 颜色预览条 */}
          {generateColorPreview()}

          {/* 高斯曲线 */}
          {isMounted && <path d={generatePath()} fill="none" stroke="#2563eb" strokeWidth="3" />}

          {/* 峰值控制点 */}
          <circle
            aria-label={`Drag to adjust peak value. Current: ${absolutePeakValue.toFixed(3)}`}
            cx={xToSvg(centerX)}
            cy={yToSvg(absolutePeakValue)}
            fill="#dc2626"
            onMouseDown={handleMouseDownPeak}
            r="8"
            role="button"
            stroke="#fff"
            strokeWidth="2"
            style={{ cursor: "grab" }}
            tabIndex={0}
          />

          {/* 峰值标签 */}
          <text fill="#dc2626" fontSize="12" fontWeight="bold" textAnchor="middle" x={xToSvg(centerX)} y={yToSvg(absolutePeakValue) - 15}>
            Peak: {absolutePeakValue.toFixed(3)}
          </text>

          {/* 最小 chroma 控制点 - 左端 */}
          <circle
            aria-label={`Drag to adjust minimum chroma. Current: ${currentMinChroma.toFixed(3)}`}
            cx={xToSvg(minX)}
            cy={yToSvg(currentMinChroma)}
            fill="#059669"
            onMouseDown={handleMouseDownMinChroma}
            r="6"
            role="button"
            stroke="#fff"
            strokeWidth="2"
            style={{ cursor: "grab" }}
            tabIndex={0}
          />

          {/* 最小 chroma 控制点 - 右端 */}
          <circle
            aria-label={`Drag to adjust minimum chroma. Current: ${currentMinChroma.toFixed(3)}`}
            cx={xToSvg(maxX)}
            cy={yToSvg(currentMinChroma)}
            fill="#059669"
            onMouseDown={handleMouseDownMinChroma}
            r="6"
            role="button"
            stroke="#fff"
            strokeWidth="2"
            style={{ cursor: "grab" }}
            tabIndex={0}
          />

          {/* 最小 chroma 标签 */}
          <text fill="#059669" fontSize="10" fontWeight="bold" textAnchor="middle" x={xToSvg(minX)} y={yToSvg(currentMinChroma) - 10}>
            Min: {currentMinChroma.toFixed(3)}
          </text>
          <text fill="#059669" fontSize="10" fontWeight="bold" textAnchor="middle" x={xToSvg(maxX)} y={yToSvg(currentMinChroma) - 10}>
            Min: {currentMinChroma.toFixed(3)}
          </text>
        </svg>
      </div>
    </div>
  );
}
