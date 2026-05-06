import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wifi, Droplets, Thermometer, Lightbulb, Zap, Shield, BarChart3,
  Cpu, Radio, ArrowRight, CheckCircle2, AlertTriangle, Activity,
  CopyrightIcon
} from "lucide-react";

const features = [
  {
    icon: Droplets,
    title: "Water Tank Automation",
    desc: "Ultrasonic level sensors monitor tank levels 24/7. Auto motor control triggers at 15% (critical) with warnings at 25%. Full at 98% shuts off automatically.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: Thermometer,
    title: "Water Chiller Control",
    desc: "Drinking water chiller with temperature regulation via cooling AC. Set target temp from the dashboard. Auto filter control based on water level.",
    color: "text-teal-400",
    bg: "bg-teal-400/10",
  },
  {
    icon: Lightbulb,
    title: "Smart Lights Management",
    desc: "Three lighting zones — Critical (always on), Common (6PM–6AM), and Wing Support (evening hours). Fully schedulable with manual override.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: Zap,
    title: "Power Consumption Monitor",
    desc: "Per-room energy monitoring with anomaly detection. Identifies holiday periods with active appliances and heavy power draw patterns.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
];

const devices = [
  { name: "Ultrasonic Sensor (HC-SR04)", use: "Water level detection", type: "Sensor" },
  { name: "NodeMCU / ESP8266", use: "Wireless IoT gateway", type: "Module" },
  { name: "ESP32", use: "Multi-sensor hub", type: "Module" },
  { name: "Current Transformer (SCT-013)", use: "Power monitoring per room", type: "Sensor" },
  { name: "DS18B20 Temp Probe", use: "Chiller temperature reading", type: "Sensor" },
  { name: "5V Relay Module", use: "Motor / filter / light switching", type: "Actuator" },
  { name: "Float Switch", use: "Backup level detection", type: "Sensor" },
  { name: "ZMPT101B", use: "Voltage measurement", type: "Sensor" },
];

const benefits = [
  "Prevent water shortages with automated motor control",
  "Reduce electricity waste with scheduled lighting",
  "Detect appliances left on during holidays",
  "Real-time alerts for critical infrastructure",
  "Historical data for consumption analysis",
  "Centralized admin control from any device",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wifi className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">HostelIoT</span>
            <Badge variant="secondary" className="text-xs">v2.0</Badge>
          </div>
          <Link href="/login">
            <Button data-testid="button-login-header" size="sm" className="gap-2">
              Admin Login <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-primary pulse-dot" />
          <span className="text-sm text-primary font-mono">SYSTEM ACTIVE</span>
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-6">
          Smart Hostel Resource
          <br />
          <span className="text-primary">Management System</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
          A complete IoT platform for monitoring and automating water, lighting, and power systems across hostel infrastructure — in real time.
        </p>
        <div className="flex gap-4">
          <Link href="/login">
            <Button data-testid="button-get-started" size="lg" className="gap-2">
              Access Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {[
            { label: "Sensors", value: "40+", icon: Radio },
            { label: "Rooms Monitored", value: "72", icon: Zap },
            { label: "Light Zones", value: "3", icon: Lightbulb },
            { label: "Uptime", value: "99.9%", icon: Activity },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card border border-border rounded-lg p-4 text-center">
              <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <h2 className="text-2xl font-bold mb-2">Four Core Modules</h2>
        <p className="text-muted-foreground mb-10">Each module integrates physical sensors with intelligent automation logic.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-2">System Benefits</h2>
            <p className="text-muted-foreground mb-6">Designed for hostel wardens and facilities managers.</p>
            <div className="space-y-3">
              {benefits.map((b) => (
                <div key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{b}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Anomaly Detection</h2>
            <p className="text-muted-foreground mb-6">Intelligent alerting for unusual patterns.</p>
            <div className="space-y-3">
              {[
                { title: "Holiday Appliance Alert", desc: "Room consuming power during closed hostel period" },
                { title: "High Draw Warning", desc: "Room drawing >1500W — possible AC or geyser" },
                { title: "Water Level Critical", desc: "Tank below 15% — auto motor activation" },
                { title: "Temperature Drift", desc: "Chiller temp exceeds setpoint by >2°C" },
              ].map(({ title, desc }) => (
                <div key={title} className="flex items-start gap-3 bg-card border border-border rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <h2 className="text-2xl font-bold mb-2">Hardware Devices</h2>
        <p className="text-muted-foreground mb-8">Industry-standard IoT components connected wirelessly over Wi-Fi.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {devices.map(({ name, use, type }) => (
            <div key={name} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-3 h-3 text-primary" />
                <Badge variant="outline" className="text-xs">{type}</Badge>
              </div>
              <p className="text-sm font-medium text-foreground mb-1">{name}</p>
              <p className="text-xs text-muted-foreground">{use}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <div className="bg-card border border-primary/20 rounded-xl p-8 text-center">
          <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Admin Access Required</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            All management features are protected. Log in with your admin credentials to access the control dashboard.
          </p>
          <Link href="/login">
            <Button data-testid="button-login-cta" size="lg" className="gap-2">
              Login to Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>HostelIoT Resource Management System powered by SkyLine IT Labs &copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
