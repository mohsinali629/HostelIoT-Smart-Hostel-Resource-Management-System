import { useQueryClient } from "@tanstack/react-query";
import {
  useGetWaterTankStatus, getGetWaterTankStatusQueryKey,
  useGetWaterTankHistory, getGetWaterTankHistoryQueryKey,
  useControlMotor,
} from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Droplets, AlertTriangle, CheckCircle2, RefreshCw, Power } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

function TankGauge({ level }: { level: number }) {
  const color = level <= 15 ? "#ef4444" : level <= 25 ? "#f59e0b" : "#2dd4bf";
  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-44 h-44">
        <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(220 25% 14%)" strokeWidth="16" />
        <circle
          cx="100" cy="100" r="80"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeDasharray={`${2 * Math.PI * 80 * level / 100} ${2 * Math.PI * 80 * (1 - level / 100)}`}
          strokeDashoffset={2 * Math.PI * 80 * 0.25}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
        <text x="100" y="95" textAnchor="middle" fill={color} fontSize="28" fontWeight="bold" fontFamily="Inter">
          {level.toFixed(1)}%
        </text>
        <text x="100" y="118" textAnchor="middle" fill="hsl(215 15% 55%)" fontSize="11" fontFamily="Inter">
          Water Level
        </text>
      </svg>
    </div>
  );
}

export default function WaterTank() {
  const qc = useQueryClient();
  const { data: status, isLoading, refetch } = useGetWaterTankStatus({
    query: { queryKey: getGetWaterTankStatusQueryKey(), refetchInterval: 10000 },
  });
  const { data: history } = useGetWaterTankHistory(
    { hours: 24 },
    { query: { queryKey: getGetWaterTankHistoryQueryKey({ hours: 24 }), refetchInterval: 30000 } },
  );
  const motorMutation = useControlMotor({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetWaterTankStatusQueryKey() });
      },
    },
  });

  const chartData = (history ?? []).map((r: any) => ({
    time: format(new Date(r.timestamp), "HH:mm"),
    level: r.levelPercent,
  }));

  const level = status?.levelPercent ?? 72;
  const motorStatus = status?.motorStatus ?? "off";
  const isWarning = level <= 25 && level > 15;
  const isCritical = level <= 15;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Water Tank Control</h1>
          <p className="text-sm text-muted-foreground mt-1">Main hostel water tank — ultrasonic sensor monitoring</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground" data-testid="button-refresh-water-tank">
          <RefreshCw className="w-3.5 h-3.5" />
          Live · 10s
        </button>
      </div>

      {isCritical && (
        <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6" data-testid="alert-critical-level">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">Critical Water Level</p>
            <p className="text-xs text-destructive/80">Level below 15% — auto motor activation triggered</p>
          </div>
        </div>
      )}

      {isWarning && !isCritical && (
        <div className="flex items-center gap-3 bg-amber-400/10 border border-amber-400/30 rounded-lg p-4 mb-6" data-testid="alert-warning-level">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-400">Low Water Level Warning</p>
            <p className="text-xs text-amber-400/80">Level below 25% — consider turning motor on</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-1 bg-card border border-border rounded-xl p-6 flex flex-col items-center gap-4">
          {isLoading ? (
            <div className="w-44 h-44 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            <TankGauge level={level} />
          )}
          <div className="w-full text-center space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Capacity</span><span className="text-foreground font-medium">{status?.capacityLiters?.toLocaleString() ?? "--"} L</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Current</span><span className="text-foreground font-medium">{status?.currentLiters?.toLocaleString() ?? "--"} L</span>
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Power className="w-4 h-4 text-primary" />
              Motor Control
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-muted-foreground">Current Status:</span>
              <Badge
                variant={motorStatus === "on" ? "default" : "secondary"}
                className="gap-1.5"
                data-testid="badge-motor-status-detail"
              >
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${motorStatus === "on" ? "bg-primary-foreground" : "bg-muted-foreground"}`} />
                {motorStatus.toUpperCase()}
              </Badge>
              {status?.motorMode === "auto" && <Badge variant="outline" className="text-xs">AUTO MODE</Badge>}
            </div>
            <div className="flex gap-3">
              <Button
                data-testid="button-motor-on"
                variant={motorStatus === "on" ? "default" : "outline"}
                size="sm"
                onClick={() => motorMutation.mutate({ data: { action: "on" } })}
                disabled={motorMutation.isPending}
              >
                Turn ON
              </Button>
              <Button
                data-testid="button-motor-off"
                variant={motorStatus === "off" ? "default" : "outline"}
                size="sm"
                onClick={() => motorMutation.mutate({ data: { action: "off" } })}
                disabled={motorMutation.isPending}
              >
                Turn OFF
              </Button>
              <Button
                data-testid="button-motor-auto"
                variant={motorStatus === "auto" ? "default" : "outline"}
                size="sm"
                onClick={() => motorMutation.mutate({ data: { action: "auto" } })}
                disabled={motorMutation.isPending}
              >
                Set AUTO
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4">Automation Rules</h3>
            <div className="space-y-2.5">
              {[
                { icon: CheckCircle2, color: "text-primary", label: "98% full → Motor OFF", active: level >= 95 },
                { icon: AlertTriangle, color: "text-amber-400", label: "Below 25% → Warning sent to management", active: isWarning },
                { icon: AlertTriangle, color: "text-destructive", label: "Below 15% → Motor auto-ON triggered", active: isCritical },
              ].map(({ icon: Icon, color, label, active }) => (
                <div key={label} className={`flex items-center gap-3 text-sm p-2.5 rounded-lg ${active ? "bg-muted/50" : ""}`}>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
                  <span className={active ? "text-foreground font-medium" : "text-muted-foreground"}>{label}</span>
                  {active && <span className="ml-auto text-xs text-primary font-medium">ACTIVE</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-400" />
          Water Level History (24h)
        </h3>
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No history data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 20% 18%)" />
              <XAxis dataKey="time" tick={{ fill: "hsl(215 15% 55%)", fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "hsl(215 15% 55%)", fontSize: 11 }} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(220 25% 10%)", border: "1px solid hsl(217 20% 18%)", borderRadius: "8px", color: "hsl(210 20% 92%)" }}
                formatter={(v: any) => [`${v.toFixed(1)}%`, "Level"]}
              />
              <ReferenceLine y={25} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Warning 25%", fill: "#f59e0b", fontSize: 10 }} />
              <ReferenceLine y={15} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Critical 15%", fill: "#ef4444", fontSize: 10 }} />
              <Line type="monotone" dataKey="level" stroke="hsl(174 72% 45%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
