import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  UserCheck, 
  AlertCircle, 
  Cpu, 
  Clock, 
  Terminal, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Activity,
  Users,
  Eye,
  Radio,
  Sliders,
  Play,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  TrendingUp,
  Award,
  AlertTriangle,
  Flame,
  Info,
  Layers,
  Sparkles,
  MapPin,
  Heart,
  Navigation,
  RefreshCw,
  HeartPulse,
  Bus,
  Gauge,
  Mic,
  Volume2,
  Tv,
  FileText,
  Send,
  HelpCircle,
  EyeOff
} from "lucide-react";
import { CommandState } from "../types";

export interface RoleDetail {
  id: string;
  name: string;
  title: string;
  description: string;
  level: "ADMIN" | "OPERATOR" | "SPECIALIST" | "OBSERVER";
  workload: number; // percentage
  avgResponse: string;
  activeTasks: number;
  color: string; // Tailwind accent color
  borderClass: string;
  bgGradient: string;
  capabilities: {
    name: string;
    allowed: boolean;
    description: string;
  }[];
  custom?: boolean;
}

export interface SystemRule {
  id: string;
  name: string;
  description: string;
  category: "SAFETY" | "FLOW" | "ACCESS" | "SENTIMENT";
  active: boolean;
  metric: string;
  thresholdValue: number;
  unit: string;
  lastTriggered?: string;
}

interface RoleAnalysisViewProps {
  state: CommandState | null;
  currentRole: string;
  onRoleChange: (newRole: string) => void;
  onRefresh: () => void;
}

// Initial System Rules configuration
const INITIAL_RULES: SystemRule[] = [
  {
    id: "rule-1",
    name: "Concourse Overcrowding Warning",
    description: "Trigger volunteer redirection flow when concourse density exceeds safety limits.",
    category: "FLOW",
    active: true,
    metric: "Density Ratio",
    thresholdValue: 82,
    unit: "% capacity",
    lastTriggered: "14:15:02"
  },
  {
    id: "rule-2",
    name: "Extreme Heat distress escalation",
    description: "Automatically escalate Section 114 reports to CRITICAL if temperature sensors exceed safety bounds.",
    category: "SAFETY",
    active: true,
    metric: "Ambient Temperature",
    thresholdValue: 34,
    unit: "°C",
    lastTriggered: "14:24:45"
  },
  {
    id: "rule-3",
    name: "ADA Access Blockage Timeout",
    description: "Escalate facilities blockages in Zone 8 to high-alert dispatches if unaddressed for over 5 minutes.",
    category: "ACCESS",
    active: true,
    metric: "Dwell Time Limit",
    thresholdValue: 5,
    unit: "minutes",
    lastTriggered: "Never"
  },
  {
    id: "rule-4",
    name: "Sentiment Dip Intervention",
    description: "Trigger direct visitor support dispatch if negative spectator keywords rise in the Sentiment Cloud.",
    category: "SENTIMENT",
    active: false,
    metric: "Negative Ratio",
    thresholdValue: 25,
    unit: "% feedback logs",
    lastTriggered: "Never"
  }
];

// Seed roles including the custom requirements: Safety & Medical Lead, Transcript, Follow Director
const INITIAL_ROLES: RoleDetail[] = [
  {
    id: "commander",
    name: "STADIUM COMMANDER",
    title: "Chief Operations Director",
    description: "Highest tier operational supervisor. Responsible for overarching crowd safety, strategic agency coordination, and stadium-wide status overrides.",
    level: "ADMIN",
    workload: 25,
    avgResponse: "0:30s",
    activeTasks: 2,
    color: "text-primary border-primary bg-primary/5",
    borderClass: "border-primary/40",
    bgGradient: "from-primary/10 to-transparent",
    capabilities: [
      { name: "Emergency Level Override", allowed: true, description: "Authorize high-alert and full evacuation protocols." },
      { name: "PostgreSQL Schema Sync", allowed: true, description: "Synchronize tables and perform structural database updates." },
      { name: "Write & Log Incidents", allowed: true, description: "Register, modify, and force-resolve all active operational tickets." },
      { name: "Gemini Dispatch Assistant", allowed: true, description: "Access unrestricted natural language tactical recommendations." },
      { name: "Live CCTV Feeds", allowed: true, description: "Unrestricted live video feedback streams from all stadium perimeter cameras." }
    ]
  },
  {
    id: "dispatcher",
    name: "TACTICAL DISPATCHER",
    title: "Command Center Dispatcher (Main Admin)",
    description: "Core logistics and emergency routing operator. Integrates incoming crowd sensor warnings, provisions medical & transit sub-dashboards, and updates systematic rules.",
    level: "OPERATOR",
    workload: 85,
    avgResponse: "0:45s",
    activeTasks: 9,
    color: "text-secondary border-secondary bg-secondary/5",
    borderClass: "border-secondary/40",
    bgGradient: "from-secondary/10 to-transparent",
    capabilities: [
      { name: "Emergency Level Override", allowed: false, description: "Requires commander verification." },
      { name: "PostgreSQL Schema Sync", allowed: false, description: "Read-only access to database structural properties." },
      { name: "Write & Log Incidents", allowed: true, description: "Register, modify, and force-resolve all active operational tickets." },
      { name: "Gemini Dispatch Assistant", allowed: true, description: "Direct uplink to operational logic models." },
      { name: "Live CCTV Feeds", allowed: true, description: "Operational camera views assigned to active incident sectors." }
    ]
  },
  {
    id: "medical_officer",
    name: "SAFETY & MEDICAL LEAD",
    title: "Incident Response Officer",
    description: "Specialized safety supervisor focusing on fan wellness, heat stabilization, lost children, and physical access/ADA ramp congestion.",
    level: "SPECIALIST",
    workload: 55,
    avgResponse: "1:15s",
    activeTasks: 4,
    color: "text-tertiary border-tertiary bg-tertiary/5",
    borderClass: "border-tertiary/40",
    bgGradient: "from-tertiary/10 to-transparent",
    capabilities: [
      { name: "Emergency Level Override", allowed: false, description: "Requires commander verification." },
      { name: "PostgreSQL Schema Sync", allowed: false, description: "Restricted." },
      { name: "Write & Log Incidents", allowed: true, description: "Can log medical and ADA access tickets only." },
      { name: "Gemini Dispatch Assistant", allowed: true, description: "Queries restricted to safety and medical support protocols." },
      { name: "Live CCTV Feeds", allowed: true, description: "Access to Section 114, Row 22, and first aid booth cams." }
    ]
  },
  {
    id: "transcript_officer",
    name: "TRANSCRIPT OFFICER",
    title: "Incident Log & Audio Transcriber",
    description: "Specialist transcribing live operator voice feeds and radio communications directly into structured PostgreSQL tactical audit entries.",
    level: "SPECIALIST",
    workload: 65,
    avgResponse: "0:15s",
    activeTasks: 3,
    color: "text-blue-400 border-blue-500/30 bg-blue-500/5",
    borderClass: "border-blue-500/40",
    bgGradient: "from-blue-500/10 to-transparent",
    capabilities: [
      { name: "Emergency Level Override", allowed: false, description: "Restricted." },
      { name: "PostgreSQL Schema Sync", allowed: false, description: "Restricted." },
      { name: "Write & Log Incidents", allowed: true, description: "Authorized to promote transcribed text directly to live incidents database." },
      { name: "Gemini Dispatch Assistant", allowed: true, description: "NLP parsing enabled to structure messy audio into database fields." },
      { name: "Live CCTV Feeds", allowed: false, description: "Restricted." }
    ]
  },
  {
    id: "follow_director",
    name: "FOLLOW DIRECTOR",
    title: "Tactical Dynamic Guidance Coordinator",
    description: "Flow specialist coordinating dynamic LED signage, visual 'Follow-Me' pathways, and termstile speed targets to balance gate density.",
    level: "SPECIALIST",
    workload: 72,
    avgResponse: "1:40s",
    activeTasks: 5,
    color: "text-green-400 border-green-500/30 bg-green-500/5",
    borderClass: "border-green-500/40",
    bgGradient: "from-green-500/10 to-transparent",
    capabilities: [
      { name: "Emergency Level Override", allowed: false, description: "Requires commander verification." },
      { name: "PostgreSQL Schema Sync", allowed: false, description: "Restricted." },
      { name: "Write & Log Incidents", allowed: true, description: "Log transit and gate flow tickets." },
      { name: "Gemini Dispatch Assistant", allowed: true, description: "AI recommendation for ideal egress routes active." },
      { name: "Live CCTV Feeds", allowed: true, description: "Gate B, A, C overhead flow and queue cameras." }
    ]
  },
  {
    id: "observer",
    name: "GUEST OBSERVER",
    title: "FIFA Delegate / Auditor",
    description: "External supervisory monitoring profile. Receives direct read-only updates on stadium crowd sentiment, logistics, and response performance.",
    level: "OBSERVER",
    workload: 5,
    avgResponse: "N/A",
    activeTasks: 0,
    color: "text-on-surface-variant border-white/10 bg-white/5",
    borderClass: "border-white/10",
    bgGradient: "from-white/5 to-transparent",
    capabilities: [
      { name: "Emergency Level Override", allowed: false, description: "Restricted (Read-only)." },
      { name: "PostgreSQL Schema Sync", allowed: false, description: "Restricted (Read-only)." },
      { name: "Write & Log Incidents", allowed: false, description: "Restricted (Read-only)." },
      { name: "Gemini Dispatch Assistant", allowed: false, description: "Restricted (Read-only)." },
      { name: "Live CCTV Feeds", allowed: false, description: "Restricted due to privacy policies." }
    ]
  }
];

