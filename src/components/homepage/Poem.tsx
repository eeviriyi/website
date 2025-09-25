"use client";

import { load } from "jinrishici";
import { useEffect, useState } from "react";

interface PoemOrigin {
  title: string;
  dynasty: string;
  author: string;
  content: string[];
  translate: string[];
}

interface PoemData {
  id: string;
  content: string;
  popularity: number;
  origin: PoemOrigin;
  matchTags: string[];
  recommendedReason: string;
  cacheAt: string;
}

interface PoemResult {
  status: string;
  data: PoemData;
  token: string;
  ipAddress: string;
}

export default function Poem() {
  const [poem, setPoem] = useState<PoemResult | null>(null);

  useEffect(() => {
    load((result: PoemResult) => {
      setPoem(result);
    });
  }, []);

  return (
    <section className="w-full border bg-card text-card-foreground">
      {poem ? (
        <div className="p-8 text-center">
          <p className="mb-4 text-xl leading-relaxed" style={{ fontFamily: '"LXGW WenKai", cursive' }}>
            「{poem.data.content}」
          </p>
          <div className="text-right text-muted-foreground text-sm">
            <span className="relative inline-block">
              —— {poem.data.origin.author}《{poem.data.origin.title}》
            </span>
          </div>
        </div>
      ) : (
        <div className="animate-pulse p-8 text-center">
          <p>正在加载诗词...</p>
        </div>
      )}
    </section>
  );
}
