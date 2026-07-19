import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  RefreshCw, 
  ShieldAlert, 
  CloudRain, 
  MapPin, 
  Plus, 
  Minus, 
  Activity, 
  Sparkles,
  Info
} from "lucide-react";
import { CommandState, Incident } from "../types";

interface SectorData {
  id: string;
  name: string;
  points: string;
  occupancy: number;
  status: "CRITICAL" | "STRESSED" | "NOMINAL";
  color: string;
  textPos: { x: number; y: number };
}

const SECTORS: SectorData[] = [
  { id: "sec-n", name: "North Stand (Zone 1)", points: "200,100 400,100 370,160 230,160", occupancy: 94, status: "CRITICAL", color: "#EF4444", textPos: { x: 300, y: 130 } },
  { id: "sec-ne", name: "North-East (Zone 2)", points: "400,100 500,180 420,200 370,160", occupancy: 82, status: "STRESSED", color: "#F97316", textPos: { x: 420, y: 155 } },
  { id: "sec-e", name: "East Stand (Zone 3)", points: "500,180 500,270 420,250 420,200", occupancy: 54, status: "NOMINAL", color: "#10B981", textPos: { x: 450, y: 225 } },
  { id: "sec-se", name: "South-East (Zone 4)", points: "500,270 400,350 370,290 420,250", occupancy: 42, status: "NOMINAL", color: "#10B981", textPos: { x: 420, y: 295 } },
  { id: "sec-s", name: "South Stand (Zone 5)", points: "400,350 200,350 230,290 370,290", occupancy: 78, status: "STRESSED", color: "#F97316", textPos: { x: 300, y: 320 } },
  { id: "sec-sw", name: "South-West (Zone 6)", points: "200,350 100,270 180,250 230,290", occupancy: 39, status: "NOMINAL", color: "#10B981", textPos: { x: 180, y: 295 } },
  { id: "sec-w", name: "West Stand (Zone 7)", points: "100,270 100,180 180,200 180,250", occupancy: 61, status: "NOMINAL", color: "#10B981", textPos: { x: 150, y: 225 } },
  { id: "sec-wn", name: "West-North (Zone 8)", points: "100,180 200,100 230,160 180,200", occupancy: 91, status: "CRITICAL", color: "#EF4444", textPos: { x: 180, y: 155 } }
];

interface IntelligenceViewProps {
  state: CommandState;
  onRefresh: () => void;
  onSelectIncident: (inc: Incident) => void;
  onAddIncident: (inc: Partial<Incident>) => void;
}

