import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Cloud, 
  Globe, 
  Rss, 
  HelpCircle, 
  Camera, 
  AlertTriangle, 
  Users, 
  Clock, 
  QrCode,
  Sparkles
} from "lucide-react";
import { CommandState, Incident } from "../types";

interface ExperienceViewProps {
  state: CommandState;
  onRefresh: () => void;
  onSelectIncident: (inc: Incident) => void;
  onAddIncident: (inc: Partial<Incident>) => void;
  onAddLog: (text: string, type: string) => void;
}

export default function ExperienceView({ 
  state, 
  onRefresh, 
  onSelectIncident,
  onAddIncident,
  onAddLog
}: ExperienceViewProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [activeCam, setActiveCam] = useState<string | null>(null);

  const { telemetry, incidents, sentimentWords } = state;

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
    onAddLog(`Analyzed spectator sentiment focus: "${word}"`, "system");
  };

  const getSentimentInsight = (word: string) => {
    const insights: Record<string, string> = {
      Excited: "High positive energy detected across Zone 1 and 3. Crowd cheering decibels peaking at 98dB.",
      Loud: "Audio sensor arrays warning of elevated decibels in Sector 112. No immediate threat, fans celebrating.",
      Amazing: "Highly favorable spectator feedback received via interactive QR code portal.",
      "Hot Weather": "Temperature holding at 24°C, humidity is moderate. Hydration centers adequately supplied.",
      Victory: "High-level celebration in fan zones. Supplement security Stewards stationed at exit pathways.",
      Crowded: "Concourse NE shows temporary bottleneck near food kiosks. Access lanes clear.",
      "Long Lines": "Scanner 04 at East Gate reporting average wait time of 18 minutes. Suggested rerouting.",
      "Clean Seats": "Facilities feedback score is at 4.9/5.0 stars in the South Pavilion.",
      "Helpful Staff": "Over 95% satisfaction rate recorded on volunteer assistance feedback scans.",
      "App Error": "3 minor tickets registered regarding ticket wallet loading delays. System patch applied.",
      Iconic: "Viral social feeds tracking stadium projection lights. Digital footprint rising."
    };
    return insights[word] || "Spectator sentiment analysis continues to track positive venue feedback.";
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full overflow-y-auto pr-2 custom-scrollbar bg-[#050505]">
      
      {/* 1. COLUMN 1: Sentiment & Multilingual Live meters */}
      <div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-6 bg-[#050505]">
        
        {/* Real-time Sentiment Word Cloud */}
        <div className="col-span-2 md:col-span-1 glass-card p-5 rounded-xl border border-white/10 flex flex-col h-80 relative overflow-hidden bg-[#0a0a0a]">
          <div className="flex justify-between items-center mb-4 z-10">
            <h3 className="text-xs font-black tracking-widest text-primary uppercase flex items-center gap-2 font-sans">
              <Cloud className="w-4 h-4 text-primary" /> SPECTATOR SENTIMENT FEED
            </h3>
            <span className="text-[9px] border border-primary/40 text-primary px-2 py-0.5 rounded font-bold font-mono uppercase">LIVE FEED</span>
          </div>

          {/* Interactive Cloud Grid */}
          <div className="flex-1 relative flex flex-wrap items-center justify-center gap-2 p-3 z-10">
            {sentimentWords.length === 0 ? (
              <div className="text-center py-6 px-4">
                <p className="text-[11px] text-on-surface-variant font-sans italic">
                  No active sentiment keywords yet. Log spectator requests or comments to generate live keywords.
                </p>
              </div>
            ) : (
              sentimentWords.map((wordObj, i) => (
                <motion.span
                  key={i}
                  whileHover={{ scale: 1.15, rotate: Math.random() > 0.5 ? 2 : -2 }}
                  onClick={() => handleWordClick(wordObj.word)}
                  className={`cursor-pointer transition-colors hover:text-primary ${wordObj.color}`}
                  style={{ fontSize: `${Math.min(32, Math.max(12, wordObj.weight))}px` }}
                >
                  {wordObj.word}
                </motion.span>
              ))
            )}
          </div>

          {/* Inline Sentiment Insight Drawer */}
          <AnimatePresence>
            {selectedWord && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute inset-x-0 bottom-0 bg-[#111] border-t border-white/10 p-4 z-20"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black text-primary font-mono uppercase tracking-wider">INSIGHT: {selectedWord}</span>
                  <button 
                    onClick={() => setSelectedWord(null)}
                    className="text-[10px] text-white/65 hover:text-primary hover:underline cursor-pointer font-bold font-sans uppercase tracking-widest"
                  >
                    CLOSE [X]
                  </button>
                </div>
                <p className="text-xs text-on-surface italic leading-relaxed font-sans">
                  "{getSentimentInsight(selectedWord)}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accessibility Heatmap Card */}
        <div className="col-span-2 md:col-span-1 glass-card p-5 rounded-xl h-80 relative overflow-hidden group border border-white/10 bg-[#0a0a0a]">
          <div className="flex justify-between items-center mb-4 relative z-10">
            <h3 className="text-xs font-black tracking-widest text-primary uppercase flex items-center gap-2 font-sans">
              <Globe className="w-4 h-4 text-primary" /> VENUE USAGE GRID
            </h3>
            <div className="flex gap-1.5 items-center">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest">ELEVATOR FEED</span>
            </div>
          </div>

          {/* Map image overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700 grayscale"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMM21DZVQia_jh1slxBjh50BEZCiQ68i8RF8J09MrdeXvt0u-cI6AEAHEJi3KiMj_7HtC6q8XkOFwrrPuT7WrKTZj_MWVXI7JNa0T0XJhPGpFjffDa_jKknIEvLxPReyPHWir_HOa86LzJRmomv2CYIPvxm6vKsN0wwFGwzSwVQfTR9Z_zBm8CkCourcYLyITs5WBfITSbMNS2sgBJ1qN8AJHED9jQoH7rdVbogIQ3OZNsCjylRCVc90uWLIvtWG8SvO3IVw1svFRd"
              alt="Stadium accessibility layout heatmap"
            />
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-10 bg-black/90 p-3 rounded border border-white/15 backdrop-blur-md">
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="tracking-widest uppercase text-white/80">ELEVATOR E4 CORES:</span>
              <span className="text-primary font-black animate-pulse uppercase">CRITICAL LOAD (92%)</span>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "92%" }}></div>
            </div>
          </div>
        </div>

        {/* Multilingual Support Live Meters */}
        <div className="col-span-2 glass-card p-5 rounded-xl border border-white/10 bg-[#0a0a0a]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black tracking-widest text-primary uppercase flex items-center gap-2 font-sans">
              <Globe className="w-4 h-4 text-primary" /> MULTILINGUAL DEPLOYMENT
            </h3>
            <span className="text-[9px] text-white/50 font-mono uppercase tracking-widest">LIVE TRANSLATORS</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {telemetry.multilingual.map((m, index) => (
              <div key={index} className="p-3 rounded bg-white/5 border border-white/5 hover:border-primary/20 transition-colors">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-black text-on-surface uppercase tracking-wide font-sans">{m.lang}</span>
                  <span className="text-[9px] font-mono text-primary font-black">{m.volunteers}V / {m.requests}R</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-primary to-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${m.percent}%` }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. COLUMN 2: Experience / Fan Incident Feed */}
      <div className="col-span-12 lg:col-span-4 glass-card rounded-xl border border-white/10 flex flex-col max-h-[500px] bg-[#0a0a0a]">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#111]/80">
          <h3 className="text-xs font-black tracking-widest text-primary uppercase flex items-center gap-2 font-sans">
            <Rss className="w-4 h-4 text-primary" /> SPECTATOR REQUEST FEED
          </h3>
          <button 
            onClick={onRefresh}
            className="p-1.5 hover:bg-white/5 rounded transition-colors text-on-surface-variant cursor-pointer"
          >
            <Clock className="w-4 h-4 text-primary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {incidents.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-xs font-bold text-on-surface uppercase tracking-wider font-sans mb-1">Nominal State</p>
              <p className="text-[11px] text-on-surface-variant font-sans leading-relaxed">
                No custom spectator assistance requests logged yet. Use the button below to register spectator logs.
              </p>
            </div>
          ) : (
            incidents.slice(0, 4).map((inc) => (
              <div key={inc.id} className="p-4 rounded border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded font-mono ${
                      inc.level === "CRITICAL" ? "bg-primary text-black" : "bg-white/10 text-white"
                    }`}>
                      {inc.type} // {inc.level}
                    </span>
                    <h4 className="font-bold text-xs text-on-surface mt-2.5 font-sans uppercase tracking-tight">{inc.title}</h4>
                  </div>
                  <span className="font-mono text-[9px] text-on-surface-variant">{inc.relativeTime || "Just now"}</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mb-3 italic font-sans leading-relaxed">
                  "{inc.description}"
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 border border-primary/25 text-primary rounded text-[9px] font-bold font-mono uppercase tracking-widest">
                    AI CAT: {inc.aiCategory}
                  </span>

                  {inc.viewCamAvailable && (
                    <button 
                      onClick={() => setActiveCam(inc.location)}
                      className="text-[9px] font-black tracking-widest text-white flex items-center gap-1 hover:text-primary transition-colors cursor-pointer uppercase"
                    >
                      VIEW CAM <Camera className="w-3.5 h-3.5 text-primary" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-black/40 mt-auto border-t border-white/5">
          <button 
            onClick={() => {
              onAddIncident({
                title: "Inquiry on Ramps",
                description: "Elderly visitor requests assistant transport to level 2 ADA seats.",
                level: "LOW",
                location: "Concourse South",
                type: "FACILITIES"
              });
            }}
            className="w-full py-2.5 bg-primary hover:bg-primary-container text-black font-black text-xs uppercase tracking-widest rounded transition-all cursor-pointer"
          >
            LOG EXPERIENCE REQUEST
          </button>
        </div>
      </div>

      {/* 3. BOTTOM: Experience metrics Bento cards */}
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        
        <div className="glass-card p-5 rounded-xl flex items-center gap-4 border border-white/10 hover:border-primary/35 transition-colors bg-[#0a0a0a]">
          <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="block font-mono text-2xl font-black text-on-surface leading-none">{telemetry.inclusionScore}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant font-sans mt-1 block">Inclusion Score</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl flex items-center gap-4 border border-white/10 hover:border-primary/35 transition-colors bg-[#0a0a0a]">
          <div className="w-12 h-12 rounded bg-white/10 flex items-center justify-center border border-white/20">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="block font-mono text-2xl font-black text-on-surface leading-none">{telemetry.avgResponseTime}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant font-sans mt-1 block">Avg Assist Response</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl flex items-center gap-4 border border-white/10 hover:border-primary/35 transition-colors bg-[#0a0a0a]">
          <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
            <QrCode className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="block font-mono text-2xl font-black text-on-surface leading-none">{telemetry.feedbackScans.toLocaleString()}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant font-sans mt-1 block">Feedback Scans (Today)</span>
          </div>
        </div>

      </div>

      {/* Camera Live stream Modal */}
      <AnimatePresence>
        {activeCam && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-lg bg-[#0a0a0a] border border-white/15 p-6 rounded shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-sm font-black text-on-surface uppercase tracking-wider font-sans">Live CCTV Feed</h4>
                  <p className="text-[10px] text-primary uppercase tracking-widest font-mono mt-1">Sector: {activeCam} | Downlink Synced</p>
                </div>
                <button 
                  onClick={() => setActiveCam(null)}
                  className="bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded text-xs transition-colors cursor-pointer font-black uppercase tracking-widest font-mono"
                >
                  [CLOSE X]
                </button>
              </div>

              {/* Simulated camera feed */}
              <div className="aspect-video bg-black rounded overflow-hidden relative border border-white/10 flex items-center justify-center">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMM21DZVQia_jh1slxBjh50BEZCiQ68i8RF8J09MrdeXvt0u-cI6AEAHEJi3KiMj_7HtC6q8XkOFwrrPuT7WrKTZj_MWVXI7JNa0T0XJhPGpFjffDa_jKknIEvLxPReyPHWir_HOa86LzJRmomv2CYIPvxm6vKsN0wwFGwzSwVQfTR9Z_zBm8CkCourcYLyITs5WBfITSbMNS2sgBJ1qN8AJHED9jQoH7rdVbogIQ3OZNsCjylRCVc90WLIvtWG8SvO3IVw1svFRd"
                  alt="Live feed"
                  className="w-full h-full object-cover opacity-60 grayscale"
                />
                
                {/* Visualizer and camera noise overlay */}
                <div className="absolute top-3 left-3 bg-[#F27D26] text-black font-mono font-black text-[9px] px-2 py-0.5 rounded animate-pulse uppercase tracking-widest">
                  ● LIVE STREAM
                </div>
                
                {/* Horizontal scan line */}
                <motion.div 
                  className="absolute inset-x-0 h-0.5 bg-primary/20"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />

                <span className="absolute text-[10px] font-mono text-white/50 bottom-3 left-3 uppercase tracking-widest">CAM_CCTV_S4_NORD</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