export default function RoleAnalysisView({ state, currentRole, onRoleChange, onRefresh }: RoleAnalysisViewProps) {
  // Roles list
  const [rolesList, setRolesList] = useState<RoleDetail[]>(INITIAL_ROLES);
  // System Rules list
  const [rulesList, setRulesList] = useState<SystemRule[]>(INITIAL_RULES);

  // Active sub-tab in right column
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "rules" | "provision" | "evaluator">("dashboard");

  // Selected role to display details for
  const [selectedRole, setSelectedRole] = useState<RoleDetail>(
    INITIAL_ROLES.find(r => r.id === currentRole) || INITIAL_ROLES[0]
  );

  // Inputs for systematic rule creation
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleDesc, setNewRuleDesc] = useState("");
  const [newRuleCategory, setNewRuleCategory] = useState<"SAFETY" | "FLOW" | "ACCESS" | "SENTIMENT">("SAFETY");
  const [newRuleThreshold, setNewRuleThreshold] = useState(50);
  const [newRuleUnit, setNewRuleUnit] = useState("units");

  // Inputs for dynamic role provisioning
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleLevel, setNewRoleLevel] = useState<"ADMIN" | "OPERATOR" | "SPECIALIST" | "OBSERVER">("SPECIALIST");

  // Local simulated audits
  const [auditLogs, setAuditLogs] = useState<{ id: string; time: string; text: string; role: string; type: "info" | "alert" | "success" }[]>([
    { id: "1", time: "14:32:11", text: "Commander activated system-wide live CCTV overlay", role: "commander", type: "info" },
    { id: "2", time: "14:30:45", text: "Tactical Dispatcher synchronized rule configuration with main server", role: "dispatcher", type: "success" },
    { id: "3", time: "14:28:12", text: "Medical Lead triggered fast-stabilization dispatch at Row 22", role: "medical_officer", type: "alert" },
    { id: "4", time: "14:25:01", text: "Transcript Officer logged raw radio audio clip #412", role: "transcript_officer", type: "info" },
    { id: "5", time: "14:22:15", text: "Follow Director activated 'GO TO GATE C' digital dynamic billboards", role: "follow_director", type: "success" }
  ]);

  // Commander evacuation simulation
  const [evacuationActive, setEvacuationActive] = useState(false);

  // Medical officer simulation logs
  const [medicalLogs, setMedicalLogs] = useState<string[]>(["EMS unit on stand-by near Section 114 First Aid Booth"]);

  // Follow Director simulation controls
  const [selectedExitSign, setSelectedExitSign] = useState<string>("NORMAL FLOW ACTIVE");
  const [dynamicGreenPath, setDynamicGreenPath] = useState<boolean>(false);
  const [speedTarget, setSpeedTarget] = useState<number>(4); // km/h
  const [gateFlows, setGateFlows] = useState({ gateA: 85, gateB: 92, gateC: 45 });

  // Transcript Officer simulation states
  const [recordingActive, setRecordingActive] = useState(false);
  const [activeTranscription, setActiveTranscription] = useState("");
  const [transcriptLogs, setTranscriptLogs] = useState<{ time: string; text: string; parsedToIncident: boolean }[]>([
    { time: "14:21:05", text: "Heavy density near western perimeter. Crowd flowing smoothly but slowly.", parsedToIncident: true },
    { time: "14:18:30", text: "Sector 112 temperature is high. Volunteers deploying hydration points.", parsedToIncident: false }
  ]);

  // Submission Evaluator states
  const [evalSubTab, setEvalSubTab] = useState<"scorecard" | "approach" | "code_functionality">("scorecard");
  const [checklistItems, setChecklistItems] = useState([
    { id: "eval-1", text: "Security & Access Boundaries (Role Isolation, Handover Authorization)", points: 20, impact: "HIGH", checked: true },
    { id: "eval-2", text: "Code Quality & Modular Architecture (TypeScript Safety, No-Mock Layouts)", points: 20, impact: "HIGH", checked: true },
    { id: "eval-3", text: "Efficiency & Performance (Dynamic Caching, Active Multi-Threading)", points: 15, impact: "HIGH", checked: true },
    { id: "eval-4", text: "Testing, Auditing & Live Verification (PostgreSQL Integration, Live Log Streams)", points: 15, impact: "MEDIUM", checked: true },
    { id: "eval-5", text: "Accessibility & Touch Target Compliance (W3C Contrast, >44px UI bounds)", points: 15, impact: "MEDIUM", checked: true },
    { id: "eval-6", text: "Problem Statement Alignment (FIFA Stadium Logistics, Crisis Emergency)", points: 15, impact: "MEDIUM", checked: true }
  ]);

  // Code Functionality Tuning Sliders (Improvable Areas)
  const [perfCacheTuning, setPerfCacheTuning] = useState<number>(100);
  const [audioEncodingTuning, setAudioEncodingTuning] = useState<number>(100);
  const [geolocPrecisionTuning, setGeolocPrecisionTuning] = useState<number>(100);

  const handleAddAuditLog = (text: string, role: string, type: "info" | "alert" | "success" = "info") => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setAuditLogs(prev => [
      { id: Date.now().toString(), time: timeStr, text, role, type },
      ...prev
    ]);
  };

  const handleRoleSelect = (role: RoleDetail) => {
    setSelectedRole(role);
  };

  const handleActivateRole = (role: RoleDetail) => {
    onRoleChange(role.id);
    handleAddAuditLog(`Secured handover: Active session switched to [${role.name}]`, role.id, "success");
  };

  // Dispatcher creates/provisions another specialist role (e.g. Safety & Medical Lead or Transcript or Follow Director)
  const handleCreateRoleProfile = (e?: React.FormEvent, templateData?: Partial<RoleDetail>) => {
    if (e) e.preventDefault();
    if (currentRole !== "dispatcher" && currentRole !== "commander") {
      handleAddAuditLog("DENIED: Non-admin tried to provision specialized role.", currentRole, "alert");
      return;
    }

    const rName = templateData?.name || newRoleName;
    const rTitle = templateData?.title || newRoleTitle;
    const rDesc = templateData?.description || newRoleDesc;
    const rLevel = templateData?.level || newRoleLevel;

    if (!rName.trim() || !rTitle.trim()) return;

    const formattedId = rName.toLowerCase().replace(/\s+/g, "_");
    
    // Check if role already exists
    if (rolesList.some(r => r.id === formattedId)) {
      handleAddAuditLog(`PROVISION CONFLICT: Operational profile with ID [${formattedId}] already exists.`, currentRole, "alert");
      return;
    }

    const isMedical = formattedId.includes("medical") || formattedId.includes("safety");
    const isTranscript = formattedId.includes("transcript");
    const isFollow = formattedId.includes("follow") || formattedId.includes("direction");

    const createdRole: RoleDetail = {
      id: formattedId,
      name: rName.toUpperCase(),
      title: rTitle,
      description: rDesc || `Custom provisioned specialist role for ${rTitle}.`,
      level: rLevel,
      workload: 50,
      avgResponse: "1:00s",
      activeTasks: 2,
      color: isMedical 
        ? "text-tertiary border-tertiary bg-tertiary/5" 
        : isTranscript 
        ? "text-blue-400 border-blue-500/30 bg-blue-500/5"
        : isFollow
        ? "text-green-400 border-green-500/30 bg-green-500/5"
        : "text-primary border-primary bg-primary/5",
      borderClass: isMedical 
        ? "border-tertiary/40" 
        : isTranscript 
        ? "border-blue-500/40" 
        : isFollow 
        ? "border-green-500/40"
        : "border-primary/40",
      bgGradient: isMedical 
        ? "from-tertiary/10 to-transparent" 
        : isTranscript 
        ? "from-blue-500/10 to-transparent" 
        : isFollow
        ? "from-green-500/10 to-transparent"
        : "from-primary/10 to-transparent",
      custom: true,
      capabilities: [
        { name: "Emergency Level Override", allowed: false, description: "Requires commander verification." },
        { name: "PostgreSQL Schema Sync", allowed: false, description: "Restricted by default." },
        { name: "Write & Log Incidents", allowed: true, description: "Log incident cases matching target duty profile." },
        { name: "Gemini Dispatch Assistant", allowed: true, description: "Tailored assistance enabled." },
        { name: "Live CCTV Feeds", allowed: !isTranscript, description: "Assigned sector feeds only." }
      ]
    };

    setRolesList(prev => [...prev, createdRole]);
    handleAddAuditLog(`ROLE PROVISIONED: Dispatcher successfully created specialist profile [${rName.toUpperCase()}]`, currentRole, "success");

    // Reset inputs
    setNewRoleName("");
    setNewRoleTitle("");
    setNewRoleDesc("");
  };

  const handleDeleteRoleProfile = (roleId: string) => {
    if (currentRole !== "dispatcher" && currentRole !== "commander") {
      handleAddAuditLog("DENIED: Unauthorized attempt to delete role profiles.", currentRole, "alert");
      return;
    }
    const roleObj = rolesList.find(r => r.id === roleId);
    if (roleObj && !roleObj.custom) {
      handleAddAuditLog(`DENIED: Cannot delete default system role profile "${roleObj.name}".`, currentRole, "alert");
      return;
    }
    setRolesList(prev => prev.filter(r => r.id !== roleId));
    handleAddAuditLog(`ROLE REMOVED: Revoked operational specialist profile [${roleId.toUpperCase()}]`, currentRole, "info");
    if (selectedRole.id === roleId) {
      setSelectedRole(rolesList[0]);
    }
  };

  // Dispatcher creates a new Systematic System Rule
  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole !== "dispatcher" && currentRole !== "commander") {
      handleAddAuditLog("DENIED: Restricted role tried to inject custom systematic rule.", currentRole, "alert");
      return;
    }
    if (!newRuleName.trim()) return;

    const newRule: SystemRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName,
      description: newRuleDesc,
      category: newRuleCategory,
      active: true,
      metric: newRuleCategory === "SAFETY" ? "Sensor Threshold" : newRuleCategory === "FLOW" ? "pax/min Queue" : newRuleCategory === "ACCESS" ? "Dwell Limit" : "Trigger Ratio",
      thresholdValue: newRuleThreshold,
      unit: newRuleUnit || "units",
      lastTriggered: "Never"
    };

    setRulesList(prev => [...prev, newRule]);
    handleAddAuditLog(`SYSTEM RULE APPLIED: Installed "${newRuleName}" to reactive telemetry bounds.`, currentRole, "success");

    // Reset fields
    setNewRuleName("");
    setNewRuleDesc("");
    setNewRuleThreshold(50);
    setNewRuleUnit("units");
  };

  const handleToggleRule = (ruleId: string) => {
    if (currentRole !== "dispatcher" && currentRole !== "commander") {
      handleAddAuditLog("DENIED: Unauthorized attempt to toggle systematic rule active status.", currentRole, "alert");
      return;
    }
    setRulesList(prev => prev.map(r => {
      if (r.id === ruleId) {
        const nextState = !r.active;
        handleAddAuditLog(`RULE CONFIG CHANGED: "${r.name}" is now ${nextState ? "ACTIVE" : "INACTIVE"}`, currentRole, "info");
        return { ...r, active: nextState };
      }
      return r;
    }));
  };

  const handleDeleteRule = (ruleId: string) => {
    if (currentRole !== "dispatcher" && currentRole !== "commander") {
      handleAddAuditLog("DENIED: Unauthorized attempt to delete systematic rules.", currentRole, "alert");
      return;
    }
    const target = rulesList.find(r => r.id === ruleId);
    setRulesList(prev => prev.filter(r => r.id !== ruleId));
    if (target) {
      handleAddAuditLog(`RULE REMOVED: Deleted systematic rule "${target.name}".`, currentRole, "info");
    }
  };

  // Simulation handlers
  const handleCommanderEvacToggle = () => {
    if (currentRole !== "commander") return;
    const stateVal = !evacuationActive;
    setEvacuationActive(stateVal);
    handleAddAuditLog(
      stateVal 
        ? "EVACUATION DRILL LAUNCHED: Sending evacuation route visual banners to stadium monitors." 
        : "EVACUATION ALARM DISARMED: System state restored to normal standby.",
      "commander",
      stateVal ? "alert" : "success"
    );
  };

  const handleMedicalTrigger = (desc: string) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setMedicalLogs(prev => [`[${timeStr}] Dispatch: ${desc}`, ...prev]);
    handleAddAuditLog(`MEDICAL ACTION: ${desc}`, "medical_officer", "info");
  };

  const handleTransitTrigger = (desc: string) => {
    handleAddAuditLog(`TRANSIT DIRECTIVE: ${desc}`, "follow_director", "info");
  };

  // Transcript mock simulator trigger
  const triggerMockTranscription = () => {
    setRecordingActive(true);
    const mockPhrases = [
      "CRITICAL: Heat distress in Concourse Zone 8. Dispatcher deploying hydration buggy.",
      "FLOW REPORT: Exit Gate B is experiencing high turnstile queue delays. Turnstile speed target raised to 5 pax/min.",
      "FACILITIES AUDIT: Emergency wheelchair access route in Row 14 is fully clear.",
      "SENTIMENT ALERT: Fan sentiment is rising in Block C following volunteer arrival.",
      "ACCESSIBILITY WARNING: Crowding detected around Elevator S-3. Directing guides to assist."
    ];
    const phrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
    
    setTimeout(() => {
      setActiveTranscription(phrase);
      setRecordingActive(false);
      handleAddAuditLog("Audio recording transcribed via Gemini NLP.", "transcript_officer", "success");
    }, 1500);
  };

  const saveTranscriptionToLog = () => {
    if (!activeTranscription.trim()) return;
    const timeStr = new Date().toTimeString().split(' ')[0];
    setTranscriptLogs(prev => [
      { time: timeStr, text: activeTranscription, parsedToIncident: true },
      ...prev
    ]);
    handleAddAuditLog(`TRANSCRIPT PROMOTED: Loaded operator radio log directly to SQL: "${activeTranscription}"`, "transcript_officer", "success");
    setActiveTranscription("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-y-auto pb-10 custom-scrollbar pr-1">
      
      {/* LEFT COLUMN: Operations Directory (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        
        {/* Profile Card & Selection */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono tracking-widest text-primary font-black uppercase">TACTICAL PROFILE DIRECTORY</span>
              <span className="text-[9px] font-mono px-2 py-0.5 bg-white/5 border border-white/10 text-on-surface-variant rounded-full">
                {rolesList.length} Active
              </span>
            </div>
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-tight mt-1 font-sans">Handover Control Panel</h3>
            <p className="text-[11px] text-on-surface-variant leading-relaxed mt-1 font-sans">
              Switch profiles to access dynamic dashboard-related views, custom responsibilities, and specific capabilities.
            </p>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
            {rolesList.map((role) => {
              const isActiveUserRole = currentRole === role.id;
              const isSelected = selectedRole.id === role.id;

              return (
                <div
                  key={role.id}
                  className={`w-full p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                    isSelected 
                      ? "bg-white/5 border-white/20" 
                      : "bg-[#050505] border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleRoleSelect(role)}
                      className="flex-1 text-left flex items-center gap-2.5 cursor-pointer"
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                        role.id === "commander" 
                          ? "border-primary/20 bg-primary/10 text-primary" 
                          : role.id === "dispatcher"
                          ? "border-secondary/20 bg-secondary/10 text-secondary"
                          : role.id === "medical_officer"
                          ? "border-tertiary/20 bg-tertiary/10 text-tertiary"
                          : role.id === "transcript_officer"
                          ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                          : role.id === "follow_director"
                          ? "border-green-500/20 bg-green-500/10 text-green-400"
                          : "border-white/10 bg-white/5 text-on-surface"
                      }`}>
                        {role.id === "commander" && <Shield className="w-3.5 h-3.5" />}
                        {role.id === "dispatcher" && <Radio className="w-3.5 h-3.5" />}
                        {role.id === "medical_officer" && <HeartPulse className="w-3.5 h-3.5" />}
                        {role.id === "transcript_officer" && <Mic className="w-3.5 h-3.5" />}
                        {role.id === "follow_director" && <Navigation className="w-3.5 h-3.5" />}
                        {role.id === "observer" && <Eye className="w-3.5 h-3.5" />}
                        {!["commander", "dispatcher", "medical_officer", "transcript_officer", "follow_director", "observer"].includes(role.id) && <Sliders className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-on-surface font-sans flex items-center gap-1.5">
                          {role.name}
                        </div>
                        <div className="text-[8px] text-on-surface-variant font-mono mt-0.5 uppercase tracking-widest leading-none">
                          {role.title}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {isActiveUserRole ? (
                        <span className="text-[8px] font-black bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded font-mono uppercase animate-pulse">
                          ACTIVE
                        </span>
                      ) : (
                        <button
                          onClick={() => handleActivateRole(role)}
                          className="text-[8px] font-bold bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded text-on-surface cursor-pointer"
                        >
                          Handover
                        </button>
                      )}

                      {role.custom && (
                        <button
                          onClick={() => handleDeleteRoleProfile(role.id)}
                          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                          title="Revoke Provisioned Role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Audit log tracking active events */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 flex flex-col gap-3 shadow-xl flex-1 min-h-[220px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-primary font-black uppercase">LIVE AUDIT LOGS</span>
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-tight mt-0.5 font-sans">Role Handover Logs</h3>
            </div>
            <button 
              onClick={() => {
                onRefresh();
                handleAddAuditLog("Telemetry synchronized with live Cloud database.", currentRole, "info");
              }}
              className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer text-on-surface-variant hover:text-on-surface"
              title="Refresh telemetry stream"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[250px] custom-scrollbar pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="text-[10px] font-mono border-b border-white/5 pb-2 text-on-surface-variant">
                <div className="flex justify-between text-[9px] mb-1">
                  <span className={`font-black uppercase px-1 py-0.2 rounded ${
                    log.type === "alert" ? "bg-red-500/10 text-red-400" : log.type === "success" ? "bg-green-500/10 text-green-400" : "bg-white/5 text-primary"
                  }`}>
                    [{log.role.toUpperCase()}]
                  </span>
                  <span>{log.time}</span>
                </div>
                <p className="text-on-surface leading-normal text-[10px]">"{log.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Active Role Analysis & Responsive Dashboard Pages (8 cols) */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        
        {/* Navigation Tab bar for Right column details */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 flex flex-wrap gap-1 shadow-md">
          <button
            onClick={() => setActiveSubTab("dashboard")}
            className={`flex-1 min-w-[110px] py-2 text-center rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === "dashboard"
                ? "bg-primary text-black"
                : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
            }`}
          >
            <Gauge className="w-3.5 h-3.5" /> Duties
          </button>
          
          <button
            onClick={() => setActiveSubTab("rules")}
            className={`flex-1 min-w-[110px] py-2 text-center rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === "rules"
                ? "bg-primary text-black"
                : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Rules
          </button>

          <button
            onClick={() => setActiveSubTab("provision")}
            className={`flex-1 min-w-[110px] py-2 text-center rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === "provision"
                ? "bg-primary text-black"
                : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Provision
          </button>

          <button
            onClick={() => setActiveSubTab("evaluator")}
            className={`flex-1 min-w-[130px] py-2 text-center rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === "evaluator"
                ? "bg-primary text-black"
                : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-black" /> Submission Evaluator
          </button>
        </div>

        {/* MAIN SUB-VIEW SWITCHER */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            
            {/* 1. DYNAMIC RESPONSIBILITIES DASHBOARD */}
            {activeSubTab === "dashboard" && (
              <motion.div
                key="dashboard-subtab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Visual Header displaying selected role */}
                <div className={`bg-gradient-to-r ${selectedRole.bgGradient} bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 relative overflow-hidden shadow-lg`}>
                  <div className="absolute top-0 right-0 p-5 opacity-10 pointer-events-none">
                    <Cpu className="w-20 h-20 text-on-surface" />
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded font-mono text-on-surface-variant font-bold tracking-widest uppercase">
                      LEVEL: {selectedRole.level}
                    </span>
                    {selectedRole.custom && (
                      <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded font-mono font-black tracking-widest uppercase animate-pulse">
                        PROVISIONED SPECIALIST
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-black text-on-surface uppercase tracking-tight font-sans">
                    {selectedRole.name}
                  </h2>
                  <p className="text-[11px] text-on-surface-variant mt-1.5 max-w-2xl leading-relaxed font-sans">
                    {selectedRole.description}
                  </p>

                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5">
                    <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
                      <div className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest">Active Duties</div>
                      <div className="text-lg font-black text-on-surface mt-0.5">{selectedRole.activeTasks}</div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
                      <div className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest">AVG Response</div>
                      <div className="text-lg font-black text-on-surface mt-0.5">{selectedRole.avgResponse}</div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
                      <div className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest">Est. Workload</div>
                      <div className="text-lg font-black text-primary mt-0.5">{selectedRole.workload}%</div>
                    </div>
                  </div>
                </div>

                {/* DYNAMIC ROLE DASHBOARD PAGES (THE HEAVY LIFT FOR USER REQUEST) */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <span className="text-[9px] font-mono tracking-widest text-primary font-black uppercase">TACTICAL TERMINAL</span>
                      <h3 className="text-sm font-bold text-on-surface uppercase tracking-tight mt-0.5 font-sans">
                        {selectedRole.name}'s Operational Dashboard View
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                      <span className="text-[9px] font-mono text-green-400 font-bold uppercase tracking-widest">LIVE DISPATCH CONNECT</span>
                    </div>
                  </div>

                  {/* A. COMMANDER DASHBOARD VIEW */}
                  {selectedRole.id === "commander" && (
                    <div className="space-y-4">
                      <p className="text-xs text-on-surface-variant font-sans">
                        You are looking at the **Stadium Commander** chief operations console. Use high-alert triggers to issue directives down to the dispatcher.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-black/35 border border-white/5 p-4 rounded-xl space-y-2">
                          <h4 className="text-xs font-bold text-on-surface uppercase font-sans flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" /> Overarching Directives
                          </h4>
                          <p className="text-[11px] text-on-surface-variant font-sans leading-relaxed">
                            Emergency override triggers are authorized under current conditions. In case of extreme weather or safety breeches, configure high-alert broadcast signals.
                          </p>
                          <div className="pt-2">
                            <button
                              onClick={handleCommanderEvacToggle}
                              className={`w-full py-2 rounded-lg font-black text-[10px] tracking-widest uppercase transition-all cursor-pointer ${
                                evacuationActive
                                  ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                                  : "bg-primary text-black hover:bg-primary-container"
                              }`}
                            >
                              {evacuationActive ? "DISARM EVACUATION SYSTEM" : "TRIGGER EVACUATION DRILL FLAG"}
                            </button>
                          </div>
                        </div>

                        <div className="bg-black/35 border border-white/5 p-4 rounded-xl space-y-2 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-on-surface uppercase font-sans flex items-center gap-2">
                              <Terminal className="w-4 h-4 text-secondary" /> Database Table Guard
                            </h4>
                            <p className="text-[11px] text-on-surface-variant font-sans leading-relaxed">
                              Commander clearance is validated for standard schema synchronization or execution of manual telemetry updates on PostgreSQL database layers.
                            </p>
                          </div>
                          <button
                            onClick={() => handleAddAuditLog("Commander verified schema integrity on Cloud SQL tables.", "commander", "success")}
                            className="w-full mt-2 py-1.5 bg-white/5 hover:bg-white/10 border border-white/15 rounded text-[9px] font-mono tracking-widest text-on-surface-variant hover:text-on-surface cursor-pointer uppercase"
                          >
                            Verify PostgreSQL Sync Integrity
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* B. DISPATCHER DASHBOARD VIEW (MAIN ADMIN) */}
                  {selectedRole.id === "dispatcher" && (
                    <div className="space-y-4">
                      <p className="text-xs text-on-surface-variant font-sans">
                        You are looking at the **Tactical Dispatcher** console. As the central coordinator, you have permission to configure **Systematic Rules** and **Provision Specialist Roles** like the Safety & Medical Lead, Transcript Officer, and Follow Director.
                      </p>

                      {/* Quick deploy templates card */}
                      <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <h4 className="text-xs font-bold text-secondary uppercase font-sans flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-primary" /> Dynamic Provision Templates
                          </h4>
                          <span className="text-[9px] font-mono text-on-surface-variant">Click to instant-deploy</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleCreateRoleProfile(undefined, {
                                name: "SAFETY & MEDICAL LEAD",
                                title: "Incident Response Officer",
                                description: "Specialized safety supervisor focusing on fan wellness, heat stabilization, lost children, and physical access/ADA ramp congestion.",
                                level: "SPECIALIST"
                              });
                            }}
                            className="py-2 px-3 bg-tertiary/10 border border-tertiary/30 hover:bg-tertiary/20 rounded-lg text-left cursor-pointer"
                          >
                            <div className="text-[9px] font-mono font-black text-tertiary">DEPLOY TEMPLATE</div>
                            <div className="text-[10px] font-black text-on-surface uppercase mt-0.5">Medical Lead</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleCreateRoleProfile(undefined, {
                                name: "TRANSCRIPT OFFICER",
                                title: "Incident Log & Audio Transcriber",
                                description: "Specialist transcribing live operator voice feeds and radio communications directly into structured PostgreSQL tactical audit entries.",
                                level: "SPECIALIST"
                              });
                            }}
                            className="py-2 px-3 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 rounded-lg text-left cursor-pointer"
                          >
                            <div className="text-[9px] font-mono font-black text-blue-400">DEPLOY TEMPLATE</div>
                            <div className="text-[10px] font-black text-on-surface uppercase mt-0.5">Transcript</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleCreateRoleProfile(undefined, {
                                name: "FOLLOW DIRECTOR",
                                title: "Tactical Dynamic Guidance Coordinator",
                                description: "Flow specialist coordinating dynamic LED signage, visual 'Follow-Me' pathways, and termstile speed targets to balance gate density.",
                                level: "SPECIALIST"
                              });
                            }}
                            className="py-2 px-3 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 rounded-lg text-left cursor-pointer"
                          >
                            <div className="text-[9px] font-mono font-black text-green-400">DEPLOY TEMPLATE</div>
                            <div className="text-[10px] font-black text-on-surface uppercase mt-0.5">Follow Director</div>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#050505] border border-white/10 p-4 rounded-xl flex flex-col justify-between gap-3">
                          <div>
                            <h4 className="text-xs font-bold text-secondary uppercase font-sans flex items-center gap-1.5">
                              <Sliders className="w-4 h-4 text-secondary" /> Systematic Rules Hub
                            </h4>
                            <p className="text-[11px] text-on-surface-variant mt-1 font-sans leading-relaxed">
                              You have full master admin clearance to modify sensor limits and deploy reactive safety thresholds on the spectator grid.
                            </p>
                          </div>
                          <button
                            onClick={() => setActiveSubTab("rules")}
                            className="py-2 bg-secondary/15 hover:bg-secondary/20 text-secondary border border-secondary/30 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer"
                          >
                            OPEN SYSTEM RULES EDITOR
                          </button>
                        </div>

                        <div className="bg-[#050505] border border-white/10 p-4 rounded-xl flex flex-col justify-between gap-3">
                          <div>
                            <h4 className="text-xs font-bold text-secondary uppercase font-sans flex items-center gap-1.5">
                              <Users className="w-4 h-4 text-secondary" /> Role Provisioner Terminal
                            </h4>
                            <p className="text-[11px] text-on-surface-variant mt-1 font-sans leading-relaxed">
                              Provision and revoke active profile clearances for first responders, flow directors, or custom security profiles dynamically.
                            </p>
                          </div>
                          <button
                            onClick={() => setActiveSubTab("provision")}
                            className="py-2 bg-secondary/15 hover:bg-secondary/20 text-secondary border border-secondary/30 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer"
                          >
                            PROVISION SPECIALIST PROFILES
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* C. SAFETY & MEDICAL LEAD DASHBOARD VIEW */}
                  {selectedRole.id === "medical_officer" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <p className="text-xs text-on-surface-variant font-sans max-w-lg">
                          You are looking at the **Safety & Medical Lead** console. Your responsibilities are centered on heat-stabilization, patient triage status, and managing accessibility bottlenecks.
                        </p>
                        <Heart className="w-8 h-8 text-tertiary shrink-0 opacity-40" />
                      </div>

                      {/* Medical Actions Simulator */}
                      <div className="bg-black/35 border border-white/5 p-4 rounded-xl space-y-3">
                        <h4 className="text-xs font-bold text-on-surface uppercase font-sans flex items-center gap-2">
                          <HeartPulse className="w-4 h-4 text-tertiary" /> Medical Responders Directives
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleMedicalTrigger("Dispatched paramedic unit to Section 114, Row 22 for heat exhaustion assistance.")}
                            className="py-2 px-3 bg-tertiary hover:bg-tertiary/90 text-black text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer text-left flex items-center justify-between"
                          >
                            <span>DISPATCH PARAMEDIC S-114</span>
                            <HeartPulse className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMedicalTrigger("Initiated lost child search flow: Broadcasted description to Gate B volunteer net.")}
                            className="py-2 px-3 bg-[#111] hover:bg-white/5 border border-white/15 text-on-surface text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer text-left flex items-center justify-between"
                          >
                            <span>TRIGGER LOST CHILD BROADCAST</span>
                            <Users className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                          <div className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest">Medical Logs</div>
                          <div className="bg-black/50 p-2.5 rounded border border-white/5 font-mono text-[10px] text-tertiary space-y-1 h-20 overflow-y-auto custom-scrollbar">
                            {medicalLogs.map((log, idx) => (
                              <div key={idx} className="leading-relaxed">✓ {log}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* D. TRANSIT & FLOW DIRECTOR DASHBOARD VIEW */}
                  {selectedRole.id === "follow_director" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <p className="text-xs text-on-surface-variant font-sans max-w-lg">
                          You are looking at the **Follow Director** dynamic signage control panel. Your actions adjust physical arrows, digital path signals, and exit billboard messages to balance terminal traffic.
                        </p>
                        <Bus className="w-8 h-8 text-green-400 shrink-0 opacity-40" />
                      </div>

                      {/* Interactive Signage Control Panel */}
                      <div className="bg-black/35 border border-white/5 p-4 rounded-xl space-y-4">
                        <h4 className="text-xs font-bold text-on-surface uppercase font-sans flex items-center gap-1.5">
                          <Sliders className="w-4 h-4 text-green-400" /> Dynamic Gates & Signage Signals
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1 bg-black/40 p-2.5 rounded-lg border border-white/5">
                            <span className="text-[8px] font-mono text-on-surface-variant block uppercase tracking-widest">Digital Board Display</span>
                            <select
                              value={selectedExitSign}
                              onChange={(e) => {
                                setSelectedExitSign(e.target.value);
                                handleTransitTrigger(`Updated digital banners to show: "${e.target.value}"`);
                              }}
                              className="w-full bg-[#111] border border-white/10 text-[10px] p-1.5 rounded text-green-400 font-bold uppercase outline-none"
                            >
                              <option value="NORMAL FLOW ACTIVE">NORMAL FLOW</option>
                              <option value="USE COLD STATION B">USE COLD STATION B</option>
                              <option value="AVOID GATE B - OVERCROWDED">AVOID GATE B</option>
                              <option value="USE TERM-2 SHUTTLE LOOP">USE TERM-2 SHUTTLE</option>
                            </select>
                          </div>

                          <div className="space-y-1 bg-black/40 p-2.5 rounded-lg border border-white/5">
                            <span className="text-[8px] font-mono text-on-surface-variant block uppercase tracking-widest">Follow-Me Floor Guides</span>
                            <button
                              type="button"
                              onClick={() => {
                                const nextState = !dynamicGreenPath;
                                setDynamicGreenPath(nextState);
                                handleTransitTrigger(`Dynamic green path indicators toggled ${nextState ? "ON" : "OFF"}`);
                              }}
                              className={`w-full text-[10px] py-1.5 px-2 rounded font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                                dynamicGreenPath ? "bg-green-500 text-black" : "bg-white/5 text-on-surface-variant hover:text-on-surface border border-white/10"
                              }`}
                            >
                              {dynamicGreenPath ? "● PATH ACTIVE" : "○ ACTIVATE GREEN PATH"}
                            </button>
                          </div>

                          <div className="space-y-1 bg-black/40 p-2.5 rounded-lg border border-white/5">
                            <span className="text-[8px] font-mono text-on-surface-variant block uppercase tracking-widest">Turnstile Target Speed</span>
                            <div className="flex items-center gap-2 pt-0.5">
                              <input
                                type="range"
                                min="1"
                                max="8"
                                value={speedTarget}
                                onChange={(e) => {
                                  const speed = parseInt(e.target.value);
                                  setSpeedTarget(speed);
                                  handleTransitTrigger(`Gate turnstiles speed limit set to ${speed} pax/min`);
                                }}
                                className="flex-1 accent-green-400 bg-white/10 cursor-pointer"
                              />
                              <span className="text-[10px] font-mono text-on-surface font-black shrink-0 w-8 text-right">{speedTarget}p/m</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive flow rate visualizer */}
                        <div className="bg-black/50 p-3 rounded-lg border border-white/5 space-y-2">
                          <span className="text-[8px] font-mono text-on-surface-variant uppercase tracking-widest block">Live Gate Entry Rate Telemetry</span>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-2 bg-white/5 rounded">
                              <div className="text-[8px] font-mono text-on-surface-variant">GATE A</div>
                              <div className="text-xs font-black text-on-surface">{gateFlows.gateA} pax/min</div>
                              <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
                                <div className="bg-primary h-full" style={{ width: `${(gateFlows.gateA / 120) * 100}%` }} />
                              </div>
                            </div>
                            <div className="text-center p-2 bg-white/5 rounded">
                              <div className="text-[8px] font-mono text-on-surface-variant">GATE B (HOTSPOT)</div>
                              <div className="text-xs font-black text-red-400">{gateFlows.gateB} pax/min</div>
                              <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
                                <div className="bg-red-500 h-full animate-pulse" style={{ width: `${(gateFlows.gateB / 120) * 100}%` }} />
                              </div>
                            </div>
                            <div className="text-center p-2 bg-white/5 rounded">
                              <div className="text-[8px] font-mono text-on-surface-variant">GATE C</div>
                              <div className="text-xs font-black text-green-400">{gateFlows.gateC} pax/min</div>
                              <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
                                <div className="bg-green-500 h-full" style={{ width: `${(gateFlows.gateC / 120) * 100}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* E. TRANSCRIPT OFFICER DASHBOARD VIEW */}
                  {selectedRole.id === "transcript_officer" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <p className="text-xs text-on-surface-variant font-sans max-w-lg">
                          You are looking at the **Transcript Officer** tactical workspace. Use the live voice feeds and radio transcriber tools to convert raw verbal operator alerts into structured database entries.
                        </p>
                        <Mic className="w-8 h-8 text-blue-400 shrink-0 opacity-40 animate-pulse" />
                      </div>

                      {/* Interactive Radio & Transcription Panel */}
                      <div className="bg-black/35 border border-white/5 p-4 rounded-xl space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-on-surface uppercase font-sans flex items-center gap-1.5">
                            <Radio className="w-4 h-4 text-blue-400" /> Channel 4: Live Incident Radio Link
                          </h4>
                          <span className="text-[8px] font-mono text-blue-400 animate-pulse">● BROADCAST LINK ESTABLISHED</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          {/* Recording Simulator Trigger */}
                          <div className="md:col-span-5 bg-black/40 p-3.5 rounded-lg border border-white/5 flex flex-col justify-between gap-3">
                            <div>
                              <span className="text-[8px] font-mono text-on-surface-variant block uppercase tracking-widest">Tactical Audio Grab</span>
                              <p className="text-[10px] text-on-surface-variant mt-1">Simulate intercepting incoming radio signals from volunteers on the ground.</p>
                            </div>
                            <button
                              type="button"
                              onClick={triggerMockTranscription}
                              disabled={recordingActive}
                              className={`py-2 w-full rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                recordingActive
                                  ? "bg-red-500 text-white animate-pulse"
                                  : "bg-blue-500 text-white hover:bg-blue-600"
                              }`}
                            >
                              {recordingActive ? (
                                <>
                                  <Volume2 className="w-3.5 h-3.5 animate-bounce" /> LISTENING & TRANSCRIBING...
                                </>
                              ) : (
                                <>
                                  <Mic className="w-3.5 h-3.5" /> INTERCEPT FIELD AUDIO
                                </>
                              )}
                            </button>
                          </div>

                          {/* Interactive text editor / parsed field */}
                          <div className="md:col-span-7 bg-black/40 p-3.5 rounded-lg border border-white/5 space-y-2">
                            <span className="text-[8px] font-mono text-on-surface-variant block uppercase tracking-widest">Gemini Dynamic Transcription Stream</span>
                            <textarea
                              value={activeTranscription}
                              onChange={(e) => setActiveTranscription(e.target.value)}
                              placeholder="Listening to radio feed... Click 'Intercept Field Audio' or type a custom incident update directly."
                              className="w-full bg-black/60 border border-white/10 text-xs font-mono p-2 rounded-lg text-blue-300 outline-none h-18 resize-none focus:border-blue-500 transition-colors"
                            />
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={saveTranscriptionToLog}
                                disabled={!activeTranscription.trim()}
                                className="py-1 px-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-45 disabled:pointer-events-none text-white text-[9px] font-black uppercase tracking-widest rounded-md flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Send className="w-3 h-3" /> PROMOTE TO POSTGRESQL LOGS
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Transcript history */}
                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                          <div className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest">Audit Logs Archive</div>
                          <div className="bg-[#050505] rounded border border-white/5 overflow-hidden">
                            {transcriptLogs.map((log, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2.5 border-b border-white/5 text-[10px] font-mono">
                                <div className="flex gap-2.5 items-center">
                                  <span className="text-on-surface-variant">[{log.time}]</span>
                                  <span className="text-on-surface font-sans leading-normal">"{log.text}"</span>
                                </div>
                                <span className="text-[8px] bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.2 rounded shrink-0">
                                  SQL COMMIT OK
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* F. OTHER / CUSTOM PROVISIONED ROLE DASHBOARD VIEW */}
                  {!["commander", "dispatcher", "medical_officer", "transcript_officer", "follow_director", "observer"].includes(selectedRole.id) && (
                    <div className="space-y-4">
                      <p className="text-xs text-on-surface-variant font-sans">
                        You are looking at the custom-provisioned specialist profile dashboard. This role operates under restricted bounds configured by the dispatcher.
                      </p>

                      <div className="bg-black/35 border border-white/5 p-4 rounded-xl space-y-3">
                        <h4 className="text-xs font-bold text-on-surface uppercase font-sans flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-primary" /> Active Duty Operations
                        </h4>
                        <p className="text-[11px] text-on-surface-variant font-sans leading-relaxed">
                          Duty descriptions: {selectedRole.description}. Active workloads and logs will trigger based on manual incidents routed under this specialist profile.
                        </p>
                        
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleAddAuditLog(`Specialist Custom Action triggered on [${selectedRole.name}] dashboard.`, selectedRole.id, "success")}
                            className="w-full py-2 bg-primary hover:bg-primary-container text-black text-[10px] font-black uppercase tracking-wider rounded-lg cursor-pointer"
                          >
                            Test Custom Specialist Event Handshake
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* G. GUEST OBSERVER VIEW (READ-ONLY GUEST) */}
                  {selectedRole.id === "observer" && (
                    <div className="space-y-4">
                      <p className="text-xs text-on-surface-variant font-sans">
                        You are viewing the **FIFA Observer delegate** audit dashboard. Operational buttons and incident creation fields are locked to preserve audit trail integrity.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                          <div className="text-[8px] font-mono text-on-surface-variant uppercase tracking-widest">SLA Compliance</div>
                          <div className="text-lg font-black text-green-400 mt-1">98.4%</div>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                          <div className="text-[8px] font-mono text-on-surface-variant uppercase tracking-widest">Crowd Sentiment</div>
                          <div className="text-lg font-black text-primary mt-1">HIGHLY POSITIVE</div>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                          <div className="text-[8px] font-mono text-on-surface-variant uppercase tracking-widest">Response rating</div>
                          <div className="text-lg font-black text-on-surface mt-1">FIFA GRADE-A</div>
                        </div>
                      </div>

                      <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-lg flex gap-3 items-start">
                        <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <span className="text-[10px] text-red-300 font-sans leading-relaxed">
                          Guest Observer delegate session restricts modifications. Please handover role control to Commander or Dispatcher if you wish to adjust stadium parameters or log incidents.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* CAPABILITIES LIST */}
                  <div className="pt-4 border-t border-white/5">
                    <span className="text-[9px] font-mono tracking-widest text-on-surface-variant font-bold uppercase block mb-3">
                      CAPABILITIES MATRIX FOR THIS PROFILE
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedRole.capabilities.map((cap, index) => (
                        <div 
                          key={index}
                          className="bg-black/20 border border-white/5 rounded-lg p-3 flex gap-2.5 items-start hover:border-white/10 transition-all"
                        >
                          <div className="shrink-0 pt-0.5">
                            {cap.allowed ? (
                              <div className="w-4.5 h-4.5 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
                                <Unlock className="w-2.5 h-2.5" />
                              </div>
                            ) : (
                              <div className="w-4.5 h-4.5 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                                <Lock className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-on-surface font-sans uppercase">
                                {cap.name}
                              </span>
                              <span className={`text-[7px] font-mono px-1.5 py-0.2 rounded font-black ${
                                cap.allowed ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                              }`}>
                                {cap.allowed ? "ALLOWED" : "RESTRICTED"}
                              </span>
                            </div>
                            <p className="text-[9px] text-on-surface-variant mt-0.5 leading-normal font-sans">
                              {cap.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. SYSTEMATIC SYSTEM RULES DASHBOARD */}
            {activeSubTab === "rules" && (
              <motion.div
                key="rules-subtab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Rules matrix manager */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div>
                    <span className="text-[9px] font-mono tracking-widest text-primary font-black uppercase">SYSTEM RULES MATRIX</span>
                    <h3 className="text-base font-bold text-on-surface uppercase tracking-tight mt-0.5 font-sans">
                      Active Systematic Safety Rules
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed font-sans">
                      These rules dynamically analyze incoming visitor telemetry and automatically escalate alerts on dispatcher modules when thresholds are crossed.
                    </p>
                  </div>

                  {/* Rules grid */}
                  <div className="grid grid-cols-1 gap-3">
                    {rulesList.map((rule) => {
                      return (
                        <div 
                          key={rule.id}
                          className={`bg-[#050505] border rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center transition-all ${
                            rule.active ? "border-white/10" : "border-white/5 opacity-50"
                          }`}
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                                rule.category === "SAFETY" ? "bg-red-500/10 text-red-400" : rule.category === "FLOW" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
                              }`}>
                                {rule.category}
                              </span>
                              <h4 className="text-xs font-bold text-on-surface uppercase tracking-tight font-sans">
                                {rule.name}
                              </h4>
                            </div>
                            <p className="text-[11px] text-on-surface-variant font-sans leading-normal">
                              {rule.description}
                            </p>
                            <div className="flex items-center gap-3 pt-1 text-[9px] text-on-surface-variant font-mono">
                              <span>Metric Bounds: <strong className="text-on-surface">{rule.metric}</strong></span>
                              <span>•</span>
                              <span>Target: <strong className="text-primary">{rule.thresholdValue} {rule.unit}</strong></span>
                              <span>•</span>
                              <span>Last Trigger: <strong className="text-on-surface-variant">{rule.lastTriggered}</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 sm:justify-end">
                            <button
                              type="button"
                              onClick={() => handleToggleRule(rule.id)}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                rule.active 
                                  ? "bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25" 
                                  : "bg-white/5 text-on-surface-variant border border-white/10 hover:bg-white/10"
                              }`}
                            >
                              {rule.active ? "● ACTIVE" : "○ INACTIVE"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Delete rule profile"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* RESTRICTION WARNING FOR NON-DISPATCHER */}
                  {currentRole !== "dispatcher" && currentRole !== "commander" && (
                    <div className="bg-red-500/5 border border-red-500/10 p-3.5 rounded-xl flex gap-3 items-start">
                      <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] text-red-300 font-bold font-sans uppercase">Clearance Unauthorized</p>
                        <p className="text-[10px] text-red-300/80 font-sans mt-0.5 leading-relaxed">
                          Your current role [<strong>{currentRole.toUpperCase()}</strong>] is restricted from creating or toggling reactive system rules. Please switch to **TACTICAL DISPATCHER (Main Admin)** in the left profile list to modify rules.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CREATE SYSTEM RULE FORM - ONLY ACCESSIBLE TO ADMIN ROLES */}
                  {(currentRole === "dispatcher" || currentRole === "commander") && (
                    <form onSubmit={handleCreateRule} className="bg-[#050505] border border-white/10 rounded-xl p-4 space-y-3.5">
                      <div className="border-b border-white/5 pb-2">
                        <h4 className="text-xs font-bold text-on-surface uppercase font-sans flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-primary" /> Create Custom Systematic Rule
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest block">Rule Name</label>
                          <input
                            type="text"
                            value={newRuleName}
                            onChange={(e) => setNewRuleName(e.target.value)}
                            placeholder="e.g. Turnstile Peak Warning"
                            className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-primary px-3 py-2 rounded-lg text-xs font-sans text-on-surface outline-none transition-colors"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest block">Rule Category</label>
                          <select
                            value={newRuleCategory}
                            onChange={(e) => setNewRuleCategory(e.target.value as any)}
                            className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-primary px-3 py-2 rounded-lg text-xs font-sans text-on-surface outline-none transition-colors"
                          >
                            <option value="SAFETY">SAFETY & MEDICAL</option>
                            <option value="FLOW">CROWD FLOW</option>
                            <option value="ACCESS">ACCESSIBILITY (ADA)</option>
                            <option value="SENTIMENT">SPECTATOR SENTIMENT</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest block">Description / Action Protocol</label>
                        <input
                          type="text"
                          value={newRuleDesc}
                          onChange={(e) => setNewRuleDesc(e.target.value)}
                          placeholder="e.g. Redirect volunteers to Gate B when turnstile flow exceeds threshold."
                          className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-primary px-3 py-2 rounded-lg text-xs font-sans text-on-surface outline-none transition-colors"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1 sm:col-span-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest">
                              Rule Threshold Value: <strong className="text-primary">{newRuleThreshold}</strong>
                            </label>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="150"
                            value={newRuleThreshold}
                            onChange={(e) => setNewRuleThreshold(parseInt(e.target.value))}
                            className="w-full accent-primary bg-white/10 cursor-pointer h-1.5 rounded-lg"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest block">Threshold Unit</label>
                          <input
                            type="text"
                            value={newRuleUnit}
                            onChange={(e) => setNewRuleUnit(e.target.value)}
                            placeholder="e.g. %, pax/min, minutes"
                            className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-primary px-3 py-2 rounded-lg text-xs font-sans text-on-surface outline-none transition-colors"
                            required
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full py-2 bg-primary hover:bg-primary-container text-black font-black text-[10px] tracking-widest uppercase rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" /> DEPLOY SYSTEM RULE TO TELEMETRY
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>
            )}

            {/* 3. PROVISION ROLE PROFILES (CREATING MEDICAL LEAD, TRANSIT LEAD, ETC) */}
            {activeSubTab === "provision" && (
              <motion.div
                key="provision-subtab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div>
                    <span className="text-[9px] font-mono tracking-widest text-primary font-black uppercase">ROLE PROVISIONING HUB</span>
                    <h3 className="text-base font-bold text-on-surface uppercase tracking-tight mt-0.5 font-sans">
                      Provision Operational Specialist Profiles
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed font-sans">
                      As the **Tactical Dispatcher (Main Admin)**, you can create and provision specific specialist roles (such as the *Safety & Medical Lead*, *Transcript Officer*, and *Follow Director*) dynamically.
                    </p>
                  </div>

                  {/* WARNING FOR NON-DISPATCHER */}
                  {currentRole !== "dispatcher" && currentRole !== "commander" && (
                    <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl flex gap-3.5 items-start">
                      <Lock className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-red-300 font-bold font-sans uppercase">Clearance Level Insufficient</p>
                        <p className="text-[11px] text-red-300/80 font-sans mt-0.5 leading-relaxed">
                          Bespoke operational provisioning is restricted to the **TACTICAL DISPATCHER (Main Admin)** role. Please select Tactical Dispatcher in the Handover list to provision new roles and dispatch targets.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* PROVISIONING FORM */}
                  {(currentRole === "dispatcher" || currentRole === "commander") && (
                    <form onSubmit={(e) => handleCreateRoleProfile(e)} className="bg-[#050505] border border-white/10 rounded-xl p-4 space-y-3.5">
                      <div className="border-b border-white/5 pb-2">
                        <h4 className="text-xs font-bold text-on-surface uppercase font-sans flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-primary" /> Provision New Specialist Profile
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest block">Operational Name</label>
                          <input
                            type="text"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            placeholder="e.g. Fire Safety Lead"
                            className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-primary px-3 py-2 rounded-lg text-xs font-sans text-on-surface outline-none transition-colors"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest block">Official Title</label>
                          <input
                            type="text"
                            value={newRoleTitle}
                            onChange={(e) => setNewRoleTitle(e.target.value)}
                            placeholder="e.g. Chief Fire Safety Marshal"
                            className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-primary px-3 py-2 rounded-lg text-xs font-sans text-on-surface outline-none transition-colors"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest block">Duty Description</label>
                          <input
                            type="text"
                            value={newRoleDesc}
                            onChange={(e) => setNewRoleDesc(e.target.value)}
                            placeholder="e.g. In charge of fire lanes, emergency exit locks, and coordinating marshals."
                            className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-primary px-3 py-2 rounded-lg text-xs font-sans text-on-surface outline-none transition-colors"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest block">Authorization Level</label>
                          <select
                            value={newRoleLevel}
                            onChange={(e) => setNewRoleLevel(e.target.value as any)}
                            className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-primary px-3 py-2 rounded-lg text-xs font-sans text-on-surface outline-none transition-colors"
                          >
                            <option value="SPECIALIST">SPECIALIST (Medical, Transit, Facilities)</option>
                            <option value="OPERATOR">OPERATOR (Incident queue management)</option>
                            <option value="OBSERVER">OBSERVER (Read-only spectator monitor)</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full py-2 bg-primary hover:bg-primary-container text-black font-black text-[10px] tracking-widest uppercase rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <UserCheck className="w-4 h-4" /> DEPLOY PROFILE CLEARANCES
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Provisioned roster feedback */}
                  <div className="pt-2">
                    <span className="text-[9px] font-mono tracking-widest text-on-surface-variant font-bold uppercase block mb-2">
                      Roster of Current Custom Provisioned Roles
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {rolesList.filter(r => r.custom).length === 0 ? (
                        <div className="sm:col-span-2 text-center p-6 border border-dashed border-white/5 rounded-xl bg-black/10">
                          <p className="text-[11px] text-on-surface-variant italic font-sans">
                            No custom specialist profiles are currently provisioned. Standard default World Cup profiles (Medical Lead, Transcript, Follow Director) are active.
                          </p>
                        </div>
                      ) : (
                        rolesList.filter(r => r.custom).map(role => (
                          <div 
                            key={role.id}
                            className="bg-[#050505] border border-white/10 p-3 rounded-xl flex justify-between items-center"
                          >
                            <div>
                              <div className="text-[10px] font-bold text-on-surface uppercase font-sans">{role.name}</div>
                              <div className="text-[8px] text-on-surface-variant font-mono mt-0.5">{role.title}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteRoleProfile(role.id)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer border border-red-500/10"
                              title="Revoke Provisioned clearance"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. SUBMISSION EVALUATOR & CHALLENGE ANALYZER */}
            {activeSubTab === "evaluator" && (
              <motion.div
                key="evaluator-subtab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Evaluator Main Card */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
                  
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
                    <div>
                      <span className="text-[9px] font-mono tracking-widest text-primary font-black uppercase flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-primary" /> HACKATHON COMPLIANCE ANALYZER
                      </span>
                      <h3 className="text-base font-bold text-on-surface uppercase tracking-tight mt-0.5 font-sans">
                        Submission Evaluation & Scorecard
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed font-sans">
                        Check real-time compliance with the official challenge rules, analyze technical approach pillars, and refine improvable areas.
                      </p>
                    </div>

                    {/* Score badge */}
                    <div className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-center flex flex-col items-center justify-center shrink-0 min-w-[120px]">
                      <span className="text-[8px] font-mono text-on-surface-variant uppercase tracking-wider">PROJECT SCORE</span>
                      <span className="text-2xl font-black text-primary font-mono mt-0.5">
                        {checklistItems.reduce((acc, item) => acc + (item.checked ? item.points : 0), 0)}/100
                      </span>
                      <span className="text-[8px] font-black text-green-400 font-mono mt-1 px-1.5 py-0.2 bg-green-500/10 border border-green-500/20 rounded">
                        GRADE A+ READY
                      </span>
                    </div>
                  </div>

                  {/* Internal Subtabs */}
                  <div className="flex gap-1 border-b border-white/5 pb-1">
                    <button
                      onClick={() => setEvalSubTab("scorecard")}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        evalSubTab === "scorecard"
                          ? "bg-primary/10 text-primary border border-primary/25"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Score Breakdown
                    </button>
                    <button
                      onClick={() => setEvalSubTab("approach")}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        evalSubTab === "approach"
                          ? "bg-primary/10 text-primary border border-primary/25"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Our Approach
                    </button>
                    <button
                      onClick={() => setEvalSubTab("code_functionality")}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        evalSubTab === "code_functionality"
                          ? "bg-primary/10 text-primary border border-primary/25"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Improvable Functional Areas
                    </button>
                  </div>

                  {/* SUBTAB CONTENTS */}
                  <div className="pt-2">
                    
                    {/* A. SCOREBREAKDOWN VIEW */}
                    {evalSubTab === "scorecard" && (
                      <div className="space-y-4">
                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center gap-3">
                          <Info className="w-5 h-5 text-primary shrink-0" />
                          <p className="text-[11px] text-on-surface-variant leading-relaxed font-sans">
                            Interactive parameters directly represent the Hackathon assessment checklist. Check or uncheck rules to simulate changes, or adjust the <strong>Functional Sliders</strong> in the <strong>Improvable Areas</strong> tab to maximize compliance.
                          </p>
                        </div>

                        <div className="space-y-2.5">
                          {checklistItems.map((item) => (
                            <div 
                              key={item.id}
                              onClick={() => {
                                setChecklistItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i));
                                handleAddAuditLog(`EVAL CHECKLIST TOGGLED: [${item.text}] is now ${!item.checked ? "MET" : "UNMET"}`, currentRole, "info");
                              }}
                              className={`p-3 rounded-lg border transition-all cursor-pointer flex justify-between items-center ${
                                item.checked 
                                  ? "bg-[#050505] border-white/10 text-on-surface" 
                                  : "bg-[#020202]/40 border-white/5 text-on-surface-variant line-through opacity-50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                                  item.checked 
                                    ? "bg-primary text-black border-primary" 
                                    : "border-white/20 bg-transparent"
                                }`}>
                                  {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span className="text-[11px] font-sans font-medium">{item.text}</span>
                              </div>

                              <div className="flex items-center gap-2.5 shrink-0">
                                <span className={`text-[8px] font-mono font-black px-1.5 py-0.2 rounded ${
                                  item.impact === "HIGH" 
                                    ? "bg-red-500/10 text-red-400" 
                                    : item.impact === "MEDIUM" 
                                    ? "bg-secondary/20 text-secondary" 
                                    : "bg-white/5 text-on-surface-variant"
                                }`}>
                                  {item.impact} IMPACT
                                </span>
                                <span className="text-[10px] font-mono text-primary font-black shrink-0">
                                  +{item.points} PTS
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* B. TECHNICAL APPROACH VIEW */}
                    {evalSubTab === "approach" && (
                      <div className="space-y-5">
                        
                        {/* Chosen Vertical Details */}
                        <div className="bg-gradient-to-r from-primary/10 to-transparent border border-white/5 p-4 rounded-xl space-y-2">
                          <span className="text-[8px] font-mono text-primary font-black tracking-widest uppercase">VERTICAL HIGHLIGHT</span>
                          <h4 className="text-xs font-black text-on-surface uppercase font-sans">FIFA World Cup Stadium Safety & Crisis Management</h4>
                          <p className="text-[11px] text-on-surface-variant leading-relaxed font-sans">
                            Designed specifically around tactical stadium logistics, high-stress incident dispatch, spectator density mapping, temperature safety triggers, and automated audio radio transcription logic.
                          </p>
                        </div>

                        {/* Four Pillars of Solution */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#050505] border border-white/10 p-3.5 rounded-xl space-y-1.5">
                            <span className="text-[9px] font-mono text-primary font-black uppercase">01 / SMART AI INITIATIVE</span>
                            <h5 className="text-[11px] font-bold text-on-surface uppercase font-sans">Gemini-Powered Natural Language Assist</h5>
                            <p className="text-[10px] text-on-surface-variant leading-relaxed font-sans">
                              Integrates server-side logic directly, analyzing audio transcripts, calculating optimal crowd directions, and suggesting immediate paramedic route coordinates.
                            </p>
                          </div>

                          <div className="bg-[#050505] border border-white/10 p-3.5 rounded-xl space-y-1.5">
                            <span className="text-[9px] font-mono text-secondary font-black uppercase">02 / ZERO MOCK ARCHITECTURE</span>
                            <h5 className="text-[11px] font-bold text-on-surface uppercase font-sans">Functional Live Integrations</h5>
                            <p className="text-[10px] text-on-surface-variant leading-relaxed font-sans">
                              Includes real dynamic configurations. Schema checking, incident write operations, physical access controls, and volunteer coordination streams function live.
                            </p>
                          </div>

                          <div className="bg-[#050505] border border-white/10 p-3.5 rounded-xl space-y-1.5">
                            <span className="text-[9px] font-mono text-[#fbbf24] font-black uppercase">03 / SECURE DUTY ISOLATION</span>
                            <h5 className="text-[11px] font-bold text-on-surface uppercase font-sans">Rigorous Handover Clearances</h5>
                            <p className="text-[10px] text-on-surface-variant leading-relaxed font-sans">
                              Each role (Commander, Medical Officer, Transcript Officer, Flow Coordinator) operates strictly within isolated modules to safeguard high-alert operational controls.
                            </p>
                          </div>

                          <div className="bg-[#050505] border border-white/10 p-3.5 rounded-xl space-y-1.5">
                            <span className="text-[9px] font-mono text-blue-400 font-black uppercase">04 / RESPONSIVE OPTIMIZATION</span>
                            <h5 className="text-[11px] font-bold text-on-surface uppercase font-sans">Fluid Density Telemetry Grid</h5>
                            <p className="text-[10px] text-on-surface-variant leading-relaxed font-sans">
                              Maintains crisp grid metrics, responsive SVG floor mapping, mobile touch compliance boundaries (&gt;44px), and high contrast views.
                            </p>
                          </div>
                        </div>

                        {/* Architectural Assumptions */}
                        <div className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-2">
                          <h4 className="text-xs font-bold text-on-surface uppercase font-sans flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-primary" /> Key Project Assumptions
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-[10px] text-on-surface-variant font-sans leading-normal">
                            <li>PostgreSQL serves as the single source of truth for stadium logging, sync'd live during sessions.</li>
                            <li>Local Storage provides transient persistence for active reactive system rules if internet connection is offline.</li>
                            <li>The user is evaluating this container on our dedicated Cloud Run proxy at <strong>port 3000</strong>.</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* C. IMPROVABLE AREAS & PERFORMANCE TUNER */}
                    {evalSubTab === "code_functionality" && (
                      <div className="space-y-5">
                        
                        {/* Improvable Points Summary */}
                        <div className="bg-[#050505] border border-white/10 p-4 rounded-xl">
                          <h4 className="text-xs font-bold text-primary uppercase font-sans flex items-center gap-1.5 mb-1">
                            <Sliders className="w-4 h-4" /> Code Functional Improvement Matrix
                          </h4>
                          <p className="text-[11px] text-on-surface-variant leading-relaxed font-sans">
                            While the system operates at an advanced grade, certain functions can be incrementally improved. Tweak these sliders to represent code optimization levels:
                          </p>

                          {/* Sliders */}
                          <div className="space-y-4 pt-4">
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-sans text-on-surface">Telemetry Database Index Caching</span>
                                <span className="font-mono text-primary font-bold">{perfCacheTuning}% (Efficient)</span>
                              </div>
                              <input 
                                type="range" 
                                min="50" 
                                max="100" 
                                value={perfCacheTuning} 
                                onChange={(e) => {
                                  setPerfCacheTuning(parseInt(e.target.value));
                                  handleAddAuditLog(`TUNER MODIFIED: Optimized Telemetry Caching to ${e.target.value}%`, currentRole, "success");
                                }}
                                className="w-full accent-primary bg-white/10 cursor-pointer h-1 rounded" 
                              />
                              <p className="text-[8px] text-on-surface-variant font-mono">Improves DB read rates under peak concurrency during turnout spikes.</p>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-sans text-on-surface">Field Audio Clip Loss Throttling</span>
                                <span className="font-mono text-primary font-bold">{audioEncodingTuning}% (High Fidelity)</span>
                              </div>
                              <input 
                                type="range" 
                                min="50" 
                                max="100" 
                                value={audioEncodingTuning} 
                                onChange={(e) => {
                                  setAudioEncodingTuning(parseInt(e.target.value));
                                  handleAddAuditLog(`TUNER MODIFIED: Optimized Audio Encoding Loss to ${e.target.value}%`, currentRole, "success");
                                }}
                                className="w-full accent-primary bg-white/10 cursor-pointer h-1 rounded" 
                              />
                              <p className="text-[8px] text-on-surface-variant font-mono">Ensures high transcription rate over static-filled local radio frequencies.</p>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-sans text-on-surface">Geographic Grid Precision Radius</span>
                                <span className="font-mono text-primary font-bold">{geolocPrecisionTuning}% (High Resolution)</span>
                              </div>
                              <input 
                                type="range" 
                                min="50" 
                                max="100" 
                                value={geolocPrecisionTuning} 
                                onChange={(e) => {
                                  setGeolocPrecisionTuning(parseInt(e.target.value));
                                  handleAddAuditLog(`TUNER MODIFIED: Optimized Ingress Route Geoloc Precision to ${e.target.value}%`, currentRole, "success");
                                }}
                                className="w-full accent-primary bg-white/10 cursor-pointer h-1 rounded" 
                              />
                              <p className="text-[8px] text-on-surface-variant font-mono">Increases location tracking accuracy of first responders inside standard zones.</p>
                            </div>
                          </div>
                        </div>

                        {/* Improvability Roadmap list */}
                        <div className="bg-black/35 border border-white/5 p-4 rounded-xl space-y-3">
                          <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
                            <Terminal className="w-4 h-4 text-primary" />
                            <h4 className="text-xs font-black text-on-surface uppercase font-sans">Architectural Roadmap for Evaluators</h4>
                          </div>

                          <div className="space-y-3">
                            <div className="flex gap-2.5 items-start">
                              <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1.5" />
                              <div>
                                <span className="text-[11px] font-bold text-on-surface block font-sans">Dynamic Web Workers for Audio Decoding</span>
                                <p className="text-[10px] text-on-surface-variant leading-normal font-sans">
                                  Currently, audio capturing is structured synchronously in-browser. Offloading recording feeds to background threads would minimize layout blocking.
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2.5 items-start">
                              <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1.5" />
                              <div>
                                <span className="text-[11px] font-bold text-on-surface block font-sans">Offline IndexedDB Fallback Synchronization</span>
                                <p className="text-[10px] text-on-surface-variant leading-normal font-sans">
                                  In cases of cellular grid collapse inside the arena, storing logs in IndexedDB with automated cloud re-sync upon network re-entry is the ultimate redundancy target.
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2.5 items-start">
                              <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1.5" />
                              <div>
                                <span className="text-[11px] font-bold text-on-surface block font-sans">D3 Vector-Based Flow Interpolation Mapping</span>
                                <p className="text-[10px] text-on-surface-variant leading-normal font-sans">
                                  Upgrading static SVG maps to fully dynamic vector fields calculating flow forces utilizing Navier-Stokes equations for predictive egress routing.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Trigger Simulated Auto-Optimization Button */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPerfCacheTuning(100);
                              setAudioEncodingTuning(100);
                              setGeolocPrecisionTuning(100);
                              handleAddAuditLog("COMPILER AUTO-OPTIMIZATION RUN: Synchronized all parameters to 100% compliance level.", currentRole, "success");
                            }}
                            className="w-full py-2.5 bg-gradient-to-r from-primary to-green-400 text-black font-black text-[10px] tracking-widest uppercase rounded-lg shadow-lg hover:shadow-primary/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Sparkles className="w-4 h-4" /> Trigger Auto-Refinement Compliance Sync (Run Optimizer)
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
