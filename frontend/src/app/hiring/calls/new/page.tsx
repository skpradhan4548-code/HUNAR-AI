"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { agentsApi, callsApi, numbersApi, type Agent, type PhoneNumber } from "@/lib/api";

export default function NewCallPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    agent_id: "",
    callee_name: "",
    mobile_number: "+91",
    from_phone_number: "",
    // custom fields (will be dynamic)
    job_role: "",
    company: "",
    location: "",
  });

  const [dynamicVars, setDynamicVars] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      agentsApi.list({ status: "ACTIVE", page_size: 50 }),
      numbersApi.list(),
    ])
      .then(([a, n]) => {
        setAgents(a.results);
        setNumbers(n.results);
        if (a.results.length > 0) {
          setForm((f) => ({ ...f, agent_id: a.results[0].id }));
          initDynamicVars(a.results[0]);
        }
        if (n.results.length > 0) setForm((f) => ({ ...f, from_phone_number: n.results[0].phone_number }));
      })
      .catch((e) => setError(e.message))
      .finally(() => setDataLoading(false));
  }, []);

  const selectedAgent = agents.find((a) => a.id === form.agent_id);

  const initDynamicVars = (agent?: Agent) => {
    if (!agent) return;
    const initial: Record<string, string> = {};
    for (const v of agent.custom_variables || []) {
      if (v.includes("role") || v.includes("title") || v.includes("job")) initial[v] = "Software Engineer";
      else if (v.includes("loc") || v.includes("city")) initial[v] = "Bengaluru";
      else if (v.includes("comp") || v.includes("org")) initial[v] = "Hunar.AI";
      else initial[v] = v.replace(/_/g, " ");
    }
    setDynamicVars(initial);
  };

  const handleAgentChange = (agentId: string) => {
    setForm((f) => ({ ...f, agent_id: agentId }));
    const agent = agents.find((a) => a.id === agentId);
    initDynamicVars(agent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agent_id) { setError("Please select an agent"); return; }
    setLoading(true);
    setError(null);
    try {
      const customData: Record<string, string> = { ...dynamicVars };

      // Ensure every single agent custom_variable has a non-empty string value
      if (selectedAgent?.custom_variables) {
        for (const v of selectedAgent.custom_variables) {
          if (!customData[v]) {
            if (v.includes("role") || v.includes("title")) customData[v] = form.job_role || "Delivery Partner";
            else if (v.includes("loc") || v.includes("city")) customData[v] = form.location || "Bengaluru";
            else if (v.includes("comp")) customData[v] = form.company || "Hunar";
            else customData[v] = form[v as keyof typeof form] || v;
          }
        }
      }

      const call = await callsApi.create({
        agent_id: form.agent_id,
        callee_name: form.callee_name,
        mobile_number: form.mobile_number,
        custom_data: customData,
        from_phone_number: form.from_phone_number || undefined,
        request_id: `hire-${Date.now()}`,
      });
      setSuccess(call.id);
      setTimeout(() => router.push("/hiring/calls"), 2500);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (success) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce">
          <Phone className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Call Initiated!</h2>
        <p className="text-slate-500 mb-1">Call ID: <code className="font-mono text-violet-600 text-sm">{success}</code></p>
        <p className="text-sm text-slate-400">Your phone will ring shortly. Redirecting to calls list...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/hiring/calls" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Calls
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900">New Interview Call</h1>
        <p className="text-slate-500 mt-1">Schedule an AI voice interview with a candidate</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Agent Selection */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4">Select Interview Agent</h3>
          {dataLoading ? (
            <div className="skeleton h-12 rounded-xl" />
          ) : agents.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">
              No active agents found.{" "}
              <Link href="/hiring/agents/new" className="underline font-semibold">Create one first</Link>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {agents.map((agent) => (
                <label
                  key={agent.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    form.agent_id === agent.id ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="agent_id"
                    value={agent.id}
                    checked={form.agent_id === agent.id}
                    onChange={() => handleAgentChange(agent.id)}
                    className="accent-violet-600"
                  />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{agent.name[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 text-sm truncate">{agent.name}</div>
                    <div className="text-xs text-slate-500">{agent.voice_persona} · {agent.language}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Candidate Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-900">Candidate Information</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Candidate Name *</label>
            <input
              type="text" value={form.callee_name} onChange={set("callee_name")} required
              placeholder="e.g. Saroj Pradhan"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mobile Number *</label>
            <input
              type="tel" value={form.mobile_number} onChange={set("mobile_number")} required
              placeholder="+91XXXXXXXXXX (E.164 format)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-mono"
            />
            <p className="text-xs text-slate-400 mt-1">Must start with +country_code (e.g., +91 for India)</p>
          </div>
          {numbers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">From Number (Caller ID)</label>
              <select value={form.from_phone_number} onChange={set("from_phone_number")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm bg-white">
                <option value="">— Use organization default —</option>
                {numbers.map((n) => <option key={n.phone_number} value={n.phone_number}>{n.phone_number}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Agent Required Variables */}
        {selectedAgent && selectedAgent.custom_variables && selectedAgent.custom_variables.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900">Agent Context Variables</h3>
            <p className="text-xs text-slate-400">
              This agent uses these variables in its conversation prompts:
            </p>
            <div className="grid grid-cols-2 gap-4">
              {selectedAgent.custom_variables.map((v) => (
                <div key={v} className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 font-mono capitalize">
                    {v.replace(/_/g, " ")} *
                  </label>
                  <input
                    type="text"
                    value={dynamicVars[v] || ""}
                    onChange={(e) => setDynamicVars((d) => ({ ...d, [v]: e.target.value }))}
                    required
                    placeholder={`e.g. ${v}`}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit" disabled={loading || dataLoading || agents.length === 0}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-violet-200"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing Call...</> : <><Phone className="w-4 h-4" /> Start Interview Call</>}
        </button>
      </form>
    </div>
  );
}
