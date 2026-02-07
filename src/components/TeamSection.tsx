"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, Shield, Mail, Key, Trash2, ChartBar, CheckCircle2, Clock, AlertTriangle, CalendarDays, CalendarRange, Filter } from "lucide-react";
import { Agent, Task } from "./TaskCard";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface TeamSectionProps {
    agents: Agent[];
    tasks: Task[];
    onRemoveAgent: (id: string) => void;
    isAdmin: boolean;
}

type ReportPeriod = 'all' | 'weekly' | 'monthly';

export default function TeamSection({ agents, tasks, onRemoveAgent, isAdmin }: TeamSectionProps) {
    const [period, setPeriod] = useState<ReportPeriod>('all');
    const [viewMode, setViewMode] = useState<'cards' | 'report'>('cards');

    const agentStats = useMemo(() => {
        const now = new Date();
        const startOfPeriod = new Date();
        if (period === 'weekly') startOfPeriod.setDate(now.getDate() - 7);
        else if (period === 'monthly') startOfPeriod.setMonth(now.getMonth() - 1);

        return agents.map(agent => {
            const agentTasks = tasks.filter(t => t.agent === agent.name);
            const periodTasks = period === 'all'
                ? agentTasks
                : agentTasks.filter(t => new Date(t.deadline) >= startOfPeriod);

            return {
                ...agent,
                total: periodTasks.length,
                done: periodTasks.filter(t => t.status === 'Done').length,
                pending: periodTasks.filter(t => t.status === 'In Progress' || t.status === 'Not Started' || t.status === 'Action Needed').length,
                overdue: periodTasks.filter(t => t.status !== 'Done' && new Date(t.deadline) < now).length
            };
        });
    }, [agents, tasks, period]);

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-black text-slate-800 italic uppercase">Agent Intel Registry</h2>
                    <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-1">Personnel Oversight & Performance Logs</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Period Selector */}
                    <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                        <FilterButton active={period === 'all'} onClick={() => setPeriod('all')} label="All Time" icon={Filter} />
                        <FilterButton active={period === 'weekly'} onClick={() => setPeriod('weekly')} label="Weekly" icon={CalendarDays} />
                        <FilterButton active={period === 'monthly'} onClick={() => setPeriod('monthly')} label="Monthly" icon={CalendarRange} />
                    </div>

                    {/* View Switcher */}
                    <div className="flex items-center bg-slate-900 p-1.5 rounded-2xl shadow-xl">
                        <button
                            onClick={() => setViewMode('cards')}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                viewMode === 'cards' ? "bg-white text-slate-900 shadow-lg" : "text-white opacity-40 hover:opacity-100"
                            )}
                        >
                            <Users className="w-4 h-4" />
                            Registry
                        </button>
                        <button
                            onClick={() => setViewMode('report')}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                viewMode === 'report' ? "bg-white text-slate-900 shadow-lg" : "text-white opacity-40 hover:opacity-100"
                            )}
                        >
                            <ChartBar className="w-4 h-4" />
                            Performance
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'cards' ? (
                    <motion.div
                        key="cards"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                        {agentStats.map((agent) => (
                            <div
                                key={agent.id}
                                className="erp-card p-6 bg-white border-none shadow-xl shadow-slate-200/50 group hover:shadow-2xl transition-all relative overflow-hidden"
                            >
                                <div className={cn(
                                    "absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5",
                                    agent.role === 'admin' ? "bg-amber-500" : "bg-blue-500"
                                )} />

                                <div className="flex items-center gap-5 mb-6">
                                    <div className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner",
                                        agent.role === 'admin' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                                    )}>
                                        {agent.image ? (
                                            <img src={agent.image} alt="" className="w-full h-full object-cover rounded-2xl" />
                                        ) : (
                                            agent.name.substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-black text-slate-800 tracking-tight">{agent.name}</h3>
                                            {agent.role === 'admin' && <Shield className="w-4 h-4 text-amber-500" />}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{agent.designation || "Assigned Agent"}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Tasks</p>
                                        <p className="text-xl font-black text-slate-800">{agent.total}</p>
                                    </div>
                                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">Done</p>
                                        <p className="text-xl font-black text-emerald-700">{agent.done}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-xs font-bold text-slate-600 truncate">{agent.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {isAdmin && (
                                    <button
                                        onClick={() => onRemoveAgent(agent.id)}
                                        className="mt-6 w-full py-2.5 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Revoke Access
                                    </button>
                                )}
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="report"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="erp-card bg-white p-0 border-none shadow-2xl overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900 text-white">
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Personnel Identity</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center">Total Tasks</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center">Completed</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center">In Progress</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center">Overdue</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center">Efficiency</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {agentStats.map((agent) => (
                                        <tr key={agent.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs">
                                                        {agent.image ? <img src={agent.image} className="w-full h-full object-cover rounded-xl" /> : agent.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800">{agent.name}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{agent.designation || "standard agent"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="text-sm font-black text-slate-700">{agent.total}</span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span className="text-sm font-black text-emerald-600">{agent.done}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                                                    <span className="text-sm font-black text-blue-600">{agent.pending}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <AlertTriangle className={cn("w-3.5 h-3.5", agent.overdue > 0 ? "text-red-500" : "text-slate-200")} />
                                                    <span className={cn("text-sm font-black", agent.overdue > 0 ? "text-red-600" : "text-slate-400")}>{agent.overdue}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center lowercase">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-black text-slate-900 mb-1">
                                                        {agent.total > 0 ? Math.round((agent.done / agent.total) * 100) : 0}%
                                                    </span>
                                                    <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-600"
                                                            style={{ width: `${agent.total > 0 ? (agent.done / agent.total) * 100 : 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function FilterButton({ active, onClick, label, icon: Icon }: { active: boolean, onClick: () => void, label: string, icon: any }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                active
                    ? "bg-white text-blue-600 shadow-lg border border-blue-50"
                    : "text-slate-400 hover:text-slate-700 hover:bg-white/50"
            )}
        >
            <Icon className="w-3.5 h-3.5" />
            {label}
        </button>
    );
}