export default function IntelligenceView({ 
  state, 
  onRefresh, 
  onSelectIncident,
  onAddIncident
}: IntelligenceViewProps) {
  const [mapMode, setMapMode] = useState<"2D" | "3D">("3D");
  const [zoom, setZoom] = useState(1);
  const [selectedGate, setSelectedGate] = useState<string | null>(null);
  const [radarScanning, setRadarScanning] = useState(true);

  const { telemetry, incidents } = state;

  return (
    <div className="grid grid-cols-12 gap-6 h-full overflow-y-auto pr-2 custom-scrollbar bg-[#050505]">
      {/* LEFT COLUMN: Live Attendance & Alerts */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
        
        {/* Live Attendance */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-5 border border-white/10 bg-[#0a0a0a]"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black tracking-widest text-primary uppercase flex items-center gap-2 font-sans">
              <Activity className="w-4 h-4 text-primary animate-pulse" /> LIVE ATTENDANCE STATUS
            </h3>
            <button 
              onClick={onRefresh}
              className="p-1.5 hover:bg-white/5 rounded transition-colors text-on-surface-variant cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="micro-label">TOTAL CAPACITY</p>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-black text-on-surface">
                  {telemetry.attendance.totalCount.toLocaleString()}
                </span>
                <span className="font-mono text-xs text-on-surface-variant">/ 80,000 SPECTATORS</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-3 rounded border border-white/5 hover:border-primary/20 transition-colors">
                <p className="micro-label !mb-1">ACTIVE IN BOWL</p>
                <p className="font-mono text-lg font-bold text-white">
                  {telemetry.attendance.activeInBowl.toLocaleString()}
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded border border-white/5 hover:border-primary/20 transition-colors">
                <p className="micro-label !mb-1">IN CONCOURSE</p>
                <p className="font-mono text-lg font-bold text-primary">
                  {telemetry.attendance.inConcourse.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Dynamic Progress Bar */}
            <div>
              <div className="flex justify-between text-[10px] text-on-surface-variant font-mono mb-1">
                <span className="tracking-widest">FILL RATIO</span>
                <span>{((telemetry.attendance.totalCount / telemetry.attendance.capacity) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-primary to-white h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(telemetry.attendance.totalCount / telemetry.attendance.capacity) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Alerts Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl flex-1 flex flex-col border border-white/10 min-h-[350px] bg-[#0a0a0a]"
        >
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#111]/30">
            <h3 className="text-xs font-black tracking-widest text-primary uppercase flex items-center gap-2 font-sans">
              <ShieldAlert className="w-4 h-4 text-primary animate-pulse" /> LIVE LOGS FEED
            </h3>
            <span className="text-[10px] border border-primary/40 text-primary px-2 py-0.5 rounded font-black font-mono">
              {incidents.filter(i => i.status === "OPEN" && i.level === "CRITICAL").length} CRITICAL
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[420px] custom-scrollbar">
            <AnimatePresence initial={false}>
              {incidents.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-5 h-5 text-on-surface-variant opacity-60" />
                  </div>
                  <p className="text-xs font-bold text-on-surface uppercase tracking-wider font-sans">No Active Incidents</p>
                  <p className="text-[11px] text-on-surface-variant mt-1 max-w-[220px] mx-auto font-sans leading-relaxed">
                    All stadium networks and operations are running nominally.
                  </p>
                </div>
              ) : (
                incidents.slice(0, 5).map((inc) => (
                  <motion.div
                    key={inc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onClick={() => onSelectIncident(inc)}
                    className={`p-4 rounded border cursor-pointer transition-all hover:bg-white/5 flex gap-3 ${
                      inc.level === "CRITICAL" 
                        ? "border-primary/40 bg-primary/5 border-l-4 border-l-primary" 
                        : inc.level === "MODERATE"
                        ? "border-white/10 bg-white/5 border-l-4 border-l-white"
                        : "border-white/5 bg-white/5 border-l-4 border-l-gray-500"
                    }`}
                  >
                    <div className="shrink-0 pt-0.5">
                      <span className={`w-2 h-2 rounded-full block animate-pulse ${
                        inc.level === "CRITICAL" ? "bg-primary" : inc.level === "MODERATE" ? "bg-white" : "bg-gray-500"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest font-mono ${
                          inc.level === "CRITICAL" ? "text-primary" : "text-on-surface"
                        }`}>
                          {inc.type} // {inc.level}
                        </span>
                        <span className="text-[9px] font-mono text-on-surface-variant">{inc.timestamp}</span>
                      </div>
                      <h4 className="text-xs font-bold text-on-surface mb-1 font-sans uppercase tracking-tight">{inc.title}</h4>
                      <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed font-sans">
                        "{inc.description}"
                      </p>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                        <span className="text-[9px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-on-surface-variant">
                          ZONE: {inc.location}
                        </span>
                        <span className="text-[9px] font-bold text-primary tracking-wider">RESOLVE →</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* CENTER COLUMN: Intelligence 3D Canvas */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 h-full">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-xl flex-1 relative overflow-hidden group min-h-[480px] border border-white/10 flex flex-col bg-[#0a0a0a]"
        >
          {/* Header Controls inside map */}
          <div className="p-4 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 z-10 flex justify-between items-center">
            <div>
              <div className="micro-label">SPATIAL CANVAS</div>
              <h2 className="text-sm font-black text-on-surface uppercase tracking-wider font-sans">Stadium Intelligence Grid</h2>
            </div>
            
            <div className="flex gap-2">
              <div className="bg-black/60 border border-white/10 rounded p-0.5 flex gap-1">
                <button 
                  onClick={() => setMapMode("2D")}
                  className={`text-[9px] font-black tracking-widest px-3 py-1 rounded transition-all cursor-pointer ${
                    mapMode === "2D" ? "bg-primary text-black" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  2D VIEW
                </button>
                <button 
                  onClick={() => setMapMode("3D")}
                  className={`text-[9px] font-black tracking-widest px-3 py-1 rounded transition-all cursor-pointer ${
                    mapMode === "3D" ? "bg-primary text-black" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  3D MESH
                </button>
              </div>

              <button 
                onClick={() => setRadarScanning(!radarScanning)}
                className={`p-1.5 border rounded transition-colors flex items-center justify-center cursor-pointer ${
                  radarScanning ? "border-primary/50 text-primary bg-primary/5" : "border-white/10 text-on-surface-variant hover:bg-white/5"
                }`}
                title="Toggle Scanning Grid"
              >
                <Activity className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Simulated Stadium Map Area */}
          <div className="flex-1 relative bg-black/40 flex items-center justify-center overflow-hidden">
            {/* Background heat waves */}
            <div className="absolute inset-0 bg-radial-gradient from-primary/10 via-transparent to-transparent opacity-60 pointer-events-none" />

            {/* Radar Sweep Effect */}
            {radarScanning && (
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent origin-left z-0 pointer-events-none"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ top: '50%', left: '50%', width: '100%', height: '100%', transformOrigin: 'top left', marginTop: '-50%', marginLeft: '-50%' }}
              />
            )}

            {/* Simulated 3D Stadium Vector Graphic Overlay */}
            <div 
              className="relative w-[85%] h-[85%] max-w-[500px] flex items-center justify-center transition-all duration-500"
              style={{ 
                transform: `scale(${zoom}) ${mapMode === "3D" ? "perspective(600px) rotateX(40deg) rotateZ(-15deg)" : ""}`,
              }}
            >
              {/* Interactive Vector SVG Stadium Heatmap & Seating Grid */}
              <svg 
                viewBox="0 0 600 450" 
                className="w-full h-full rounded-xl pointer-events-auto select-none opacity-85"
                style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))" }}
              >
                {/* Background Concentric Radar Rings */}
                <circle cx="300" cy="225" r="235" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="6,6" />
                <circle cx="300" cy="225" r="195" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4,4" />
                <circle cx="300" cy="225" r="150" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                {/* Stadium Roof / Outer Boundary Edge */}
                <path 
                  d="M 200,90 Q 300,70 400,90 Q 510,170 510,225 Q 510,280 400,360 Q 300,380 200,360 Q 90,280 90,225 Q 90,170 200,90 Z" 
                  fill="none" 
                  stroke="rgba(242, 125, 38, 0.2)" 
                  strokeWidth="3.5" 
                  className="animate-pulse"
                />

                {/* Seating Sectors Bowl */}
                <g>
                  {SECTORS.map((sec) => {
                    const isSelected = selectedGate === sec.name;
                    return (
                      <polygon
                        key={sec.id}
                        points={sec.points}
                        className="transition-all duration-300 cursor-pointer stroke-white/10 hover:stroke-primary/50"
                        style={{
                          fill: sec.status === "CRITICAL" 
                            ? "rgba(239, 68, 68, 0.35)" 
                            : sec.status === "STRESSED" 
                            ? "rgba(249, 115, 22, 0.25)" 
                            : "rgba(16, 185, 129, 0.12)",
                          stroke: isSelected ? "rgba(242, 125, 38, 0.8)" : "rgba(255,255,255,0.1)",
                          strokeWidth: isSelected ? 2 : 1,
                        }}
                        onClick={() => setSelectedGate(sec.name)}
                      />
                    );
                  })}
                </g>

                {/* Seating Sectors Overlay Text Labels */}
                {SECTORS.map((sec) => (
                  <text
                    key={`label-${sec.id}`}
                    x={sec.textPos.x}
                    y={sec.textPos.y}
                    textAnchor="middle"
                    className="font-mono font-black select-none pointer-events-none fill-white/90 text-[8px]"
                    style={{ fontSize: "7.5px", letterSpacing: "0.2px", textShadow: "1px 1px 2px rgba(0,0,0,0.9)" }}
                  >
                    {sec.occupancy}%
                  </text>
                ))}

                {/* Pitch Outer Runway Track */}
                <rect x="230" y="175" width="140" height="100" rx="6" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

                {/* Soccer Pitch field */}
                <g className="opacity-75">
                  <rect x="240" y="185" width="120" height="80" rx="4" fill="#0f2a1b" stroke="#10b981" strokeWidth="2" />
                  {/* Center lines */}
                  <line x1="300" y1="185" x2="300" y2="265" stroke="#10b981" strokeWidth="1.5" />
                  {/* Center circle */}
                  <circle cx="300" cy="225" r="16" fill="none" stroke="#10b981" strokeWidth="1.5" />
                  <circle cx="300" cy="225" r="2.5" fill="#10b981" />
                  {/* Penalty Box Left */}
                  <rect x="240" y="201" width="22" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" />
                  <rect x="240" y="213" width="8" height="24" fill="none" stroke="#10b981" strokeWidth="1.5" />
                  {/* Penalty Box Right */}
                  <rect x="338" y="201" width="22" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" />
                  <rect x="352" y="213" width="8" height="24" fill="none" stroke="#10b981" strokeWidth="1.5" />
                </g>
              </svg>

              {/* Dynamic Overlay Markers (Gates) */}
              {/* Gate A (Critical Pressure Hotspot) */}
              <motion.div 
                onClick={() => setSelectedGate("Gate A")}
                className="absolute top-[22%] left-[44%] z-20 cursor-pointer"
                whileHover={{ scale: 1.15 }}
              >
                <div className="bg-[#F27D26] text-black p-2.5 rounded border border-white/20 shadow-2xl flex flex-col items-center">
                  <span className="text-[8px] font-black tracking-widest font-mono">GATE A</span>
                  <span className="text-[10px] font-black animate-pulse uppercase">CRITICAL</span>
                  <div className="w-12 bg-black/30 h-1 mt-1 rounded-full overflow-hidden">
                    <div className="bg-white h-full rounded-full" style={{ width: "95%" }}></div>
                  </div>
                </div>
                {/* Glow ring */}
                <div className="absolute -inset-2 border-2 border-[#F27D26] rounded animate-ping opacity-45 pointer-events-none" />
              </motion.div>

              {/* Gate B (Nominal) */}
              <motion.div 
                onClick={() => setSelectedGate("Gate B")}
                className="absolute bottom-[28%] right-[32%] z-20 cursor-pointer"
                whileHover={{ scale: 1.15 }}
              >
                <div className="bg-black/90 backdrop-blur-md p-2.5 rounded border border-[#F27D26]/40 shadow-2xl flex flex-col items-center text-white">
                  <span className="text-[8px] font-bold tracking-widest font-mono text-gray-400">GATE B</span>
                  <span className="text-[10px] font-black text-[#F27D26] uppercase">NOMINAL</span>
                  <div className="w-12 bg-white/20 h-1 mt-1 rounded-full overflow-hidden">
                    <div className="bg-[#F27D26] h-full rounded-full" style={{ width: "42%" }}></div>
                  </div>
                </div>
              </motion.div>

              {/* Concourse North (Warning Alert) */}
              <motion.div 
                onClick={() => setSelectedGate("Concourse North")}
                className="absolute top-[48%] right-[18%] z-20 cursor-pointer"
                whileHover={{ scale: 1.15 }}
              >
                <div className="bg-black/90 backdrop-blur-md p-2 rounded border border-white/20 shadow-2xl flex flex-col items-center">
                  <span className="text-[7px] font-mono tracking-widest text-gray-400">CONCOURSE NE</span>
                  <span className="text-[9px] font-bold text-white animate-pulse">STRESSED (82%)</span>
                </div>
              </motion.div>
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
              <button 
                onClick={() => setZoom(prev => Math.min(prev + 0.15, 1.6))}
                className="bg-surface-container-high hover:bg-surface-container-highest border border-white/10 p-2 rounded-lg shadow-lg active:scale-95 transition-transform text-on-surface cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.7))}
                className="bg-surface-container-high hover:bg-surface-container-highest border border-white/10 p-2 rounded-lg shadow-lg active:scale-95 transition-transform text-on-surface cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button 
                onClick={() => { setZoom(1); setSelectedGate(null); }}
                className="bg-surface-container-high hover:bg-surface-container-highest border border-white/10 p-2 rounded-lg shadow-lg active:scale-95 transition-transform text-on-surface cursor-pointer"
                title="Reset View"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Floating Gate Info Box */}
            <AnimatePresence>
              {selectedGate && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-4 left-4 z-20 max-w-[280px] bg-surface-container-high/95 backdrop-blur-md border border-white/15 p-4 rounded-xl shadow-2xl"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-bold text-on-surface">{selectedGate} Spatial Telemetry</h4>
                    <button 
                      onClick={() => setSelectedGate(null)}
                      className="text-[10px] text-on-surface-variant hover:text-on-surface bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                  {selectedGate === "Gate A" ? (
                    <div className="space-y-2 text-[11px] leading-relaxed">
                      <p className="text-on-surface-variant">
                        Flow rate: <span className="text-primary font-bold">142 fans/min</span>. Congestion triggered due to Metro Shuttle Line S-4 schedule mismatch.
                      </p>
                      <div className="bg-primary/10 border border-primary/20 p-2 rounded flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-[10px] text-primary">ACTION REQUIRED: Deploy 4 Stewards.</span>
                      </div>
                    </div>
                  ) : selectedGate === "Gate B" ? (
                    <div className="space-y-1 text-[11px] text-on-surface-variant">
                      <p>Flow rate: <span className="text-green-400 font-bold">45 fans/min</span>.</p>
                      <p>Security scan times averaging <span className="text-green-400 font-bold">12s per person</span>.</p>
                      <p>All turnstiles fully operational.</p>
                    </div>
                  ) : (
                    <div className="space-y-1 text-[11px] text-on-surface-variant">
                      <p>Food stalls at peak. Lines reaching 15m.</p>
                      <p>Air conditioning units at 100% load.</p>
                      <p>Staff dispatched to assist with crowd lanes.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stadium Heatmap legend */}
            <div className="absolute bottom-4 left-4 z-10 hidden sm:flex gap-1 bg-black/55 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono">HIGH DENSITY</span>
              </div>
              <span className="text-white/20 mx-1">|</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tertiary" />
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono">MODERATE</span>
              </div>
              <span className="text-white/20 mx-1">|</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono">LOW</span>
              </div>
            </div>
          </div>

          {/* Bottom GenAI Smart Insights Bar */}
          <div className="p-4 bg-primary/5 border-t border-primary/25 relative group overflow-hidden flex items-center">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="flex items-center gap-3 w-full z-10">
              <Sparkles className="w-5 h-5 text-primary shrink-0 animate-pulse" />
              <div className="flex-1 overflow-hidden">
                <p className="text-xs text-on-surface italic line-clamp-1">
                  <span className="font-bold text-primary uppercase mr-1">AI Prediction:</span> 15% increase in Gate A pressure expected at 18:00 due to airport rail transfer arrivals. Rerouting is recommended.
                </p>
              </div>
              
              <button 
                onClick={() => {
                  onAddIncident({
                    title: "Anticipated Gate A Compression",
                    description: "Pre-emptive action to allocate supplementary Stewards to Gate A for 18:00 rush.",
                    level: "MODERATE",
                    location: "Gate A",
                    type: "LOGISTICS"
                  });
                }}
                className="text-[10px] font-bold text-primary hover:underline transition-all cursor-pointer bg-primary/10 px-2 py-1 rounded"
              >
                DEPLOY STEWARDS
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RIGHT SIDEBAR: Transport & Environmental Data */}
      <div className="col-span-12 lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#050505] p-1">
        
        {/* Transport Hub Status */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-5 border border-white/10 bg-[#0a0a0a]"
        >
          <div className="micro-label">TRANSPORT LOGISTICS</div>
          <h3 className="text-sm font-black tracking-widest text-primary uppercase mb-4 flex items-center gap-2 font-sans">
            <Activity className="w-4 h-4 text-primary" /> HUB CONNECTIVITY
          </h3>
          <div className="space-y-3">
            {telemetry.transit.map((tr, index) => (
              <div key={index} className="flex items-center justify-between border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded flex items-center justify-center ${
                    tr.status === "ON TIME" ? "bg-primary/10 text-primary" : "bg-white/10 text-white"
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-[9px] text-on-surface-variant font-mono uppercase tracking-wider leading-none">{tr.name}</p>
                    <p className="text-xs font-bold text-on-surface mt-1 font-sans uppercase">{tr.hub}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-on-surface">{tr.time}</p>
                  <span className={`text-[8px] font-bold uppercase tracking-widest ${
                    tr.status === "ON TIME" ? "text-primary" : "text-white"
                  }`}>
                    {tr.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Environmental Data & Tiny Radar */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-5 border border-white/10 flex flex-col md:flex-row gap-5 bg-[#0a0a0a]"
        >
          <div className="flex-1">
            <div className="micro-label">ENVIRONMENTAL INTELLIGENCE</div>
            <h3 className="text-sm font-black tracking-widest text-primary uppercase mb-4 flex items-center gap-2 font-sans">
              <CloudRain className="w-4 h-4 text-primary" /> ATMOSPHERE TELEMETRY
            </h3>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/5 mb-3">
              <div>
                <span className="font-mono text-2xl font-black text-on-surface leading-none">{telemetry.weather.temp}</span>
                <span className="block text-[10px] text-on-surface-variant mt-1 uppercase tracking-wider font-mono">
                  {telemetry.weather.condition}
                </span>
              </div>
              <CloudRain className="w-8 h-8 text-primary" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/5 p-2 rounded">
                <span className="block text-[8px] text-on-surface-variant uppercase font-mono">Hum.</span>
                <span className="font-mono text-xs text-on-surface font-bold">{telemetry.weather.humidity}</span>
              </div>
              <div className="bg-white/5 p-2 rounded">
                <span className="block text-[8px] text-on-surface-variant uppercase font-mono">Wind</span>
                <span className="font-mono text-xs text-on-surface font-bold">{telemetry.weather.wind}</span>
              </div>
              <div className="bg-white/5 p-2 rounded">
                <span className="block text-[8px] text-on-surface-variant uppercase font-mono">Precip.</span>
                <span className="font-mono text-xs text-on-surface font-bold">{telemetry.weather.precipitation}</span>
              </div>
            </div>
          </div>

          {/* Environmental Scan Radar Map Visualizer */}
          <div className="w-full md:w-44 h-32 rounded border border-white/10 relative overflow-hidden bg-black">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWk71UN6KicceaDLKa12Ia5cMBByQWWqMeTaa_fZTxl7V1H3dYe1IuVXKNRutDOpSt8AsHIsVC_VluuRsbxCvHy-j0Z4zZIM7O81Vxnv-46c-TMJ8cORNyyxDa7Iuy3w1OEbpm8CpJ7bNyd563JlA4iiX1aJQTnW3bhv0e2zSzQmALSXZQNiNzrlo-NomUYEMO6b1xTka7Erpu1jftPPziFhtOGa2MPH8yAj0GqEbRjpZPPjOfYBuAUWwiQll9pELW4nwI3xs7Gl77"
              alt="Weather Radar Simulation"
              className="w-full h-full object-cover opacity-50 grayscale"
            />
            {/* Dynamic scanning bar */}
            <motion.div 
              className="absolute inset-x-0 h-0.5 bg-primary/80 shadow-[0_0_8px_#F27D26]"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute bottom-1 right-2 text-[8px] font-mono text-on-surface-variant uppercase tracking-widest">RADAR 4.0 // ACTIVE</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
