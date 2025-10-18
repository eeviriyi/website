"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface GlassConfig {
  shadowColor: string;
  shadowBlur: number;
  shadowSpread: number;
  tintColor: string;
  tintOpacity: number;
  frostBlur: number;
  noiseFrequency: number;
  distortionStrength: number;
  outerShadowBlur: number;
}

interface Position {
  x: number;
  y: number;
}

interface LiquidGlassProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  initialPosition?: Position;
  backgroundImage?: string;
  className?: string;
  containerHeight?: string;
}

interface GlassControlsProps {
  config: GlassConfig;
  onConfigChange: (key: keyof GlassConfig, value: string | number) => void;
  bgUrl: string;
  onBgUrlChange: (url: string) => void;
}

declare global {
  interface Window {
    glassConfig?: GlassConfig;
    updateGlassConfig?: (key: keyof GlassConfig, value: string | number) => void;
    glassBgUrl?: string;
    updateGlassBgUrl?: (url: string) => void;
  }
}

export const GlassControls: React.FC<GlassControlsProps> = ({ config, onConfigChange, bgUrl, onBgUrlChange }) => {
  return (
    <div className="prose dark:prose-invert">
      <ul>
        <li>
          Inner Shadow
          <ul>
            <li>
              Color:
              <input className="ml-2" onChange={(e) => onConfigChange("shadowColor", e.target.value)} type="color" value={config.shadowColor} />
            </li>
            <li>
              Blur:
              <input
                className="ml-2"
                max="50"
                min="0"
                onChange={(e) => onConfigChange("shadowBlur", parseInt(e.target.value))}
                type="range"
                value={config.shadowBlur}
              />
              <span className="ml-2">{config.shadowBlur}px</span>
            </li>
            <li>
              Spread:
              <input
                className="ml-2"
                max="20"
                min="-20"
                onChange={(e) => onConfigChange("shadowSpread", parseInt(e.target.value))}
                type="range"
                value={config.shadowSpread}
              />
              <span className="ml-2">{config.shadowSpread}px</span>
            </li>
          </ul>
        </li>

        <li>
          Glass Tint
          <ul>
            <li>
              Color:
              <input className="ml-2" onChange={(e) => onConfigChange("tintColor", e.target.value)} type="color" value={config.tintColor} />
            </li>
            <li>
              Opacity:
              <input
                className="ml-2"
                max="100"
                min="0"
                onChange={(e) => onConfigChange("tintOpacity", parseInt(e.target.value))}
                type="range"
                value={config.tintOpacity}
              />
              <span className="ml-2">{config.tintOpacity}%</span>
            </li>
          </ul>
        </li>

        <li>
          Frost Blur
          <ul>
            <li>
              Radius:
              <input
                className="ml-2"
                max="30"
                min="0"
                onChange={(e) => onConfigChange("frostBlur", parseInt(e.target.value))}
                type="range"
                value={config.frostBlur}
              />
              <span className="ml-2">{config.frostBlur}px</span>
            </li>
          </ul>
        </li>

        <li>
          Noise Distortion
          <ul>
            <li>
              Frequency:
              <input
                className="ml-2"
                max="0.02"
                min="0"
                onChange={(e) => onConfigChange("noiseFrequency", parseFloat(e.target.value))}
                step="0.001"
                type="range"
                value={config.noiseFrequency}
              />
              <span className="ml-2">{config.noiseFrequency}</span>
            </li>
            <li>
              Strength:
              <input
                className="ml-2"
                max="200"
                min="0"
                onChange={(e) => onConfigChange("distortionStrength", parseInt(e.target.value))}
                type="range"
                value={config.distortionStrength}
              />
              <span className="ml-2">{config.distortionStrength}</span>
            </li>
          </ul>
        </li>

        <li>
          Background Image
          <ul>
            <li>
              URL:
              <input className="ml-2" onChange={(e) => onBgUrlChange(e.target.value)} placeholder="https://..." type="text" value={bgUrl} />
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

const LiquidGlass: React.FC<LiquidGlassProps> = ({
  width = 300,
  height = 200,
  borderRadius = 28,
  initialPosition = { x: 0, y: 0 },
  backgroundImage,
  className = "",
  containerHeight = "60vh",
}) => {
  const [config, setConfig] = useState<GlassConfig>({
    distortionStrength: 77,
    frostBlur: 2,
    noiseFrequency: 0.008,
    outerShadowBlur: 24,
    shadowBlur: 20,
    shadowColor: "#ffffff",
    shadowSpread: -5,
    tintColor: "#ffffff",
    tintOpacity: 40,
  });

  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [isFixed, setIsFixed] = useState(false);
  const [bgUrl, setBgUrl] = useState(backgroundImage || "");

  const glassRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 将十六进制颜色转换为 RGB
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `${r}, ${g}, ${b}`;
    }
    return "255, 255, 255";
  };

  // 生成 CSS 变量
  const cssVariables = {
    "--distortion-strength": config.distortionStrength.toString(),
    "--frost-blur": `${config.frostBlur}px`,
    "--noise-frequency": config.noiseFrequency.toString(),
    "--outer-shadow-blur": `${config.outerShadowBlur}px`,
    "--shadow-blur": `${config.shadowBlur}px`,
    "--shadow-color": `rgba(${hexToRgb(config.shadowColor)}, 0.7)`,
    "--shadow-offset": "0",
    "--shadow-spread": `${config.shadowSpread}px`,
    "--tint-color": hexToRgb(config.tintColor),
    "--tint-opacity": (config.tintOpacity / 100).toString(),
  } as React.CSSProperties;

  // 更新配置函数 - 使用 useCallback 优化
  const updateConfig = useCallback((key: keyof GlassConfig, value: string | number) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // 更新背景图片函数 - 使用 useCallback 优化
  const updateBackground = useCallback(() => {
    if (bgUrl && containerRef.current) {
      containerRef.current.style.backgroundImage = `url('${bgUrl}')`;
    }
  }, [bgUrl]);

  // 拖拽处理
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();

    if (glassRef.current) {
      const rect = glassRef.current.getBoundingClientRect();

      setIsFixed(true);
      setPosition({ x: rect.left, y: rect.top });

      setIsDragging(true);
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, []);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging) return;
      e.preventDefault();

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      setPosition({ x: newX, y: newY });
    },
    [isDragging, dragStart],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 绑定全局事件监听器
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
      return () => {
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // 背景图片效果
  useEffect(() => {
    updateBackground();
  }, [updateBackground]);

  // 为 MDX 提供配置控制的 context
  useEffect(() => {
    window.glassConfig = config;
    window.updateGlassConfig = updateConfig;
    window.glassBgUrl = bgUrl;
    window.updateGlassBgUrl = setBgUrl;
  }, [config, bgUrl, updateConfig]);

  return (
    <div
      className={`liquid-glass-container ${className}`}
      ref={containerRef}
      style={{
        alignItems: "center",
        backgroundImage: backgroundImage
          ? `url('${backgroundImage}')`
          : 'url("https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfDB8fGVufDB8fHx8fA%3D%3D")',
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        display: "flex",
        fontFamily: "sans-serif",
        fontWeight: 300,
        height: containerHeight,
        justifyContent: "center",
        position: "relative",
        width: "100%",
        ...cssVariables,
      }}
    >
      {/* 玻璃元素 */}
      <div
        onPointerDown={handlePointerDown}
        ref={glassRef}
        style={{
          borderRadius: `${borderRadius}px`,
          boxShadow: `0px 6px var(--outer-shadow-blur) rgba(0, 0, 0, 0.2)`,
          cursor: isDragging ? "grabbing" : "grab",
          height: `${height}px`,
          isolation: "isolate",
          left: isFixed ? `${position.x}px` : "auto",
          position: isFixed ? "fixed" : "absolute",
          top: isFixed ? `${position.y}px` : "auto",
          touchAction: "none",
          transform: isFixed ? "none" : `translate(${position.x}px, ${position.y}px)`,
          width: `${width}px`,
          zIndex: isDragging ? 999 : 1,
        }}
      >
        {/* 内阴影和着色层 */}
        <div
          style={{
            backgroundColor: "rgba(var(--tint-color), var(--tint-opacity))",
            borderRadius: `${borderRadius}px`,
            boxShadow: "inset var(--shadow-offset) var(--shadow-offset) var(--shadow-blur) var(--shadow-spread) var(--shadow-color)",
            inset: "0",
            position: "absolute",
            zIndex: 0,
          }}
        />

        {/* 背景模糊和扭曲层 */}
        <div
          style={{
            backdropFilter: "blur(var(--frost-blur))",
            borderRadius: `${borderRadius}px`,
            filter: "url(#glass-distortion)",
            inset: "0",
            isolation: "isolate",
            position: "absolute",
            WebkitBackdropFilter: "blur(var(--frost-blur))",
            WebkitFilter: 'url("#glass-distortion")',
            zIndex: -1,
          }}
        />
      </div>

      {/* SVG 滤镜 */}
      <svg
        style={{
          height: 0,
          left: 0,
          overflow: "hidden",
          pointerEvents: "none",
          position: "fixed",
          top: 0,
          width: 0,
        }}
      >
        <title>Glass distortion filter</title>
        <defs>
          {/** biome-ignore lint/correctness/useUniqueElementIds: <1> */}
          <filter height="100%" id="glass-distortion" width="100%" x="0%" y="0%">
            <feTurbulence
              baseFrequency={`${config.noiseFrequency} ${config.noiseFrequency}`}
              numOctaves="2"
              result="noise"
              seed="92"
              type="fractalNoise"
            />
            <feGaussianBlur in="noise" result="blurred" stdDeviation="2" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="blurred"
              scale={config.distortionStrength.toString()}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

// 独立的控制器组件，用于MDX
export const GlassControlsConnector: React.FC = () => {
  const [config, setConfig] = useState<GlassConfig>({
    distortionStrength: 77,
    frostBlur: 2,
    noiseFrequency: 0.008,
    outerShadowBlur: 24,
    shadowBlur: 20,
    shadowColor: "#ffffff",
    shadowSpread: -5,
    tintColor: "#ffffff",
    tintOpacity: 40,
  });
  const [bgUrl, setBgUrl] = useState("");

  // 使用 useCallback 优化 updateConfig
  const updateConfig = useCallback((key: keyof GlassConfig, value: string | number) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // 同步配置到全局
  useEffect(() => {
    if (window.updateGlassConfig) {
      Object.entries(config).forEach(([key, value]) => {
        window.updateGlassConfig?.(key as keyof GlassConfig, value);
      });
    }
  }, [config]);

  useEffect(() => {
    if (window.updateGlassBgUrl) {
      window.updateGlassBgUrl(bgUrl);
    }
  }, [bgUrl]);

  return <GlassControls bgUrl={bgUrl} config={config} onBgUrlChange={setBgUrl} onConfigChange={updateConfig} />;
};

export default LiquidGlass;
