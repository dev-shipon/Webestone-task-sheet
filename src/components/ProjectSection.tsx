"use client";

import { motion } from "framer-motion";
import { FolderKanban, Globe, Trash2, Calendar, Clock, User as UserIcon, Phone, ExternalLink } from "lucide-react";
import { Project } from "./TaskCard";
import { cn } from "@/lib/utils";

interface ProjectSectionProps {
    projects: Project[];
    tasks: any[];
    onRemoveProject: (projectId: string) => void;
    isAdmin: boolean;
}

export default function ProjectSection({ projects, tasks, onRemoveProject, isAdmin }: ProjectSectionProps) {
    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-black text-slate-800 italic uppercase">Project Sectors</h2>
                    <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-1">Operational Resource Groups</p>
                </div>
                <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2">
                    <FolderKanban className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">{projects.length} Active Portfolios</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, idx) => {
                    const projectTasks = tasks.filter(t => t.project === project.name);
                    const completedTasks = projectTasks.filter(t => t.status === 'Done').length;
                    const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0;

                    return (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="erp-card p-6 bg-white border-none shadow-xl shadow-slate-200/50 group overflow-hidden relative"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                                    <Globe className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={project.website.startsWith('http') ? project.website : `https://${project.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    {isAdmin && (
                                        <button
                                            onClick={() => onRemoveProject(project.id)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-slate-800 mb-1 tracking-tight truncate pr-10">{project.name}</h3>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-[8px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">Live Portfolio</span>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{project.startDate}</span>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Started
                                        </p>
                                        <p className="text-[10px] font-black text-slate-700">{project.startDate}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 justify-end">
                                            <Clock className="w-3 h-3" /> Length
                                        </p>
                                        <p className="text-[10px] font-black text-slate-700">{project.lengthDays} Days</p>
                                    </div>
                                </div>

                                <div className="space-y-2 pb-2">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-400 font-bold">Execution</span>
                                        <span className="text-blue-600 italic">{Math.round(progress)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                                        />
                                    </div>
                                </div>

                                {(project.ownerName || project.ownerContact) && (
                                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                                        {project.ownerName && (
                                            <div className="flex items-center gap-2">
                                                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-600">{project.ownerName}</span>
                                            </div>
                                        )}
                                        {project.ownerContact && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-600 italic">{project.ownerContact}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="bg-slate-900 p-3 rounded-xl shadow-lg shadow-black/5">
                                        <p className="text-[8px] font-black text-slate-500 uppercase">Missions</p>
                                        <p className="text-lg font-black text-white leading-none mt-1">{projectTasks.length}</p>
                                    </div>
                                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                        <p className="text-[8px] font-black text-emerald-400 uppercase">Success</p>
                                        <p className="text-lg font-black text-emerald-700 leading-none mt-1">{completedTasks}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex -space-x-3 overflow-hidden border-t border-slate-50 pt-4">
                                {Array.from(new Set(projectTasks.map(t => t.agent))).slice(0, 4).map((agent, i) => (
                                    <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-blue-100 border border-blue-200 flex items-center justify-center text-[8px] font-black text-blue-700 uppercase">
                                        {agent.substring(0, 2)}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
