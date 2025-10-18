"use client";

import { formatDistanceToNow } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";

type DeviceStat = {
    batteryLevel: number;
    deviceName: string;
    isCharging: boolean;
    isScreenOn: boolean;
    timestamp: string;
};

type FetchState = "idle" | "loading" | "error" | "success";

export default function DeviceStats() {
    const [stats, setStats] = useState<DeviceStat[]>([]);
    const [state, setState] = useState<FetchState>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setState("loading");
            setErrorMessage(null);

            const response = await fetch("/api/device_stats", { cache: "no-store" });

            if (!response.ok) {
                throw new Error(`请求失败，状态码 ${response.status}`);
            }

            const payload: { data?: DeviceStat[] } = await response.json();
            const data = Array.isArray(payload.data) ? payload.data : [];

            setStats(data);
            setState("success");
        } catch (error) {
            console.error("Failed to load device stats", error);
            setErrorMessage(error instanceof Error ? error.message : "未知错误");
            setState("error");
        }
    }, []);

    useEffect(() => {
        void fetchStats();

        const intervalId = setInterval(() => {
            void fetchStats();
        }, 60_000);

        return () => {
            clearInterval(intervalId);
        };
    }, [fetchStats]);

    const sortedStats = useMemo(() => {
        return [...stats].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [stats]);

    const renderContent = () => {
        if (state === "loading" && stats.length === 0) {
            return <p className="text-muted-foreground text-sm">正在获取最近的设备数据...</p>;
        }

        if (state === "error") {
            return (
                <div className="space-y-2">
                    <p className="text-destructive text-sm">无法获取设备数据：{errorMessage}</p>
                    <Button onClick={() => void fetchStats()} size="sm" variant="outline">
                        重试
                    </Button>
                </div>
            );
        }

        if (sortedStats.length === 0) {
            return <p className="text-muted-foreground text-sm">过去 24 小时内没有设备上报数据。</p>;
        }

        return (
            <ul className="space-y-4">
                {sortedStats.map((stat) => {
                    const timestamp = new Date(stat.timestamp);
                    const relativeTime = Number.isNaN(timestamp.getTime()) ? "时间未知" : formatDistanceToNow(timestamp, { addSuffix: true });

                    return (
                        <li className="rounded-lg border bg-secondary/20 p-4" key={stat.deviceName}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="font-medium">{stat.deviceName}</p>
                                <span className="text-muted-foreground text-xs">最近上报：{relativeTime}</span>
                            </div>
                            <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                                <div>
                                    <dt className="text-muted-foreground text-xs uppercase tracking-wide">电量</dt>
                                    <dd className="font-medium">{stat.batteryLevel}%</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground text-xs uppercase tracking-wide">充电中</dt>
                                    <dd className="font-medium">{stat.isCharging ? "是" : "否"}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground text-xs uppercase tracking-wide">屏幕亮起</dt>
                                    <dd className="font-medium">{stat.isScreenOn ? "是" : "否"}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground text-xs uppercase tracking-wide">时间戳</dt>
                                    <dd className="font-medium">{timestamp.toLocaleString()}</dd>
                                </div>
                            </dl>
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>设备健康状态</CardTitle>
                    <CardDescription>展示过去 24 小时内有上报数据的设备。</CardDescription>
                </div>
                <Button onClick={() => void fetchStats()} size="sm" variant="secondary">
                    手动刷新
                </Button>
            </CardHeader>
            <CardContent>{renderContent()}</CardContent>
        </Card>
    );
}
