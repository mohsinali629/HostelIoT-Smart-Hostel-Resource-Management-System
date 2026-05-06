import { useState } from "react";
import { useGetSystemLogs, getGetSystemLogsQueryKey } from "@/lib/api";
import { ScrollText, RefreshCw, Info, AlertTriangle, XCircle, AlertOctagon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

const levelConfig: Record<string, { icon: any; color: string; bg: string }> = {
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10" },
  error: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  critical: { icon: AlertOctagon, color: "text-destructive", bg: "bg-destructive/10" },
};

const moduleColors: Record<string, string> = {
  "water-tank": "bg-blue-400/15 text-blue-400 border-blue-400/20",
  "water-chiller": "bg-teal-400/15 text-teal-400 border-teal-400/20",
  lights: "bg-amber-400/15 text-amber-400 border-amber-400/20",
  power: "bg-purple-400/15 text-purple-400 border-purple-400/20",
  auth: "bg-pink-400/15 text-pink-400 border-pink-400/20",
  system: "bg-muted text-muted-foreground border-border",
};

export default function Logs() {
  const [moduleFilter, setModuleFilter] = useState("all");

  const params = moduleFilter !== "all" ? { module: moduleFilter as any, limit: 100 } : { limit: 100 };
  const { data: logs, refetch, isFetching } = useGetSystemLogs(params, {
    query: { queryKey: getGetSystemLogsQueryKey(params), refetchInterval: 30000 },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">System Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Event history for all IoT modules</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          data-testid="button-refresh-logs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Auto · 30s
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <ScrollText className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter by module:</span>
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-48 bg-card border-border" data-testid="select-module-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            <SelectItem value="water-tank">Water Tank</SelectItem>
            <SelectItem value="water-chiller">Water Chiller</SelectItem>
            <SelectItem value="lights">Lights</SelectItem>
            <SelectItem value="power">Power</SelectItem>
            <SelectItem value="auth">Auth</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{(logs ?? []).length} entries</span>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {(logs ?? []).length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            No log entries found
          </div>
        ) : (
          <div className="divide-y divide-border">
            {(logs ?? []).map((log: any, i: number) => {
              const lvl = levelConfig[log.level] ?? levelConfig.info;
              const LevelIcon = lvl.icon;
              return (
                <div key={log.id ?? i} className="flex items-start gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors" data-testid={`log-entry-${i}`}>
                  <div className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${lvl.bg}`}>
                    <LevelIcon className={`w-3.5 h-3.5 ${lvl.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${moduleColors[log.module] ?? moduleColors.system}`}>
                        {log.module}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs border-0 px-1.5 py-0 ${lvl.bg} ${lvl.color}`}
                      >
                        {log.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">{log.message}</p>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono flex-shrink-0 pt-0.5">
                    {log.timestamp ? format(new Date(log.timestamp), "MMM d, HH:mm:ss") : ""}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
