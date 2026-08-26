"use client";

import { useState, useEffect } from "react";
import { Phone, MessageSquare, Wifi, Fingerprint, CheckCircle, AlertCircle, Users, MapPin, Clock, Loader2, Play } from "lucide-react";
import { attendanceApi, type AttendanceLog } from "@/lib/api";

const LOCATIONS = [
  "Construction Site A", "Warehouse B", "Factory Floor 1", "Retail Outlet Delhi", "Office Bengaluru",
  "Distribution Hub Mumbai", "Field Unit Hyderabad", "Site Office Pune", "Plant Chennai", "Depot Kolkata",
];

const CHANNELS = [
  { key: "ivr", label: "IVR Call", icon: Phone, color: "from-emerald-500 to-teal-500", desc: "Worker dials a toll-free number" },
  { key: "ussd", label: "USSD", icon: Wifi, color: "from-blue-500 to-indigo-500", desc: "Worker dials *123# on feature phone" },
  { key: "sms", label: "SMS", icon: MessageSquare, color: "from-purple-500 to-violet-500", desc: "Supervisor sends batch SMS" },
  { key: "biometric", label: "Biometric", icon: Fingerprint, color: "from-orange-500 to-amber-500", desc: "Fingerprint reader at site" },
];

const MOCK_EMPLOYEES = [
  "Rajesh Kumar", "Sunita Devi", "Mohan Lal", "Priya Singh", "Arjun Sharma",
  "Deepa Nair", "Ravi Verma", "Anita Patel", "Suresh Yadav", "Kavita Gupta",
];

