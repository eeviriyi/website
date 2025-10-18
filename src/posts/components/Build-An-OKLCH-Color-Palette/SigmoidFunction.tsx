"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface SigmoidFunctionProps {
  width?: number;
  height?: number;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  leftInitial?: number;
  rightInitial?: number;
}

export default function SigmoidFunction({
  width = 800,
  height = 400,
  minX = 100,
  maxX = 900,
  minY = 0,
  maxY = 1,
  leftInitial = 0.8,
  rightInitial = 0.2,
}: SigmoidFunctionProps) {
  const [leftY, setLeftY] = useState(leftInitial);
  const [rightY, setRightY] = useState(rightInitial);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // 检测组件是否在客户端挂载
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 计算 sigmoid 函数参数
  const calculateSigmoidParams = useCallback(
    (y1: number, y2: number) => {
      // 确保 y1 和 y2 在合理范围内
      const clampedY1 = Math.max(minY + 0.01, Math.min(maxY - 0.01, y1));
      const clampedY2 = Math.max(minY + 0.01, Math.min(maxY - 0.01, y2));

      // 计算 sigmoid 函数的参数 a 和 b
      // sigmoid(x) = 1 / (1 + e^(-(a*x + b)))
      const x1 = minX;
      const x2 = maxX;

      // 转换为 logit 空间
      const logit1 = Math.log(clampedY1 / (1 - clampedY1));
      const logit2 = Math.log(clampedY2 / (1 - clampedY2));

      const a = (logit2 - logit1) / (x2 - x1);
      const b = logit1 - a * x1;

      return { a, b };
    },
    [minX, maxX, minY, maxY],
  );

  // sigmoid 函数
  const sigmoid = useCallback((x: number, a: number, b: number) => {
    return 1 / (1 + Math.exp(-(a * x + b)));
  }, []);

  // 生成路径数据 - 使用useCallback避免SSR不匹配
  const generatePath = useCallback(() => {
    if (!isMounted) return ""; // SSR时返回空字符串

    const { a, b } = calculateSigmoidParams(leftY, rightY);
    const points: string[] = [];

    for (let x = minX; x <= maxX; x += 5) {
      const y = sigmoid(x, a, b);
      const svgX = ((x - minX) / (maxX - minX)) * (width - 80) + 40;
      const svgY = height - 40 - ((y - minY) / (maxY - minY)) * (height - 80);

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
  }, [isMounted, leftY, rightY, minX, maxX, minY, maxY, width, height, calculateSigmoidParams, sigmoid]);

  // 坐标转换函数
  const xToSvg = (x: number) => ((x - minX) / (maxX - minX)) * (width - 80) + 40;
  const yToSvg = (y: number) => height - 40 - ((y - minY) / (maxY - minY)) * (height - 80);
  const svgToY = (svgY: number) => ((height - 40 - svgY) / (height - 80)) * (maxY - minY) + minY;

  // 鼠标事件处理
  const handleMouseDown = (point: "left" | "right") => (e: React.MouseEvent) => {
    e.preventDefault();
    if (point === "left") {
      setIsDraggingLeft(true);
    } else {
      setIsDraggingRight(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const svgY = e.clientY - rect.top;
    const y = Math.max(minY, Math.min(maxY, svgToY(svgY)));

    if (isDraggingLeft) {
      setLeftY(y);
    } else if (isDraggingRight) {
      setRightY(y);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingLeft(false);
    setIsDraggingRight(false);
  };

  useEffect(() => {
    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDraggingLeft, isDraggingRight]);

  // 生成 X 轴刻度
  const xTicks = [];
  for (let x = minX; x <= maxX; x += 100) {
    const svgX = xToSvg(x);
    xTicks.push(
      <g key={x}>
        <line stroke="#666" strokeWidth="1" x1={svgX} x2={svgX} y1={height - 40} y2={height - 35} />
        <text fill="#666" fontSize="12" textAnchor="middle" x={svgX} y={height - 20}>
          {x}
        </text>
      </g>,
    );
  }

  // 生成 Y 轴刻度
  const yTicks = [];
  for (let y = minY; y <= maxY; y += 0.2) {
    const svgY = yToSvg(y);
    yTicks.push(
      <g key={y}>
        <line stroke="#666" strokeWidth="1" x1={35} x2={40} y1={svgY} y2={svgY} />
        <text fill="#666" fontSize="12" textAnchor="middle" x={25} y={svgY + 4}>
          {y.toFixed(1)}
        </text>
      </g>,
    );
  }

  return (
    <div className="w-full max-w-4xl">
      {/* 控制面板 */}
      <div className="mb-4 flex space-x-6">
        <div className="flex items-center space-x-2">
          <label className="font-medium text-sm">Left Y:</label>
          <input
            className="w-20 rounded border px-2 py-1 text-sm"
            max={maxY}
            min={minY}
            onChange={(e) => setLeftY(Math.max(minY, Math.min(maxY, Number(e.target.value))))}
            step={0.01}
            type="number"
            value={leftY.toFixed(2)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="font-medium text-sm">Right Y:</label>
          <input
            className="w-20 rounded border px-2 py-1 text-sm"
            max={maxY}
            min={minY}
            onChange={(e) => setRightY(Math.max(minY, Math.min(maxY, Number(e.target.value))))}
            step={0.01}
            type="number"
            value={rightY.toFixed(2)}
          />
        </div>
      </div>

      {/* SVG 图表 */}
      <div className="flex justify-center">
        <svg
          className="rounded border border-gray-200"
          height={height}
          ref={svgRef}
          style={{ cursor: isDraggingLeft || isDraggingRight ? "grabbing" : "default" }}
          width={width}
        >
          {/* 背景网格 */}
          <defs>
            <pattern height="40" id="grid" patternUnits="userSpaceOnUse" width="40">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1" />
            </pattern>
          </defs>
          <rect fill="url(#grid)" height="100%" width="100%" />

          {/* 坐标轴 */}
          <line stroke="#333" strokeWidth="2" x1={40} x2={40} y1={40} y2={height - 40} />
          <line stroke="#333" strokeWidth="2" x1={40} x2={width - 40} y1={height - 40} y2={height - 40} />

          {/* 刻度 */}
          {xTicks}
          {yTicks}

          {/* Sigmoid 曲线 */}
          {isMounted && <path d={generatePath()} fill="none" stroke="#2563eb" strokeWidth="3" />}

          {/* 控制点 */}
          <circle
            cx={xToSvg(minX)}
            cy={yToSvg(leftY)}
            fill="#dc2626"
            onMouseDown={handleMouseDown("left")}
            r="8"
            stroke="#fff"
            strokeWidth="2"
            style={{ cursor: "grab" }}
          />
          <circle
            cx={xToSvg(maxX)}
            cy={yToSvg(rightY)}
            fill="#dc2626"
            onMouseDown={handleMouseDown("right")}
            r="8"
            stroke="#fff"
            strokeWidth="2"
            style={{ cursor: "grab" }}
          />

          {/* 控制点标签 */}
          <text fill="#dc2626" fontSize="12" fontWeight="bold" textAnchor="middle" x={xToSvg(minX)} y={yToSvg(leftY) - 15}>
            ({minX}, {leftY.toFixed(2)})
          </text>
          <text fill="#dc2626" fontSize="12" fontWeight="bold" textAnchor="middle" x={xToSvg(maxX)} y={yToSvg(rightY) - 15}>
            ({maxX}, {rightY.toFixed(2)})
          </text>
        </svg>
      </div>
    </div>
  );
}
