"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Phone, CheckCircle, Clock, AlertCircle, Briefcase, BarChart2 } from "lucide-react";
import { outreachApi, callsApi } from "@/lib/api";
import { formatDate, STATUS_COLORS } from "@/lib/utils";
import Link from "next/link";

export default function OutreachDashboard() {
  const [outreachResults, setOutreachResults] = useState<any[]>([]);
  const [allCalls, setAllCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [outreach, calls] = await Promise.all([
        outreachApi.getResults(),
        callsApi.list({ page_size: 50 }),
      ]);
      setOutreachResults(outreach.results);
      setAllCalls(calls.results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = {
    total: outreachResults.length + allCalls.length,
    completed: allCalls.filter((c) => c.lifecycle_status === "COMPLETED").length,
    inProgress: allCalls.filter((c) => c.lifecycle_status === "IN_PROGRESS").length,
    notConnected: allCalls.filter((c) => c.lifecycle_status === "NOT_CONNECTED").length,
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Outreach Dashboard</h1>
          <p className="text-slate-500 mt-1">Track all voice outreach calls and conversation results</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link href="/people-search" className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-200">
            + New Search
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Outreach", value: stats.total, icon: Phone, bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-100" },
          { label: "Conversations Done", value: stats.completed, icon: CheckCircle, bg: "bg-green-50", text: "text-green-600", border: "border-green-100" },
          { label: "In Progress", value: stats.inProgress, icon: Clock, bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
          { label: "No Answer", value: stats.notConnected, icon: AlertCircle, bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100" },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-2xl border ${s.border} p-5 shadow-sm`}>
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.text}`} />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{loading ? "—" : s.value}</div>
            <div className="text-sm text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Calls Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-pink-600" />
          <h2 className="font-bold text-slate-900">All Calls & Results</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Number</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Results</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-6 py-4"><div className="skeleton h-5 rounded w-24" /></td>)}</tr>
              ))
            ) : allCalls.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-slate-400">
                  <Phone className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No outreach calls yet</p>
                  <Link href="/people-search" className="text-sm text-pink-600 hover:underline mt-1 inline-block">Search for candidates</Link>
                </td>
              </tr>
            ) : (
              allCalls.map((call) => (
                <tr key={call.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-bold text-xs flex-shrink-0">
                        {call.callee_name[0]}
                      </div>
                      <span className="font-semibold text-slate-900">{call.callee_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{call.mobile_number}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[call.lifecycle_status] || "bg-gray-100 text-gray-600"}`}>
                      {call.lifecycle_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(call.created_at)}</td>
                  <td className="px-6 py-4">
                    {call.result && Object.keys(call.result).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(call.result).slice(0, 3).map(([k, v]) => (
                          <span key={k} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-md border border-green-100">
                            {k}: <strong>{String(v)}</strong>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs">Pending...</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
