import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  Mic, 
  Bot, 
  User, 
  Sparkles, 
  Map, 
  Plus, 
  Minus, 
  Compass, 
  MoreVertical,
  Terminal,
  Volume2,
  VolumeX,
  Volume2Icon
} from "lucide-react";
import { CommandState, Incident, SystemLog } from "../types";

interface DispatchViewProps {
  state: CommandState;
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onAddLog: (text: string, type: string) => void;
  onSelectIncident: (inc: Incident) => void;
  token?: string | null;
}

export interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  match?: {
    name: string;
    distance: string;
    location: string;
    languages: string;
    actionLabel: string;
  } | null;
}

export default function DispatchView({ 
  state, 
  onRefresh, 
  onUpdateStatus, 
  onAddLog,
  onSelectIncident,
  token
}: DispatchViewProps) {
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Logistics systems fully initialized. I have real-time tracking over 450 stadium safety officers and 1,200 multilingual volunteers. How can I assist with spectator flow, access controls, or tactical team routing?",
      timestamp: "14:10:00"
    }
  ]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mapLayer, setMapLayer] = useState<"ALL" | "STAFF" | "VOLUNTEERS" | "EMERGENCY">("ALL");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loadingAI]);

  // Handle Dispatch AI Command
  const handleSendAI = async (messageText: string = chatInput) => {
    if (!messageText.trim()) return;
    
    const userMsg: ChatMessage = {
      sender: "user",
      text: messageText,
      timestamp: new Date().toTimeString().split(' ')[0]
    };

    setChatHistory(prev => [...prev, userMsg]);
    setChatInput("");
    setLoadingAI(true);

    try {
      const res = await fetch("/api/dispatch", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: messageText })
      });
      const data = await res.json();
      
      setChatHistory(prev => [...prev, {
        sender: "ai",
        text: data.text,
        timestamp: data.timestamp || new Date().toTimeString().split(' ')[0],
        match: data.match
      }]);
    } catch (e) {
      setChatHistory(prev => [...prev, {
        sender: "ai",
        text: "System response error. Unable to establish secure downlink with local Dispatch AI client. Please retry.",
        timestamp: new Date().toTimeString().split(' ')[0]
      }]);
    } finally {
      setLoadingAI(false);
    }
  };

  const startListening = () => {
    setIsListening(true);
    // Simulate speech detection
    setTimeout(() => {
      setIsListening(false);
      setChatInput("Find nearest multilingual volunteer speaking German near Gate 4");
    }, 2000);
  };

  // Deploy simulated action
  const handleActionDeployment = (actionName: string, targetName: string) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    onAddLog(`DEPLOYED: ${actionName} assigned to ${targetName}. Sector alert activated.`, "alert");
    
    // Add success feedback to chat
    setChatHistory(prev => [...prev, {
      sender: "ai",
      text: `Tactical Deployment Action [${actionName}] successfully routed. Volunteer/Unit was briefed on emergency channels and is now en-route.`,
      timestamp: timeStr
    }]);
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full overflow-hidden bg-[#050505]">
      
      {/* 1. LEFT COLUMN: Active Incident Grid Feed */}
      <section className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col border border-white/10 rounded-xl bg-[#0a0a0a] overflow-hidden h-full">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#111]/80">
          <h3 className="font-black text-xs tracking-widest text-primary uppercase flex items-center gap-2 font-sans">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> TACTICAL QUEUE
          </h3>
          <span className="border border-primary/40 text-primary px-2 py-0.5 rounded text-[9px] font-bold font-mono">
            {state.incidents.filter(i => i.status === "OPEN").length} ACTIVE
          </span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
          <AnimatePresence initial={false}>
            {state.incidents.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-xs font-bold text-on-surface uppercase tracking-wider font-sans mb-1">Queue Empty</p>
                <p className="text-[11px] text-on-surface-variant font-sans leading-relaxed">
                  All logged incidents resolved. No active dispatches required at this time.
                </p>
              </div>
            ) : (
              state.incidents.map((inc) => (
                <motion.div
                  key={inc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-4 rounded border transition-all ${
                    inc.status === "RESOLVED" ? "opacity-40 grayscale border-white/5" : ""
                  } ${
                    inc.level === "CRITICAL" 
                      ? "border-primary/40 bg-primary/5 hover:border-primary/60" 
                      : inc.level === "MODERATE"
                      ? "border-white/20 bg-white/5 hover:border-white/30"
                      : "border-white/5 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                      inc.level === "CRITICAL" ? "bg-primary text-black" : "bg-white/10 text-white"
                    }`}>
                      {inc.level}
                    </span>
                    <span className="font-mono text-[9px] text-on-surface-variant">{inc.timestamp}</span>
                  </div>

                  <h4 className="font-bold text-xs text-on-surface mb-1 font-sans uppercase tracking-tight">{inc.title}</h4>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed mb-3">
                    {inc.description}
                  </p>

                  {inc.status === "OPEN" ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          onUpdateStatus(inc.id, "DISPATCHED");
                          onAddLog(`Dispatched team to handle: ${inc.title}`, "alert");
                        }}
                        className="flex-1 bg-primary hover:bg-primary-container text-black text-[10px] font-black py-1.5 rounded active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
                      >
                        RESPOND
                      </button>
                      <button 
                        onClick={() => onUpdateStatus(inc.id, "RESOLVED")}
                        className="px-2.5 bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-on-surface border border-white/10 rounded text-xs transition-all cursor-pointer"
                        title="Mark Resolved"
                      >
                        ✓
                      </button>
                      <button 
                        onClick={() => {
                          setChatInput(`Analyze and route team for incident ${inc.id}: ${inc.title}`);
                        }}
                        className="p-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded text-xs transition-all cursor-pointer"
                        title="Send to Dispatch AI helper"
                      >
                        <Bot className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-1 bg-white/5 rounded text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                      {inc.status}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 2. CENTER COLUMN: Interactive Dispatch AI Chat */}
      <section className="col-span-12 md:col-span-8 lg:col-span-5 flex flex-col border border-white/10 rounded-xl bg-[#0a0a0a] overflow-hidden h-full">
        <div className="p-4 border-b border-white/10 bg-[#111]/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-on-surface leading-none uppercase tracking-wide">Dispatch AI Partner</h3>
              <p className="text-[9px] text-primary font-mono uppercase tracking-widest mt-1">Operational Logic Engine v4.2</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setChatHistory([
                  {
                    sender: "ai",
                    text: "Logistics systems fully initialized. State synced. Ready for tactical routing commands.",
                    timestamp: new Date().toTimeString().split(' ')[0]
                  }
                ]);
              }}
              className="text-[9px] font-black tracking-widest bg-white/5 px-2.5 py-1 rounded border border-white/10 hover:bg-white/10 transition-colors text-on-surface-variant cursor-pointer uppercase"
            >
              RESET FEED
            </button>
          </div>
        </div>

        {/* Chat Message Scroll */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4 bg-black/20">
          <AnimatePresence initial={false}>
            {chatHistory.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[90%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                <div className={`w-8 h-8 shrink-0 rounded flex items-center justify-center ${
                  msg.sender === "user" 
                    ? "bg-[#111] border border-white/15" 
                    : "bg-primary/15 border border-primary/30"
                }`}>
                  {msg.sender === "user" ? <User className="w-4 h-4 text-primary" /> : <Bot className="w-4 h-4 text-primary" />}
                </div>

                <div className={`p-4 rounded shadow-md ${
                  msg.sender === "user" 
                    ? "bg-primary/5 border border-primary/25 rounded-tr-none text-white" 
                    : "bg-[#111] border border-white/10 rounded-tl-none text-on-surface"
                }`}>
                  <p className="text-xs leading-relaxed font-sans">
                    {msg.text}
                  </p>

                  {/* Render Custom Data Matches returned by Gemini */}
                  {msg.match && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-3 p-3 bg-black/50 border border-white/10 rounded space-y-2"
                    >
                      <div className="flex justify-between items-center border-b border-white/5 pb-1">
                        <span className="text-[10px] font-black text-on-surface uppercase tracking-wider">{msg.match.name}</span>
                        <span className="text-[9px] font-mono text-primary font-bold">DIST: {msg.match.distance}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="bg-white/5 p-1.5 rounded">
                          <span className="text-[8px] block text-on-surface-variant font-mono uppercase tracking-wider">CURRENT LOCATION</span>
                          <span className="font-bold text-on-surface uppercase">{msg.match.location}</span>
                        </div>
                        <div className="bg-white/5 p-1.5 rounded">
                          <span className="text-[8px] block text-on-surface-variant font-mono uppercase tracking-wider">CREDENTIALS</span>
                          <span className="font-bold text-on-surface font-mono">{msg.match.languages}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleActionDeployment(msg.match!.actionLabel, msg.match!.name)}
                        className="w-full bg-primary hover:bg-primary-container text-black py-1.5 text-[9px] font-black uppercase rounded tracking-wider transition-all cursor-pointer"
                      >
                        {msg.match.actionLabel}
                      </button>
                    </motion.div>
                  )}

                  <span className="block text-[8px] font-mono text-on-surface-variant mt-2 text-right">
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            ))}

            {loadingAI && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex gap-3 max-w-[80%]"
              >
                <div className="w-8 h-8 rounded bg-primary/15 border border-primary/30 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-primary/5 border border-primary/20 p-4 rounded rounded-tl-none flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px] font-mono text-on-surface-variant ml-1">Deploying tactical algorithms...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input area */}
        <div className="p-4 pt-0">
          <div className="relative border border-white/10 rounded-xl bg-black/45 overflow-hidden flex items-end">
            <textarea
              className="flex-1 bg-transparent border-none text-xs p-3 pr-20 resize-none focus:ring-0 outline-none placeholder:text-on-surface-variant/40 text-on-surface"
              placeholder="Type dispatch order or ask to find nearest resources..."
              rows={1}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendAI();
                }
              }}
            />
            <div className="absolute right-3 bottom-2 flex items-center gap-2">
              <button 
                onClick={startListening}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  isListening ? "bg-primary/20 text-primary" : "text-on-surface-variant hover:text-on-surface"
                }`}
                title="Microphone input"
              >
                <Mic className={`w-4 h-4 ${isListening ? "animate-pulse" : ""}`} />
              </button>
              <button 
                onClick={() => handleSendAI()}
                className="p-1.5 bg-primary hover:bg-primary-container text-black rounded transition-colors cursor-pointer"
                title="Send Command"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. RIGHT COLUMN: Live Resource Map & Logs */}
      <section className="col-span-12 lg:col-span-4 flex flex-col bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden h-full">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#111]/80">
          <h3 className="font-black text-xs text-primary uppercase tracking-widest flex items-center gap-2 font-sans">
            <Map className="w-4 h-4 text-primary animate-pulse" /> LIVE SPATIAL RESOURCES
          </h3>
          <div className="flex gap-1 bg-black/40 p-0.5 rounded border border-white/5">
            {["ALL", "STAFF", "VOLUNTEERS", "EMERGENCY"].map((l) => (
              <button
                key={l}
                onClick={() => setMapLayer(l as any)}
                className={`text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded cursor-pointer ${
                  mapLayer === l ? "bg-primary text-black" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Blueprint Map Container */}
        <div className="flex-1 relative overflow-hidden group min-h-[220px]">
          <div 
            className="w-full h-full bg-cover bg-center transition-all duration-700 opacity-60 grayscale"
            style={{ 
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDIxoG3-NikqVrOanHo9aMXMPKp0PZiiYgbfyog2AEvVJGYJTkGYL5kMSbyOiFmkRRK7EUt0eulDi5ywVdnUeSrNr7LLblnu-6vys4C2KrzgFEoPLiOVmlDZfqR-lcYfvteabwH0olHF28yt3C7cpdixSxzsHD11XEPmiko8ig7eUXaIWTP7E7RNQh7uVmfYfk4eX72WMaxp5SWmIx0Ft5Yyjbb50q2Hq-M9VnWWsI6mZk4UtcSfj9MeG6PMIufugmfrcWgEy6VIGDm')`
            }}
          />

          {/* Interactive Resource Map Overlays */}
          {/* Legend Layer indicators overlay */}
          <div className="absolute top-3 left-3 bg-black/90 backdrop-blur-md p-2 rounded border border-white/15 space-y-1 z-10">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span className="text-[8px] font-bold tracking-widest uppercase font-mono">STAFF</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#F27D26]" />
              <span className="text-[8px] font-bold tracking-widest uppercase font-mono">VOLUNTEER</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[8px] font-bold tracking-widest uppercase font-mono">RESPONSE TEAM</span>
            </div>
          </div>

          {/* Dynamic Map Pins */}
          {(mapLayer === "ALL" || mapLayer === "STAFF") && (
            <motion.div 
              onClick={() => handleSendAI("Who is nearest security officer near Zone 8?")}
              className="absolute top-1/3 left-1/4 cursor-pointer"
              whileHover={{ scale: 1.2 }}
            >
              <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] border border-black animate-pulse" />
            </motion.div>
          )}

          {(mapLayer === "ALL" || mapLayer === "VOLUNTEERS") && (
            <motion.div 
              onClick={() => handleSendAI("Find German speaking volunteer")}
              className="absolute top-1/2 left-[48%] cursor-pointer"
              whileHover={{ scale: 1.2 }}
            >
              <div className="w-3 h-3 rounded-full bg-[#F27D26] shadow-[0_0_8px_#F27D26] border border-black" />
            </motion.div>
          )}

          {(mapLayer === "ALL" || mapLayer === "EMERGENCY") && (
            <motion.div 
              onClick={() => handleSendAI("Where is response Team Bravo?")}
              className="absolute top-[65%] left-[72%] cursor-pointer"
              whileHover={{ scale: 1.2 }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-primary shadow-[0_0_10px_#F27D26] border-2 border-black animate-ping" />
            </motion.div>
          )}
        </div>

        {/* Status logs and quick broadcast panel */}
        <div className="p-4 border-t border-white/10 space-y-4 bg-[#111]">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => {
                const text = "Dispatch Quick Medical Response Unit to East Gate Concourse.";
                handleSendAI(text);
                onAddLog("TRIGGERED: Quick response unit en-route.", "alert");
              }}
              className="flex flex-col items-center gap-1 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded hover:border-primary/40 active:scale-95 transition-all text-on-surface cursor-pointer group"
            >
              <Compass className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-center tracking-wider uppercase font-sans">Quick Response</span>
            </button>
            
            <button 
              onClick={() => {
                const text = "Broadcast Alert: Heavy crowd density recorded. Use alternate routes.";
                handleSendAI(text);
                onAddLog("BROADCAST: General crowd density warning sent to all turnstiles.", "alert");
              }}
              className="flex flex-col items-center gap-1 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded hover:border-primary/40 active:scale-95 transition-all text-on-surface cursor-pointer group"
            >
              <Terminal className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-center tracking-wider uppercase font-sans">Broadcast Alert</span>
            </button>
          </div>

          <div className="space-y-2">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant font-mono">Live Status Logs</h4>
            <div className="font-mono text-[10px] space-y-1.5 bg-black/60 p-3 rounded border border-white/5 h-28 overflow-y-auto custom-scrollbar">
              {state.systemLogs.map((log, index) => (
                <div 
                  key={index} 
                  className={`${
                    log.type === "alert" ? "text-primary font-bold" : log.type === "comm" ? "text-white opacity-80" : "text-white opacity-65"
                  }`}
                >
                  <span className="text-on-surface-variant mr-1">[{log.time}]</span> {log.text}
                </div>
              ))}
              <div className="text-on-surface-variant animate-pulse font-bold">_ Awaiting operator tactical commands...</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
