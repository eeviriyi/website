import { getRecentDeviceStats } from "@/lib/components/device_stats/repository";

export async function GET() {
  try {
    const stats = await getRecentDeviceStats();

    return Response.json({ data: stats }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch recent device stats:", error);
    return Response.json({ error: "Failed to fetch recent device stats" }, { status: 500 });
  }
}
