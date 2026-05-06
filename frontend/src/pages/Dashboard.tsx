import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@/lib/api";
import { Droplets, Thermometer, Lightbulb, Zap, AlertTriangle, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex w-2 h-2 rounded-full ${active ? "bg-primary pulse-dot" : "bg-muted-foreground"}`} />
  );
}

function LevelBar({ level, warn = 25, crit = 15 }: { level: number; warn?: number; crit?: number }) {
  const color = level <= crit ? "bg-destructive" : level <= warn ? "bg-amber-400" : "bg-primary";
  return (
    <div className="w-full bg-muted rounded-full h-2 mt-2">
      <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${Math.min(100, level)}%` }} />
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading, refetch } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey(), refetchInterval: 10000 },
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading system status...</p>
        </div>
      </div>
    );
  }

  const alerts = data?.recentAlerts ?? [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Live overview of all IoT modules</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          data-testid="button-refresh-dashboard"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-5" data-testid="card-water-tank">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center">
                <Droplets className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-sm font-medium">Water Tank</span>
            </div>
            <StatusDot active={data?.waterTank?.motorStatus === "on"} />
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">
            {data?.waterTank?.level?.toFixed(1) ?? "--"}%
          </div>
          <LevelBar level={data?.waterTank?.level ?? 0} />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">Motor</span>
            <Badge
              variant={data?.waterTank?.motorStatus === "on" ? "default" : "secondary"}
              className="text-xs"
              data-testid="badge-motor-status"
            >
              {(data?.waterTank?.motorStatus ?? "off").toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5" data-testid="card-water-chiller">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-400/10 flex items-center justify-center">
                <Thermometer className="w-4 h-4 text-teal-400" />
              </div>
              <span className="text-sm font-medium">Water Chiller</span>
            </div>
            <StatusDot active={data?.waterChiller?.coolerStatus === "on"} />
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">
            {data?.waterChiller?.temperature?.toFixed(1) ?? "--"}°C
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">Target: {data?.waterChiller?.targetTemperature ?? "--"}°C</span>
            <span className="text-xs text-muted-foreground">Level: {data?.waterChiller?.level?.toFixed(0) ?? "--"}%</span>
          </div>
          <LevelBar level={data?.waterChiller?.level ?? 0} warn={20} crit={10} />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">Filter</span>
            <Badge variant="secondary" className="text-xs">{(data?.waterChiller?.filterStatus ?? "auto").toUpperCase()}</Badge>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5" data-testid="card-lights">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-sm font-medium">Lights</span>
            </div>
            <StatusDot active={(data?.lights?.activeGroups ?? 0) > 0} />
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">
            {data?.lights?.activeGroups ?? 0}/{data?.lights?.totalGroups ?? 3}
          </div>
          <p className="text-xs text-muted-foreground">Active light groups</p>
          <div className="mt-3 flex gap-2">
            {["Critical", "Common", "Support"].map((g) => (
              <div key={g} className="flex-1 text-center">
                <div className="text-xs text-muted-foreground mb-1">{g}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5" data-testid="card-power">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-400/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-sm font-medium">Power</span>
            </div>
            {(data?.power?.anomalyCount ?? 0) > 0 && (
              <Badge variant="destructive" className="text-xs gap-1">
                <AlertTriangle className="w-2.5 h-2.5" />
                {data?.power?.anomalyCount} anomalies
              </Badge>
            )}
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">
            {((data?.power?.totalConsumptionKwh ?? 0)).toFixed(2)} kW
          </div>
          <p className="text-xs text-muted-foreground">Total consumption</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">Active Rooms</span>
            <span className="text-xs font-medium text-foreground">{data?.power?.activeRooms ?? "--"}</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Recent Alerts
        </h2>
        {alerts.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            No recent alerts — all systems normal
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((log: any, i: number) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                {log.level === "critical" || log.level === "error" ? (
                  <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{log.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {log.module} · {log.timestamp ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }) : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
