import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetWaterChillerStatus, getGetWaterChillerStatusQueryKey,
  useGetWaterChillerHistory, getGetWaterChillerHistoryQueryKey,
  useSetChillerTemperature, useControlChillerFilter,
} from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Thermometer, RefreshCw, Power, Wind } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";

export default function WaterChiller() {
  const qc = useQueryClient();
  const [tempInput, setTempInput] = useState<number>(20);

  const { data: status, refetch } = useGetWaterChillerStatus({
    query: { queryKey: getGetWaterChillerStatusQueryKey(), refetchInterval: 12000 },
  });
  const { data: history } = useGetWaterChillerHistory(
    { hours: 24 },
    { query: { queryKey: getGetWaterChillerHistoryQueryKey({ hours: 24 }), refetchInterval: 30000 } },
  );
  const tempMutation = useSetChillerTemperature({
    mutation: {
      onSuccess: () => qc.invalidateQueries({ queryKey: getGetWaterChillerStatusQueryKey() }),
    },
  });
  const filterMutation = useControlChillerFilter({
    mutation: {
      onSuccess: () => qc.invalidateQueries({ queryKey: getGetWaterChillerStatusQueryKey() }),
    },
  });

  const chartData = (history ?? []).map((r: any) => ({
    time: format(new Date(r.timestamp), "HH:mm"),
    temp: r.temperature,
    level: r.levelPercent,
  }));

  const level = status?.levelPercent ?? 65;
  const temp = status?.temperature ?? 19.5;
  const targetTemp = status?.targetTemperature ?? 20;
  const filterStatus = status?.filterStatus ?? "auto";
  const coolerStatus = status?.coolerStatus ?? "off";
  const tempDiff = Math.abs(temp - targetTemp);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Water Chiller Control</h1>
          <p className="text-sm text-muted-foreground mt-1">Drinking water purification and temperature management</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground" data-testid="button-refresh-chiller">
          <RefreshCw className="w-3.5 h-3.5" />
          Live · 12s
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-teal-400/10 flex items-center justify-center">
            <Thermometer className="w-8 h-8 text-teal-400" />
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground">{temp.toFixed(1)}°C</div>
            <div className="text-xs text-muted-foreground mt-1">Current Temperature</div>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${tempDiff > 2 ? "bg-destructive" : tempDiff > 1 ? "bg-amber-400" : "bg-primary"}`}
              style={{ width: `${Math.min(100, (temp / 35) * 100)}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground">Target: {targetTemp}°C</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">Tank Level</h3>
          <div className="text-3xl font-bold mb-2">{level.toFixed(1)}%</div>
          <div className="w-full bg-muted rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full transition-all ${level <= 10 ? "bg-destructive" : level <= 20 ? "bg-amber-400" : "bg-primary"}`}
              style={{ width: `${level}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Capacity</span><span className="text-foreground">{status?.capacityLiters ?? "--"} L</span>
            </div>
            <div className="flex justify-between">
              <span>Current</span><span className="text-foreground">{status?.currentLiters ?? "--"} L</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Cooling AC Status</h4>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-teal-400" />
              <Badge
                variant={coolerStatus === "on" ? "default" : "secondary"}
                data-testid="badge-cooler-status"
              >
                Cooler {coolerStatus.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Filter Status</h4>
            <div className="flex items-center gap-2">
              <Power className="w-4 h-4 text-blue-400" />
              <Badge
                variant={filterStatus === "on" ? "default" : "secondary"}
                data-testid="badge-filter-status"
              >
                Filter {filterStatus.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="text-xs text-muted-foreground pt-2 border-t border-border">
            <p>Filter auto-turns ON at &lt;20% level</p>
            <p>Filter auto-turns OFF at 98% level</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Temperature Setpoint</h3>
          <div className="space-y-4">
            <Slider
              min={5} max={35} step={0.5}
              value={[tempInput]}
              onValueChange={([v]) => setTempInput(v)}
              className="w-full"
              data-testid="slider-temperature"
            />
            <div className="flex items-center gap-3">
              <Input
                type="number" min={5} max={35} step={0.5}
                value={tempInput}
                onChange={(e) => setTempInput(parseFloat(e.target.value))}
                className="w-24 bg-background"
                data-testid="input-temperature"
              />
              <span className="text-sm text-muted-foreground">°C</span>
              <Button
                data-testid="button-set-temperature"
                size="sm"
                onClick={() => tempMutation.mutate({ data: { temperature: tempInput } })}
                disabled={tempMutation.isPending}
              >
                {tempMutation.isPending ? "Setting..." : "Set Temperature"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Cooling AC will activate automatically to maintain setpoint</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Filter Control</h3>
          <div className="flex gap-3 mb-4">
            {(["on", "off", "auto"] as const).map((action) => (
              <Button
                key={action}
                data-testid={`button-filter-${action}`}
                variant={filterStatus === action ? "default" : "outline"}
                size="sm"
                onClick={() => filterMutation.mutate({ data: { action } })}
                disabled={filterMutation.isPending}
              >
                {action.toUpperCase()}
              </Button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground space-y-1.5 pt-3 border-t border-border">
            <p>AUTO: Automatically controlled by tank level</p>
            <p>ON: Force filter on (manual override)</p>
            <p>OFF: Force filter off (manual override)</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Temperature History (24h)</h3>
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No history data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 20% 18%)" />
              <XAxis dataKey="time" tick={{ fill: "hsl(215 15% 55%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(215 15% 55%)", fontSize: 11 }} unit="°C" />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(220 25% 10%)", border: "1px solid hsl(217 20% 18%)", borderRadius: "8px" }}
                formatter={(v: any, name: string) => [name === "temp" ? `${v.toFixed(1)}°C` : `${v.toFixed(1)}%`, name === "temp" ? "Temperature" : "Level"]}
              />
              <Line type="monotone" dataKey="temp" stroke="hsl(174 72% 45%)" strokeWidth={2} dot={false} name="temp" />
              <Line type="monotone" dataKey="level" stroke="hsl(38 92% 55%)" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="level" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
