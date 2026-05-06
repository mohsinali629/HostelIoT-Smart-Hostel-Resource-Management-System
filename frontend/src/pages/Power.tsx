import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetRoomPowerStats, getGetRoomPowerStatsQueryKey,
  useGetPowerSummary, getGetPowerSummaryQueryKey,
  useGetPowerAnomalies, getGetPowerAnomaliesQueryKey,
  useGetRoomPowerHistory, getGetRoomPowerHistoryQueryKey,
} from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Zap, AlertTriangle, RefreshCw, X, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

function RoomHistoryDrawer({ room, onClose }: { room: any; onClose: () => void }) {
  const { data: history } = useGetRoomPowerHistory(room.roomId, { hours: 24 }, {
    query: { queryKey: getGetRoomPowerHistoryQueryKey(room.roomId, { hours: 24 }) },
  });

  const chartData = (history ?? []).map((r: any) => ({
    time: format(new Date(r.timestamp), "HH:mm"),
    watts: r.watts,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">{room.roomName}</h3>
            <p className="text-xs text-muted-foreground">Wing {room.wing} · Floor {room.floor}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-room-drawer">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{room.currentWatts}W</div>
            <div className="text-xs text-muted-foreground">Now</div>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{room.todayKwh} kWh</div>
            <div className="text-xs text-muted-foreground">Today</div>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{room.monthKwh} kWh</div>
            <div className="text-xs text-muted-foreground">Month</div>
          </div>
        </div>
        <div className="h-40">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No history</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 20% 18%)" />
                <XAxis dataKey="time" tick={{ fill: "hsl(215 15% 55%)", fontSize: 10 }} />
                <YAxis tick={{ fill: "hsl(215 15% 55%)", fontSize: 10 }} unit="W" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(220 25% 10%)", border: "1px solid hsl(217 20% 18%)", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="watts" stroke="hsl(174 72% 45%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Power() {
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [wingFilter, setWingFilter] = useState("ALL");

  const { data: rooms, refetch } = useGetRoomPowerStats({
    query: { queryKey: getGetRoomPowerStatsQueryKey(), refetchInterval: 15000 },
  });
  const { data: summary } = useGetPowerSummary({
    query: { queryKey: getGetPowerSummaryQueryKey(), refetchInterval: 15000 },
  });
  const { data: anomalies } = useGetPowerAnomalies({
    query: { queryKey: getGetPowerAnomaliesQueryKey(), refetchInterval: 15000 },
  });

  const wings = ["ALL", "A", "B", "C", "D"];
  const filteredRooms = (rooms ?? []).filter((r: any) => wingFilter === "ALL" || r.wing === wingFilter);

  const occupancyColor: Record<string, string> = {
    occupied: "bg-primary/20 text-primary",
    vacant: "bg-muted text-muted-foreground",
    holiday: "bg-amber-400/20 text-amber-400",
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Power Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-1">Per-room energy tracking and anomaly detection</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground" data-testid="button-refresh-power">
          <RefreshCw className="w-3.5 h-3.5" />
          Live · 15s
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Draw", value: `${summary?.totalCurrentWatts?.toLocaleString() ?? "--"}W`, icon: Zap, color: "text-primary" },
          { label: "Today Total", value: `${summary?.todayTotalKwh?.toFixed(2) ?? "--"} kWh`, icon: TrendingUp, color: "text-blue-400" },
          { label: "Active Rooms", value: `${summary?.occupiedRooms ?? "--"}/${summary?.totalRooms ?? "--"}`, icon: Zap, color: "text-teal-400" },
          { label: "Anomalies", value: summary?.anomalyRooms ?? 0, icon: AlertTriangle, color: "text-amber-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <div className="text-2xl font-bold text-foreground" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>{value}</div>
          </div>
        ))}
      </div>

      {(anomalies ?? []).length > 0 && (
        <div className="bg-card border border-amber-400/20 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Power Anomalies ({anomalies?.length})
          </h3>
          <div className="space-y-2">
            {(anomalies ?? []).map((a: any) => (
              <div key={a.roomId} className="flex items-center gap-3 py-2 border-b border-border last:border-0" data-testid={`anomaly-${a.roomId}`}>
                <div className={`w-2 h-2 rounded-full ${a.severity === "high" ? "bg-destructive" : a.severity === "medium" ? "bg-amber-400" : "bg-blue-400"}`} />
                <div className="flex-1">
                  <span className="text-sm font-medium text-foreground">{a.roomName}</span>
                  <span className="text-xs text-muted-foreground ml-2">{a.reason}</span>
                </div>
                <span className="text-sm font-mono text-amber-400">{a.currentWatts}W</span>
                <Badge variant="outline" className={`text-xs ${a.severity === "high" ? "border-destructive text-destructive" : "border-amber-400 text-amber-400"}`}>
                  {a.severity.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Room Power Stats</h3>
          <div className="flex gap-1">
            {wings.map((w) => (
              <button
                key={w}
                data-testid={`filter-wing-${w}`}
                onClick={() => setWingFilter(w)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${wingFilter === w ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-xs text-muted-foreground font-medium">Room</th>
                <th className="text-left py-2 pr-4 text-xs text-muted-foreground font-medium">Wing/Floor</th>
                <th className="text-right py-2 pr-4 text-xs text-muted-foreground font-medium">Current</th>
                <th className="text-right py-2 pr-4 text-xs text-muted-foreground font-medium">Today</th>
                <th className="text-right py-2 pr-4 text-xs text-muted-foreground font-medium">Month</th>
                <th className="text-left py-2 pr-4 text-xs text-muted-foreground font-medium">Status</th>
                <th className="py-2 text-xs text-muted-foreground font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room: any) => (
                <tr
                  key={room.roomId}
                  className={`border-b border-border/50 hover:bg-muted/30 cursor-pointer ${room.isAnomaly ? "bg-amber-400/5" : ""}`}
                  onClick={() => setSelectedRoom(room)}
                  data-testid={`row-room-${room.roomId}`}
                >
                  <td className="py-2.5 pr-4 font-medium">
                    <div className="flex items-center gap-2">
                      {room.isAnomaly && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                      {room.roomName}
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground">Wing {room.wing} · F{room.floor}</td>
                  <td className="py-2.5 pr-4 text-right font-mono">{room.currentWatts}W</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{room.todayKwh} kWh</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{room.monthKwh} kWh</td>
                  <td className="py-2.5 pr-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${occupancyColor[room.occupancyStatus] ?? occupancyColor.occupied}`}>
                      {room.occupancyStatus}
                    </span>
                  </td>
                  <td className="py-2.5 text-muted-foreground text-xs">View</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRoom && <RoomHistoryDrawer room={selectedRoom} onClose={() => setSelectedRoom(null)} />}
    </div>
  );
}
