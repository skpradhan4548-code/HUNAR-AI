"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { agentsApi } from "@/lib/api";

const LANGUAGES = ["ENGLISH", "HINDI", "TAMIL", "TELUGU", "KANNADA", "MARATHI", "MALAYALAM", "GUJARATI", "BENGALI", "TURKISH", "ARABIC", "SPANISH"];
const PERSONAS = ["NEHA", "ROY", "ZOE", "SAM", "MIRA", "EESHA"];

export default function NewAgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "AI Hiring Interviewer",
    language: "ENGLISH",
    voice_persona: "NEHA",
    persona_name: "Priya",
    agent_prompt: `You are a professional AI hiring interviewer named {persona_name} from the company. Your goal is to screen candidates for the role of {job_role} at {company}.

Be warm, professional, and structured. Ask the following:
1. A brief introduction question
2. Their relevant experience for {job_role}
3. Their technical skills and strengths
4. Availability and salary expectations
5. Any questions they have for us

Keep each question concise. Listen actively. After all questions, thank them warmly.`,
    objective: "Screen and qualify job candidates for open positions through a conversational voice interview.",
    introduction: "Hello! Am I speaking with {callee_name}? Great! I'm {persona_name}, an AI recruiting assistant calling from {company}. I'd love to chat with you about the {job_role} opportunity. Do you have about 5 minutes?",
    result_prompt: "Analyze the conversation and extract the candidate's: interest level, years of experience, key skills mentioned, availability, and salary expectations. Provide an overall qualification score.",
    result_schema: JSON.stringify({
      interest_level: "string",
      years_of_experience: "string",
      key_skills: "string",
      availability: "string",
      salary_expectation: "string",
      overall_score: "string",
      recommendation: "string",
    }, null, 2),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let schema: Record<string, string>;
      try {
        schema = JSON.parse(form.result_schema);
      } catch {
        setError("Result Schema must be valid JSON");
        setLoading(false);
        return;
      }
      await agentsApi.create({
        name: form.name,
        language: form.language,
        voice_persona: form.voice_persona,
        persona_name: form.persona_name || undefined,
        agent_prompt: form.agent_prompt,
        objective: form.objective,
        introduction: form.introduction,
        result_prompt: form.result_prompt,
        result_schema: schema,
      });
      setSuccess(true);
      setTimeout(() => router.push("/hiring/agents"), 1500);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (success) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Agent Created!</h2>
        <p className="text-slate-500">Redirecting to agents...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <Link href="/hiring/agents" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Agents
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900">Create New Agent</h1>
        <p className="text-slate-500 mt-1">Configure an AI voice interviewer for your hiring pipeline</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Agent Name *</label>
              <input
                type="text" value={form.name} onChange={set("name")} required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Language *</label>
              <select value={form.language} onChange={set("language")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm bg-white">
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Voice Persona *</label>
              <select value={form.voice_persona} onChange={set("voice_persona")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm bg-white">
                {PERSONAS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Persona Display Name</label>
              <input
                type="text" value={form.persona_name} onChange={set("persona_name")}
                placeholder="e.g. Priya"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Prompts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-900">Conversation Design</h3>
          {[
            { key: "objective", label: "Objective *", rows: 2, hint: "High-level goal of this agent" },
            { key: "introduction", label: "Introduction *", rows: 3, hint: "Opening message. Use {callee_name}, {persona_name}" },
            { key: "agent_prompt", label: "Agent System Prompt *", rows: 8, hint: "Define personality and interview flow. Use {job_role}, {company}" },
            { key: "result_prompt", label: "Result Extraction Prompt *", rows: 3, hint: "Instructions for extracting structured results from the conversation" },
          ].map(({ key, label, rows, hint }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
              <p className="text-xs text-slate-400 mb-1.5">{hint}</p>
              <textarea
                value={form[key as keyof typeof form]} onChange={set(key as keyof typeof form)}
                rows={rows} required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-mono resize-none"
              />
            </div>
          ))}
        </div>

        {/* Schema */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-1.5">Result Schema</h3>
          <p className="text-xs text-slate-400 mb-4">JSON object with key names and empty string values. These fields will be populated after each call.</p>
          <textarea
            value={form.result_schema} onChange={set("result_schema")}
            rows={10} required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-mono resize-none"
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-violet-200"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Agent...</> : "Create Agent"}
        </button>
      </form>
    </div>
  );
}
