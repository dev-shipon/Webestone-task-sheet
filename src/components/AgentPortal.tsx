"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Briefcase, CheckCircle, Clock, AlertTriangle, CalendarDays, CalendarRange, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import TaskCard, { Task, TaskStatus, Agent } from "./TaskCard";
import { cn } from "@/lib/utils";

interface AgentPortalProps {
    agentName: string;
    tasks: Task[];
    onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
    currentUserId: string;
    agents: Agent[];
}

type FilterPeriod = 'all' | 'weekly' | 'monthly';

export default function AgentPortal({ agentName, tasks, onUpdateTask, currentUserId, agents }: AgentPortalProps) {
    const [period, setPeriod] = useState<FilterPeriod>('all');

    const agentTasks = useMemo(() => {
        let filtered = tasks.filter(t => t.agent === agentName);

        if (period === 'all') return filtered;

        const now = new Date();
        const startOfPeriod = new Date();

        if (period === 'weekly') {
            startOfPeriod.setDate(now.getDate() - 7);
        } else if (period === 'monthly') {
            startOfPeriod.setMonth(now.getMonth() - 1);
        }

        return filtered.filter(t => new Date(t.deadline) >= startOfPeriod);
    }, [tasks, agentName, period]);

    const stats = {
        total: agentTasks.length,
        done: agentTasks.filter(t => t.status === 'Done').length,
        pending: agentTasks.filter(t => t.status === 'In Progress' || t.status === 'Not Started').length,
        overdue: agentTasks.filter(t =>
            t.status !== 'Done' && new Date(t.deadline) < new Date()
        ).length
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Portal Header */}
            <div className="erp-card p-6 lg:p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl shadow-blue-500/20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                            <User className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-4 h-4 text-blue-200" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Verified Agent Portal</span>
                            </div>
                            <h2 className="text-2xl lg:text-4xl font-black tracking-tight">{agentName}'s Workspace</h2>
                            <p className="text-blue-100 text-xs lg:text-sm font-medium mt-1 opacity-80">Welcome back, Agent. Your deployments are synced.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
                        <StatBox label="Missions" value={stats.total} icon={Briefcase} />
                        <StatBox label="Completed" value={stats.done} icon={CheckCircle} color="text-emerald-400" />
                        <StatBox label="Pending" value={stats.pending} icon={Clock} color="text-amber-400" />
                        <StatBox label="Overdue" value={stats.overdue} icon={AlertTriangle} color="text-red-400" />
                    </div>
                </div>
            </div>

            {/* Task Grid */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-1.5 bg-blue-600 rounded-full" />
                        <h3 className="text-base lg:text-lg font-black text-slate-800 uppercase tracking-widest">Active Tasks</h3>
                    </div>

                    <div className="flex items-center bg-slate-100 p-1 rounded-xl w-fit">
                        <FilterButton
                            active={period === 'all'}
                            onClick={() => setPeriod('all')}
                            label="All Time"
                            icon={Filter}
                        />
                        <FilterButton
                            active={period === 'weekly'}
                            onClick={() => setPeriod('weekly')}
                            label="Weekly"
                            icon={CalendarDays}
                        />
                        <FilterButton
                            active={period === 'monthly'}
                            onClick={() => setPeriod('monthly')}
                            label="Monthly"
                            icon={CalendarRange}
                        />
                    </div>
                </div>

                {agentTasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {agentTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onUpdate={onUpdateTask}
                                isAdminView={false}
                                currentUserId={currentUserId}
                                agents={agents}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="erp-card py-20 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-center flex flex-col items-center flex-1">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Shield className="w-8 h-8 text-slate-200" />
                        </div>
                        <h4 className="text-slate-400 font-bold mb-1">No missions found for this period.</h4>
                        <p className="text-slate-400 text-xs">Try adjusting your filters or await new directives.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatBox({ label, value, icon: Icon, color = "text-white" }: { label: string, value: number, icon: any, color?: string }) {
    return (
        <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-3 lg:p-4 rounded-xl flex flex-col items-center justify-center min-w-[100px]">
            <Icon className={cn("w-4 h-4 lg:w-5 lg:h-5 mb-1", color)} />
            <span className="text-lg lg:text-2xl font-black">{value}</span>
            <span className="text-[8px] lg:text-[10px] font-bold uppercase tracking-widest opacity-60 text-center">{label}</span>
        </div>
    );
}

function FilterButton({ active, onClick, label, icon: Icon }: { active: boolean, onClick: () => void, label: string, icon: any }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                active
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
        >
            <Icon className="w-3.5 h-3.5" />
            {label}
        </button>
    );
}
