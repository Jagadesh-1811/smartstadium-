import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  Activity, 
  MessageSquare, 
  Compass, 
  HeartHandshake, 
  BarChart3, 
  Terminal, 
  Bell, 
  Settings, 
  HelpCircle, 
  AlertOctagon, 
  Radio, 
  Sparkles,
  RefreshCw,
  PlusCircle,
  HelpCircleIcon,
  LogIn,
  LogOut,
  Loader2,
  Users
} from "lucide-react";

import { CommandState, Incident, SystemLog } from "./types";
import IntelligenceView from "./components/IntelligenceView";
import DispatchView from "./components/DispatchView";
import ExperienceView from "./components/ExperienceView";
import RoleAnalysisView from "./components/RoleAnalysisView";

// Firebase Client Imports
import { auth, googleAuthProvider } from "./lib/firebase.ts";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

export default function App() {
  const [tab, setTab] = useState<"intelligence" | "dispatch" | "mobility" | "experience" | "analytics">("intelligence");
  const [state, setState] = useState<CommandState | null>(null);
  const [loading, setLoading] = useState(true);
  const [emergencyAlert, setEmergencyAlert] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [newIncidentTitle, setNewIncidentTitle] = useState("");
  const [newIncidentDesc, setNewIncidentDesc] = useState("");
  const [newIncidentLevel, setNewIncidentLevel] = useState("MODERATE");
  const [showAddIncidentModal, setShowAddIncidentModal] = useState(false);

  // Active Simulated Operator Role (Adapts dynamic capabilities)
  const [userSimulatedRole, setUserSimulatedRole] = useState<string>("commander");

  // Authentication State
  const [user, setUser] = useState<{
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    role: string;
  } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);

          // Sync with the PostgreSQL backend
          const syncRes = await fetch("/api/users/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${idToken}`
            },
            body: JSON.stringify({
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL
            })
          });

          if (syncRes.ok) {
            const dbUser = await syncRes.json();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "Operator",
              photoURL: firebaseUser.photoURL || "",
              role: dbUser.role || "operator"
            });
            setUserSimulatedRole(dbUser.role || "commander");
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "Operator",
              photoURL: firebaseUser.photoURL || "",
              role: "operator"
            });
            setUserSimulatedRole("commander");
          }
        } catch (e) {
          console.error("Auth sync error:", e);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "Operator",
            photoURL: firebaseUser.photoURL || "",
            role: "operator"
          });
          setUserSimulatedRole("commander");
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch telemetry state from backend
  const fetchState = async () => {
    try {
      const res = await fetch("/api/state");
      const data = await res.json();
      setState(data);
    } catch (e) {
      console.error("Failed to load operations state:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    // Refresh state every 8 seconds for live simulation updates
    const interval = setInterval(fetchState, 8000);
    return () => clearInterval(interval);
  }, []);

  // Update incident status
  const handleUpdateStatus = async (id: string, status: string) => {
    if (userSimulatedRole === "observer") {
      handleAddLog("SECURITY ERROR: Guest Observer is restricted from changing incident status.", "alert");
      return;
    }
    try {
      const res = await fetch(`/api/incidents/${id}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchState();
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  // Add a new incident manually
  const handleAddIncident = async (incidentData: Partial<Incident>) => {
    if (userSimulatedRole === "observer") {
      handleAddLog("SECURITY ERROR: Guest Observer is restricted from logging new incidents.", "alert");
      return;
    }
    if (userSimulatedRole === "medical_officer" && incidentData.type !== "MEDICAL" && incidentData.type !== "SECURITY") {
      handleAddLog(`ROLE ACTION: Medical Officer registered non-medical incident [${incidentData.type}]. Secondary clearance logged.`, "info");
    }
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          ...incidentData,
          userId: user?.uid
        })
      });
      if (res.ok) {
        fetchState();
        setShowAddIncidentModal(false);
        setNewIncidentTitle("");
        setNewIncidentDesc("");
      }
    } catch (e) {
      console.error("Failed to add incident:", e);
    }
  };

  // Trigger simulated live sensor event
  const triggerSimulationEvent = async () => {
    if (userSimulatedRole === "observer" || userSimulatedRole === "medical_officer") {
      handleAddLog(`SECURITY ERROR: [${userSimulatedRole.toUpperCase()}] restricted from initiating automated network simulation triggers.`, "alert");
      return;
    }
    try {
      const res = await fetch("/api/simulate-trigger", { 
        method: "POST",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        fetchState();
      }
    } catch (e) {
      console.error("Simulation trigger failed:", e);
    }
  };

  // Sign-in handler
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (e) {
      console.error("Google login failed:", e);
    }
  };

  // Sign-out handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Signout failed:", e);
    }
  };

  // Add custom manual status log line
  const handleAddLog = (text: string, type: string) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        systemLogs: [
          { time: timeStr, text, type: type as any },
          ...prev.systemLogs
        ]
      };
    });
  };

  // Trigger global emergency mode
  const toggleEmergencyMode = () => {
    if (userSimulatedRole !== "commander") {
      handleAddLog(`SECURITY FAILURE: [${userSimulatedRole.toUpperCase()}] lacks authorization to initiate or disarm general emergency broadcast signals.`, "alert");
      return;
    }
    const nextMode = !emergencyAlert;
    setEmergencyAlert(nextMode);
    handleAddLog(
      nextMode 
        ? "ALL STATIONS: GENERAL EMERGENCY BROADCAST SIGNALS INITIATED. CROWD LANES DIRECTED TO ALTERNATE GATES."
        : "Emergency alert protocol disarmed. Returning stadium operations to nominal routing.",
      nextMode ? "alert" : "system"
    );
  };

  if (loadingAuth) {
    return (
      <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-xs font-mono text-on-surface-variant tracking-widest uppercase">Initializing Operational Handshakes...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-[#050505] flex items-center justify-center p-4 select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(242,125,38,0.08)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded p-8 shadow-2xl relative z-10 space-y-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded bg-primary/10 flex items-center justify-center border border-primary/20 mb-2">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-xl font-black text-on-surface tracking-wider uppercase font-sans">
              StadiumIntel <span className="text-primary font-light">2026</span>
            </h1>
            <p className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded font-mono tracking-widest text-primary font-black uppercase">
              FIFA WORLD CUP COMMAND
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              This system is restricted to authorized World Cup organizers, commanders, and logistics staff. Secure credentials are required to initiate uplink.
            </p>

            <button
              onClick={handleLogin}
              className="w-full py-3 bg-primary hover:bg-primary-container text-black font-black text-xs uppercase tracking-widest rounded transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> SECURE LOGIN WITH GOOGLE
            </button>
          </div>

          <div className="pt-4 border-t border-white/5 text-[9px] font-mono text-on-surface-variant">
            DOWNLINK SYSTEM SECURITY V4.2.1 • REGION ASIA-SOUTHEAST1
          </div>
        </div>
      </div>
    );
  }

  if (loading || !state) {
    return (
      <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-on-surface-variant tracking-wider uppercase font-sans">Loading StadiumIntel 2026 tactical environment...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-background text-on-surface select-none ${emergencyAlert ? "emergency-mode" : ""}`}>
      
      {/* 1. TOP GLOBAL NAVIGATION HEADER */}
      <header className="fixed top-0 w-full h-16 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-6 shadow-xl">
        <div className="flex items-center gap-4">
          <span className="text-lg font-black text-primary tracking-tighter uppercase font-sans">
            StadiumIntel <span className="text-on-surface font-light">2026</span>
          </span>
          <span className="hidden sm:inline-block text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded font-mono tracking-widest text-on-surface-variant uppercase">
            NEURAL OPS FRAMEWORK
          </span>
        </div>

        {/* Tactical Actions Right aligned */}
        <div className="flex items-center gap-4">
          
          {/* Simulation Trigger button */}
          <button 
            onClick={triggerSimulationEvent}
            className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-on-surface px-3.5 py-1.5 rounded text-xs font-black tracking-wider uppercase active:scale-95 transition-all cursor-pointer"
          >
            <Radio className="w-4 h-4 text-primary animate-pulse" /> Simulate Event
          </button>

          {/* Emergency Red Alert button */}
          <button 
            onClick={toggleEmergencyMode}
            className={`px-4 py-1.5 rounded text-xs font-black tracking-wider uppercase active:scale-95 transition-all flex items-center gap-2 cursor-pointer border ${
              emergencyAlert 
                ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(242,125,38,0.5)]" 
                : "bg-white/5 hover:bg-white/10 border-white/10 text-on-surface"
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            {emergencyAlert ? "DISARM ALERT" : "EMERGENCY PROTOCOL"}
          </button>

          {/* Settings & Info Icons */}
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <button 
              onClick={() => setShowGuideModal(true)}
              className="p-2 hover:bg-white/5 rounded transition-colors cursor-pointer animate-pulse"
              title="Operational Playbook"
            >
              <HelpCircle className="w-4.5 h-4.5" />
            </button>

            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-white/5 rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              title="Secure Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
            
            {/* User Profile Face */}
            <div className="w-8 h-8 rounded overflow-hidden border border-white/10 ml-2 bg-primary/20 flex items-center justify-center text-primary font-bold text-xs" title={`${user.displayName} (${user.role})`}>
              {user.photoURL ? (
                <img 
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                user.displayName.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. SIDEBAR NAVIGATION PANELS */}
      <div className="flex-1 flex pt-16">
        <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-64px)] z-40 bg-[#0a0a0a] border-r border-white/10 flex flex-col justify-between py-6">
          
          {/* Header area */}
          <div className="px-5 mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-xs font-bold uppercase text-primary leading-none tracking-widest font-sans">Command Center</h2>
                <span className="text-[9px] font-mono font-bold tracking-widest text-on-surface-variant opacity-65">ACTIVE OPS: WC2026</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1">
            <button 
              onClick={() => setTab("intelligence")}
              className={`w-full flex items-center gap-4 px-5 py-3.5 text-left border-l-2 transition-all cursor-pointer ${
                tab === "intelligence" 
                  ? "bg-primary/5 text-primary border-primary font-black" 
                  : "text-on-surface-variant hover:bg-white/5 border-transparent hover:text-on-surface"
              }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-bold tracking-widest uppercase font-sans">CROWD INTELLIGENCE</span>
            </button>

            <button 
              onClick={() => setTab("dispatch")}
              className={`w-full flex items-center gap-4 px-5 py-3.5 text-left border-l-2 transition-all cursor-pointer ${
                tab === "dispatch" 
                  ? "bg-primary/5 text-primary border-primary font-black" 
                  : "text-on-surface-variant hover:bg-white/5 border-transparent hover:text-on-surface"
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-bold tracking-widest uppercase font-sans">DISPATCH CORE</span>
            </button>

            <button 
              onClick={() => setTab("experience")}
              className={`w-full flex items-center gap-4 px-5 py-3.5 text-left border-l-2 transition-all cursor-pointer ${
                tab === "experience" 
                  ? "bg-primary/5 text-primary border-primary font-black" 
                  : "text-on-surface-variant hover:bg-white/5 border-transparent hover:text-on-surface"
              }`}
            >
              <HeartHandshake className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-bold tracking-widest uppercase font-sans">FAN EXPERIENCE</span>
            </button>

            <button 
              onClick={() => setTab("analytics")}
              className={`w-full flex items-center gap-4 px-5 py-3.5 text-left border-l-2 transition-all cursor-pointer ${
                tab === "analytics" 
                  ? "bg-primary/5 text-primary border-primary font-black" 
                  : "text-on-surface-variant hover:bg-white/5 border-transparent hover:text-on-surface"
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-bold tracking-widest uppercase font-sans">SYSTEM ROLES</span>
            </button>
          </nav>

          {/* Bottom links */}
          <div className="px-5 mt-auto space-y-4">
            <button 
              onClick={() => setShowAddIncidentModal(true)}
              className="w-full bg-primary hover:bg-primary-container text-black font-black py-2.5 rounded text-[10px] tracking-wider uppercase active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> LOG INCIDENT
            </button>

            <div className="pt-4 border-t border-white/5 space-y-2">
              <div 
                onClick={() => setTab("dispatch")}
                className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface text-[10px] font-bold uppercase tracking-widest cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-on-surface-variant shrink-0" />
                <span>Operational logs</span>
              </div>
              <div 
                onClick={() => setShowGuideModal(true)}
                className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface text-[10px] font-bold uppercase tracking-widest cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-on-surface-variant shrink-0" />
                <span>Playbook Guide</span>
              </div>
            </div>
          </div>
        </aside>

        {/* 3. MAIN INTERACTIVE CONTENT GRID VIEW */}
        <main className="flex-1 ml-64 p-6 overflow-hidden h-[calc(100vh-64px)] relative bg-[#050505]">
          
          {/* Header titles */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="micro-label">OPERATIONS GRID // WC26</div>
              <h1 className="text-2xl font-black tracking-tight text-on-surface flex items-center gap-3 font-sans uppercase">
                {tab === "intelligence" 
                  ? "Crowd Intelligence & Telemetry" 
                  : tab === "dispatch" 
                  ? "AI Dispatch & Tactical Coordination" 
                  : tab === "experience"
                  ? "Spectator Experience & Inclusion"
                  : "Role-Based Operations Analysis"}
                {emergencyAlert && (
                  <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded font-black font-mono animate-pulse">
                    HIGH ALERT PROTOCOL ACTIVE
                  </span>
                )}
              </h1>
              <p className="text-xs text-on-surface-variant mt-1">
                {tab === "intelligence" 
                  ? "Real-time density, ticket check-ins, weather warnings, and AI operations predictions."
                  : tab === "dispatch"
                  ? "Live incident logger, personnel location mapping, and Gemini-powered dispatcher partner."
                  : tab === "experience"
                  ? "Interactive sentiment cloud, multilingual volunteer support ratios, and live experience feeds."
                  : "Analyze operational profiles, active tactical command levels, and real-time permission matrices."}
              </p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={fetchState}
                className="px-3.5 py-1.5 border border-white/10 hover:bg-white/5 rounded text-on-surface transition-all cursor-pointer flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase"
              >
                <RefreshCw className="w-3.5 h-3.5" /> RE-SYNC GRID
              </button>
            </div>
          </div>

          {/* Dynamic Inner View Switcher */}
          <div className="h-[calc(100%-80px)]">
            <AnimatePresence mode="wait">
              {tab === "intelligence" && (
                <motion.div
                  key="intel"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="h-full"
                >
                  <IntelligenceView 
                    state={state} 
                    onRefresh={fetchState} 
                    onSelectIncident={(inc) => {
                      setTab("dispatch");
                    }}
                    onAddIncident={(data) => handleAddIncident(data)}
                  />
                </motion.div>
              )}

              {tab === "dispatch" && (
                <motion.div
                  key="dispatch"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="h-full"
                >
                  <DispatchView 
                    state={state} 
                    onRefresh={fetchState} 
                    onUpdateStatus={handleUpdateStatus}
                    onAddLog={handleAddLog}
                    onSelectIncident={() => {}}
                    token={token}
                  />
                </motion.div>
              )}

              {tab === "experience" && (
                <motion.div
                  key="experience"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="h-full"
                >
                  <ExperienceView 
                    state={state} 
                    onRefresh={fetchState} 
                    onSelectIncident={() => setTab("dispatch")}
                    onAddIncident={(data) => handleAddIncident(data)}
                    onAddLog={handleAddLog}
                  />
                </motion.div>
              )}

              {tab === "analytics" && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="h-full"
                >
                  <RoleAnalysisView 
                    state={state} 
                    currentRole={userSimulatedRole}
                    onRoleChange={(newRole) => setUserSimulatedRole(newRole)}
                    onRefresh={fetchState}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* TACTICAL GUIDE PLAYBOOK MODAL */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-surface-container border border-white/10 p-6 rounded-2xl shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h4 className="text-sm font-black text-on-surface uppercase tracking-wider">StadiumIntel 2026 Playbook</h4>
                </div>
                <button 
                  onClick={() => setShowGuideModal(false)}
                  className="text-xs text-on-surface-variant hover:text-on-surface bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg transition-all cursor-pointer"
                >
                  Dismiss
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-on-surface-variant">
                <p>
                  Welcome to the <span className="font-bold text-primary">2026 FIFA World Cup</span> Tactical Command Center. This dashboard is powered by a real-time Express backend and a customized server-side <span className="font-bold text-secondary">Gemini 3.5 AI Engine</span>.
                </p>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5 space-y-2">
                  <p className="font-bold text-on-surface uppercase tracking-wider text-[10px]">OPERATIONAL FEATURES:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><span className="font-bold text-on-surface">Gemini AI Dispatch Chat:</span> Type queries like "Find nearest German speaker" or "Suggest congestion protocol" to receive direct personnel recommendations and action triggers.</li>
                    <li><span className="font-bold text-on-surface">Event Simulator:</span> Click <span className="text-secondary font-bold">"Simulate Event"</span> in the header to trigger real-time sensor warnings, medical alerts, or crowd flow updates.</li>
                    <li><span className="font-bold text-on-surface">Interactive Canvas:</span> View and zoom into the 3D stadium mesh. Click hotspots like Gate A or Gate B to read live spatial telemetry.</li>
                    <li><span className="font-bold text-on-surface">Sentiment Word Cloud:</span> Click any sentiment word in the Experience tab to extract the underlying crowd feedback details.</li>
                  </ul>
                </div>
                <p className="italic text-[10px]">
                  StadiumIntel is optimized for low latency and high operations reliability under extreme World Cup match-day loads.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANUAL INCIDENT REGISTRATION MODAL */}
      <AnimatePresence>
        {showAddIncidentModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-surface-container border border-white/10 p-6 rounded-2xl shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">Log Custom Tactical Incident</h4>
                <button 
                  onClick={() => setShowAddIncidentModal(false)}
                  className="text-xs text-on-surface-variant hover:text-on-surface bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant">Incident Title</label>
                  <input 
                    type="text" 
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-xs text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    placeholder="e.g. VIP Transport Arrived, Escalator Blockage"
                    value={newIncidentTitle}
                    onChange={(e) => setNewIncidentTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant">Description</label>
                  <textarea 
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-xs text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none h-20 resize-none"
                    placeholder="Provide full operational details..."
                    value={newIncidentDesc}
                    onChange={(e) => setNewIncidentDesc(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-on-surface-variant">Priority Level</label>
                    <select 
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-xs text-on-surface outline-none"
                      value={newIncidentLevel}
                      onChange={(e) => setNewIncidentLevel(e.target.value)}
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="MODERATE">MODERATE</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-on-surface-variant">stadium location</label>
                    <input 
                      type="text" 
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-xs text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                      placeholder="e.g. Section 112, Gate B"
                      id="newIncidentLoc"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    const locInput = document.getElementById("newIncidentLoc") as HTMLInputElement;
                    handleAddIncident({
                      title: newIncidentTitle,
                      description: newIncidentDesc,
                      level: newIncidentLevel,
                      location: locInput?.value || "Stadium Perimeter",
                      type: "LOGISTICS"
                    });
                  }}
                  className="w-full bg-primary text-on-primary font-black py-2.5 rounded-lg uppercase text-xs tracking-wider cursor-pointer active:scale-95 transition-all"
                >
                  Register Action Item
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
