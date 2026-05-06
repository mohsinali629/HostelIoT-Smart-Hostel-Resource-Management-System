import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetLightGroups, getGetLightGroupsQueryKey,
  useUpdateLightGroup, useToggleLightGroup,
} from "@/lib/api";
import { Lightbulb, RefreshCw, Clock, MapPin, Shield, Users, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const typeConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  critical: { icon: Shield, color: "text-destructive", bg: "bg-destructive/10", label: "Critical" },
  common: { icon: Users, color: "text-amber-400", bg: "bg-amber-400/10", label: "Common" },
  support: { icon: Building2, color: "text-blue-400", bg: "bg-blue-400/10", label: "Support" },
};

function LightCard({ group, onToggle, onUpdate }: { group: any; onToggle: any; onUpdate: any }) {
  const cfg = typeConfig[group.type] ?? typeConfig.common;
  const Icon = cfg.icon;
  const [mode, setMode] = useState(group.mode);
  const [scheduleStart, setScheduleStart] = useState(group.schedules?.[0]?.startTime ?? "");
  const [scheduleEnd, setScheduleEnd] = useState(group.schedules?.[0]?.endTime ?? "");

  return (
    <div className="bg-card border border-border rounded-xl p-5" data-testid={`card-light-group-${group.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${cfg.color}`} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">{group.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className={`text-xs ${cfg.color}`}>{cfg.label}</Badge>
              <span className="text-xs text-muted-foreground">{group.lightCount} lights</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${group.isOn ? "bg-primary pulse-dot" : "bg-muted-foreground"}`} />
          <span className={`text-xs font-medium ${group.isOn ? "text-primary" : "text-muted-foreground"}`}>
            {group.isOn ? "ON" : "OFF"}
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{group.description}</p>

      <div className="flex items-start gap-2 mb-4">
        <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex flex-wrap gap-1">
          {(group.locations ?? []).map((loc: string) => (
            <span key={loc} className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{loc}</span>
          ))}
        </div>
      </div>

      {group.schedules?.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          {group.schedules.map((s: any, i: number) => (
            <span key={i}>{s.startTime} – {s.endTime}</span>
          ))}
        </div>
      )}

      <div className="space-y-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Button
            data-testid={`button-lights-on-${group.id}`}
            size="sm"
            variant={group.isOn ? "default" : "outline"}
            onClick={() => onToggle(group.id, true)}
            className="flex-1"
          >
            <Lightbulb className="w-3.5 h-3.5 mr-1.5" />
            Turn ON
          </Button>
          <Button
            data-testid={`button-lights-off-${group.id}`}
            size="sm"
            variant={!group.isOn ? "default" : "outline"}
            onClick={() => onToggle(group.id, false)}
            className="flex-1"
          >
            Turn OFF
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Mode</Label>
          <Select value={mode} onValueChange={(v) => setMode(v)}>
            <SelectTrigger className="bg-background text-xs h-8" data-testid={`select-mode-${group.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">AUTO (Schedule)</SelectItem>
              <SelectItem value="manual">MANUAL</SelectItem>
              <SelectItem value="always-on">ALWAYS ON</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {mode === "auto" && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Start</Label>
              <Input type="time" value={scheduleStart} onChange={(e) => setScheduleStart(e.target.value)} className="bg-background text-xs h-8" data-testid={`input-schedule-start-${group.id}`} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">End</Label>
              <Input type="time" value={scheduleEnd} onChange={(e) => setScheduleEnd(e.target.value)} className="bg-background text-xs h-8" data-testid={`input-schedule-end-${group.id}`} />
            </div>
          </div>
        )}

        <Button
          data-testid={`button-save-lights-${group.id}`}
          size="sm"
          className="w-full"
          onClick={() =>
            onUpdate(group.id, {
              mode,
              schedules: mode === "auto" && scheduleStart && scheduleEnd
                ? [{ startTime: scheduleStart, endTime: scheduleEnd, days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] }]
                : [],
            })
          }
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}

export default function Lights() {
  const qc = useQueryClient();
  const { data: groups, refetch } = useGetLightGroups({
    query: { queryKey: getGetLightGroupsQueryKey(), refetchInterval: 60000 },
  });
  const updateMutation = useUpdateLightGroup({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetLightGroupsQueryKey() }) },
  });
  const toggleMutation = useToggleLightGroup({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetLightGroupsQueryKey() }) },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Lights Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Exterior and common area lighting — schedule and control</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground" data-testid="button-refresh-lights">
          <RefreshCw className="w-3.5 h-3.5" />
          Auto · 60s
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {(groups ?? []).map((group: any) => (
          <LightCard
            key={group.id}
            group={group}
            onToggle={(id: string, on: boolean) =>
              toggleMutation.mutate({ groupId: id, data: { on } })
            }
            onUpdate={(id: string, body: any) =>
              updateMutation.mutate({ groupId: id, data: body })
            }
          />
        ))}
      </div>
    </div>
  );
}
