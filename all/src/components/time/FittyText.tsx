"use client";

import fitty from "fitty"; // 导入 Fitty 库
import React, { useEffect, useRef } from "react";

const FittyText = ({ children, className }) => {
  // 1. 使用 useRef 创建一个 ref 来引用 DOM 元素
  const textRef = useRef(null);

  useEffect(() => {
    // 2. 确保 ref.current 存在（DOM 元素已渲染）
    if (textRef.current) {
      // 3. 在客户端初始化 Fitty
      // fitty(selector, options)
      const instance = fitty(textRef.current, {
        maxSize: 512, // 最大字号
        // 可选配置项
        minSize: 12, // 最小字号
      });

      // 4. (重要) 清理函数：在组件卸载时移除 Fitty 实例
      // 这有助于防止内存泄漏和不必要的 DOM 操作
      return () => {
        if (instance && instance.length > 0 && instance[0].unsubscribe) {
          instance[0].unsubscribe();
        }
      };
    }

    // Fitty 在浏览器端运行，所以不需要在服务器端渲染 (SSR) 时执行
    // Next.js 默认的 useEffect 行为已经确保了它只在客户端运行
  }, [children]); // 当 children 内容变化时，重新运行效果

  // 5. 将 ref 和 Tailwind CSS 类名应用到容器元素
  return (
    <div
      className={`inline-block whitespace-nowrap ${className || ""}`}
      ref={textRef}
      style={{ overflow: "hidden" }} // 确保文本不会溢出
    >
      {children}
    </div>
  );
};

export default FittyText;