export default function AttendancePage() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeChannel, setActiveChannel] = useState("ivr");
  const [simulating, setSimulating] = useState(false);
  const [demoForm, setDemoForm] = useState({ employee_name: MOCK_EMPLOYEES[0], location: LOCATIONS[0] });

  useEffect(() => {
    attendanceApi.getLogs().then((r) => setLogs(r.logs)).catch(() => {});
  }, []);

  const logAttendance = async (name: string, location: string, channel: string) => {
    const entry = await attendanceApi.log({
      employee_id: `EMP-${Math.floor(Math.random() * 9000) + 1000}`,
      employee_name: name,
      location,
      channel,
      verified: Math.random() > 0.1,
    });
    setLogs((prev) => [entry, ...prev]);
  };

  const handleDemo = async () => {
    setLoading(true);
    await logAttendance(demoForm.employee_name, demoForm.location, activeChannel);
    setLoading(false);
  };

  const simulateBulk = async () => {
    setSimulating(true);
    for (let i = 0; i < 10; i++) {
      const name = MOCK_EMPLOYEES[Math.floor(Math.random() * MOCK_EMPLOYEES.length)];
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const channel = CHANNELS[Math.floor(Math.random() * CHANNELS.length)].key;
      await logAttendance(name, location, channel);
      await new Promise((r) => setTimeout(r, 300));
    }
    setSimulating(false);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-emerald-200">
          <MapPin className="w-3.5 h-3.5" /> Assignment Question 3
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          Smart Attendance — No Smartphones
        </h1>
        <p className="text-slate-500 text-lg max-w-3xl">
          <strong className="text-slate-700">The Problem:</strong> You're an HR tracking attendance of 1,000 people across 100 locations every day — without smartphones. LLMs exist. What do you do?
        </p>
      </div>

      {/* Solution Overview */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-200 p-8 mb-8">
        <h2 className="text-xl font-bold text-emerald-900 mb-2">🎯 The Solution</h2>
        <p className="text-emerald-700 mb-6 leading-relaxed">
          Build an <strong>LLM-powered multi-channel attendance system</strong> that works on basic feature phones and landlines — using IVR, USSD, SMS, and biometric readers — feeding into a real-time centralized dashboard.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CHANNELS.map((ch) => (
            <div key={ch.key} className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${ch.color} flex items-center justify-center mb-3 shadow`}>
                <ch.icon className="w-5 h-5 text-white" />
              </div>
              <div className="font-bold text-slate-900 text-sm">{ch.label}</div>
              <p className="text-xs text-slate-500 mt-1">{ch.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">🏗️ System Architecture</h2>
        <div className="relative">
          {/* Flow Diagram using pure CSS */}
          <div className="grid grid-cols-5 gap-2 items-center text-center text-xs">
            {/* Column 1: Input Methods */}
            <div className="space-y-2">
              <div className="font-bold text-slate-600 text-xs uppercase tracking-wider mb-3">Input Channels</div>
              {CHANNELS.map((ch) => (
                <div key={ch.key} className={`bg-gradient-to-br ${ch.color} text-white rounded-xl p-2.5 text-xs font-medium shadow-sm`}>
                  {ch.label}
                </div>
              ))}
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center text-slate-400 text-2xl">→</div>

            {/* Column 2: LLM Processing */}
            <div>
              <div className="font-bold text-slate-600 text-xs uppercase tracking-wider mb-3">LLM Engine</div>
              <div className="bg-violet-600 text-white rounded-2xl p-4 shadow-lg">
                <div className="text-sm font-bold mb-1">LLM Core</div>
                <div className="text-xs opacity-80 space-y-1">
                  <div>Identity verification</div>
                  <div>Message parsing</div>
                  <div>Fraud detection</div>
                  <div>Data extraction</div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center text-slate-400 text-2xl">→</div>

            {/* Column 3: Output */}
            <div>
              <div className="font-bold text-slate-600 text-xs uppercase tracking-wider mb-3">Dashboard</div>
              <div className="bg-emerald-600 text-white rounded-2xl p-4 shadow-lg">
                <div className="text-sm font-bold mb-1">Central DB</div>
                <div className="text-xs opacity-80 space-y-1">
                  <div>Real-time logs</div>
                  <div>100 locations</div>
                  <div>1000 workers</div>
                  <div>Alerts & reports</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How Each Channel Works */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">📞 How Each Channel Works</h2>
        <div className="space-y-6">
          {[
            {
              channel: "IVR / Voice (Hunar.AI)",
              icon: Phone,
              color: "text-emerald-600",
              steps: [
                "Worker dials toll-free IVR number (works on any basic phone)",
                "AI Voice Agent (Hunar.AI) asks: 'What's your employee ID?'",
                "Worker speaks their ID — LLM transcribes and verifies against database",
                "Agent asks: 'Are you at [Location Name]? Say Yes or press 1'",
                "Attendance is confirmed and logged with timestamp",
              ],
            },
            {
              channel: "USSD",
              icon: Wifi,
              color: "text-blue-600",
              steps: [
                "Worker dials *123*EMP_ID# on feature phone",
                "USSD gateway sends structured data to LLM backend",
                "LLM parses employee ID and location from USSD session",
                "Response confirms attendance: 'Welcome Rajesh. Attendance at Site A logged.'",
                "No internet, no app needed — works offline on any SIM",
              ],
            },
            {
              channel: "SMS (Supervisor Batch)",
              icon: MessageSquare,
              color: "text-purple-600",
              steps: [
                "Supervisor SMSes: 'ATTEND: EMP001,EMP002,EMP003 SITE:A'",
                "LLM parses natural language or structured SMS format",
                "Bulk attendance is logged for all mentioned employees",
                "Anomaly detection: LLM flags if same employee logged at 2 sites",
                "SMS confirmation sent back to supervisor",
              ],
            },
            {
              channel: "Biometric + Edge LLM",
              icon: Fingerprint,
              color: "text-orange-600",
              steps: [
                "Fingerprint reader at each of 100 sites (offline capable)",
                "Edge device runs lightweight LLM for local verification",
                "Attendance synced to central server every 30 minutes",
                "If offline, data cached and synced when connectivity restored",
                "LLM detects duplicate attempts and time fraud",
              ],
            },
          ].map((item) => (
            <div key={item.channel} className="flex gap-4">
              <div className={`flex-shrink-0 mt-0.5 ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">{item.channel}</h3>
                <ol className="space-y-1">
                  {item.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tradeoff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">⚖️ Technology Tradeoffs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-500 font-semibold">Channel</th>
                <th className="text-left py-3 px-4 text-slate-500 font-semibold">Cost</th>
                <th className="text-left py-3 px-4 text-slate-500 font-semibold">Accuracy</th>
                <th className="text-left py-3 px-4 text-slate-500 font-semibold">Requires</th>
                <th className="text-left py-3 px-4 text-slate-500 font-semibold">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ["IVR (Hunar.AI)", "Low", "High (voice verified)", "Basic phone + signal", "Remote field workers"],
                ["USSD", "Very Low", "Medium (ID-based)", "Feature phone + SIM", "No-internet zones"],
                ["SMS", "Very Low", "Medium (supervisor trust)", "Basic phone", "Batch supervisor logging"],
                ["Biometric + Edge LLM", "Medium (hardware)", "Very High (biometric)", "Power + device at site", "High-security sites"],
              ].map(([ch, cost, acc, req, best]) => (
                <tr key={ch} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{ch}</td>
                  <td className="py-3 px-4 text-slate-600">{cost}</td>
                  <td className="py-3 px-4 text-slate-600">{acc}</td>
                  <td className="py-3 px-4 text-slate-500">{req}</td>
                  <td className="py-3 px-4 text-slate-600">{best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Demo */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-2">🎮 Live Demo Simulation</h2>
        <p className="text-slate-500 mb-6">Simulate attendance logging across different channels</p>

        {/* Channel Selector */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {CHANNELS.map((ch) => (
            <button
              key={ch.key}
              onClick={() => setActiveChannel(ch.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${activeChannel === ch.key ? `bg-gradient-to-br ${ch.color} text-white border-transparent shadow-md` : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
            >
              <ch.icon className="w-4 h-4" />
              {ch.label}
            </button>
          ))}
        </div>

        {/* Demo Form */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Employee</label>
            <select value={demoForm.employee_name} onChange={(e) => setDemoForm((f) => ({ ...f, employee_name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white">
              {MOCK_EMPLOYEES.map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
            <select value={demoForm.location} onChange={(e) => setDemoForm((f) => ({ ...f, location: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white">
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleDemo} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Log Attendance
            </button>
            <button
              onClick={simulateBulk} disabled={simulating}
              className="flex items-center gap-1.5 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-medium py-2.5 px-4 rounded-xl transition-all text-sm"
            >
              {simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Bulk (10)
            </button>
          </div>
        </div>

        {/* Logs */}
        {logs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-700">{logs.length} attendance entries logged</span>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full ${log.verified ? "bg-green-500" : "bg-red-500"}`} />
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-slate-900">{log.employee_name}</span>
                    <span className="text-slate-400 mx-2">·</span>
                    <span className="text-slate-500 flex items-center gap-1 inline-flex">
                      <MapPin className="w-3 h-3" /> {log.location}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    log.channel === "ivr" ? "bg-emerald-100 text-emerald-700" :
                    log.channel === "ussd" ? "bg-blue-100 text-blue-700" :
                    log.channel === "sms" ? "bg-purple-100 text-purple-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>{log.channel.toUpperCase()}</span>
                  <span className={`text-xs flex items-center gap-1 ${log.verified ? "text-green-600" : "text-red-600"}`}>
                    {log.verified ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {log.verified ? "Verified" : "Failed"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Key Benefits */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: "🌐", title: "No Internet Required", desc: "IVR and USSD work on 2G network. SMS works even with minimal signal." },
          { icon: "🧠", title: "LLM Intelligence", desc: "AI detects fraud, parses natural language, and handles edge cases automatically." },
          { icon: "📊", title: "Real-time Dashboard", desc: "Central HR dashboard shows live attendance across all 100 locations instantly." },
          { icon: "🔒", title: "Fraud Prevention", desc: "LLM cross-references location, time, and identity to flag suspicious patterns." },
          { icon: "💰", title: "Zero Device Cost", desc: "Workers use their existing basic phones. No app installation needed." },
          { icon: "📱", title: "Supervisor Oversight", desc: "Site supervisors can batch-submit attendance via SMS for entire teams." },
        ].map((b) => (
          <div key={b.title} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="text-3xl mb-3">{b.icon}</div>
            <h3 className="font-bold text-slate-900 mb-1.5">{b.title}</h3>
            <p className="text-sm text-slate-500">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
