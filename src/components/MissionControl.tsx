"use client";

import { motion } from "framer-motion";
import { Send, Briefcase, User, Info, CheckCircle, Calendar, MessageSquare, Link as LinkIcon, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Task, TaskStatus, Project } from "./TaskCard";
import { cn } from "@/lib/utils";

const statuses: TaskStatus[] = ["Not Started", "In Progress", "Done", "Action Needed"];

export default function MissionControl({ onTaskDeploy, projects, agents }: {
    onTaskDeploy: (task: Task) => void,
    projects: Project[],
    agents: string[]
}) {
    const [formData, setFormData] = useState<Omit<Task, 'id'>>({
        title: "",
        project: projects[0]?.name || "",
        agent: agents[0] || "",
        deadline: "",
        status: statuses[0],
        remarks: "",
        submissionLink: "",
        submissionDate: "",
    });

    useEffect(() => {
        if (projects.length > 0 && !projects.find(p => p.name === formData.project)) {
            setFormData(prev => ({ ...prev, project: projects[0].name }));
        }
        if (agents.length > 0 && !agents.includes(formData.agent)) {
            setFormData(prev => ({ ...prev, agent: agents[0] }));
        }
    }, [projects, agents, formData.project, formData.agent]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.deadline) return;
        onTaskDeploy({ ...formData, id: Date.now().toString() });

        // Reset form
        setFormData({
            title: "",
            project: projects[0]?.name || "",
            agent: agents[0] || "",
            deadline: "",
            status: statuses[0],
            remarks: "",
            submissionLink: "",
            submissionDate: "",
        });
    };

    return (
        <div className="max-w-5xl mx-auto pb-10">
            <div className="mb-6 lg:mb-8 text-center sm:text-left">
                <h2 className="text-xl lg:text-3xl font-black text-slate-800 mb-1 lg:mb-2 italic uppercase">Deploy New Task</h2>
                <p className="text-slate-500 text-[10px] lg:text-sm font-bold uppercase tracking-widest px-1">Assignment Hub v2.1</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-6 lg:gap-8">
                <div className="flex-1 space-y-4 lg:space-y-6">
                    <div className="erp-card p-6 lg:p-8 space-y-4 lg:space-y-6 bg-white border-none shadow-2xl">
                        {/* Task Title */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5" />
                                Mission Objective / কাজের নাম *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Build API Endpoints for Billing"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="erp-input text-sm lg:text-base py-3 lg:py-3.5 font-bold"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                            {/* Project Selection */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sector / প্রজেক্ট *</label>
                                <select
                                    value={formData.project}
                                    onChange={e => setFormData({ ...formData, project: e.target.value })}
                                    className="erp-input px-3 py-3 text-xs lg:text-sm font-bold"
                                >
                                    {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                </select>
                            </div>

                            {/* Agent Selection */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deploy To / এজেন্ট *</label>
                                <select
                                    value={formData.agent}
                                    onChange={e => setFormData({ ...formData, agent: e.target.value })}
                                    className="erp-input px-3 py-3 text-xs lg:text-sm font-bold"
                                >
                                    {agents.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                            </div>

                            {/* Deadline */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Deadline / শেষ সময় *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.deadline}
                                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                    className="erp-input py-3 text-xs lg:text-sm font-bold"
                                />
                            </div>

                            {/* Initial Status */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Initialization Status</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                                    className="erp-input px-3 py-3 text-xs lg:text-sm font-bold"
                                >
                                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Remarks */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5" />
                                Directives / বিশেষ নির্দেশাবলী
                            </label>
                            <textarea
                                placeholder="State the technical requirements or notes..."
                                value={formData.remarks}
                                onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                                className="erp-input min-h-[100px] lg:min-h-[120px] py-3 resize-none text-xs lg:text-sm font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Submission & Info */}
                <div className="w-full xl:w-80 space-y-4 lg:space-y-6">
                    <div className="erp-card p-6 bg-slate-900 border-none shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                            <Send className="w-16 h-16 text-white" />
                        </div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Auth Control</h3>
                        <button
                            type="submit"
                            className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 text-xs active:scale-95"
                        >
                            Deploy Task
                        </button>
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest text-center mt-6">Secure Transaction Protocol v4.0</p>
                    </div>

                    <div className="erp-card p-6 border-2 border-dashed border-slate-200 bg-white space-y-4">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <Info className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Protocol Info</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tighter italic">
                            "Once deployed, the agent will receive an encrypted notification and the task will be synced across all nodes in the workspace."
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
