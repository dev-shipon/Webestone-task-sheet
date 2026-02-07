"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, FolderKanban, Trash2, Save, CheckCircle2, Mail, Lock, UserPlus, Shield, Globe, Calendar, Clock, User as UserIcon, Phone, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Agent, Project } from "./TaskCard";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
// Firebase secondary app is initialized on demand inside addAgent

interface SettingsPanelProps {
    projects: Project[];
    agents: Agent[];
    onSaveConfig: (projects: Project[], agents: Agent[]) => void;
}

export default function SettingsPanel({ projects: initialProjects, agents: initialAgents, onSaveConfig }: SettingsPanelProps) {
    const [localProjects, setLocalProjects] = useState<Project[]>(initialProjects);
    const [localAgents, setLocalAgents] = useState<Agent[]>(initialAgents);

    const [newProject, setNewProject] = useState({
        name: "",
        startDate: new Date().toISOString().split('T')[0],
        lengthDays: 30,
        website: "",
        ownerName: "",
        ownerContact: ""
    });

    const [newAgent, setNewAgent] = useState({
        name: "",
        email: "",
        password: "",
        role: 'agent' as 'agent' | 'admin'
    });

    const [isSaved, setIsSaved] = useState(false);
    const [isCreatingAuth, setIsCreatingAuth] = useState(false);
    const [authStatus, setAuthStatus] = useState<string | null>(null);

    useEffect(() => {
        setLocalProjects(initialProjects);
        setLocalAgents(initialAgents);
    }, [initialProjects, initialAgents]);

    const addProject = () => {
        if (newProject.name && newProject.startDate && newProject.lengthDays && newProject.website) {
            const project: Project = {
                id: Date.now().toString(),
                ...newProject
            };
            setLocalProjects([...localProjects, project]);
            setNewProject({
                name: "",
                startDate: new Date().toISOString().split('T')[0],
                lengthDays: 30,
                website: "",
                ownerName: "",
                ownerContact: ""
            });
            setIsSaved(false);
        }
    };

    const addAgent = async () => {
        if (newAgent.name && newAgent.email && newAgent.password) {
            setIsCreatingAuth(true);
            setAuthStatus("Provisioning Access...");
            try {
                // Dynamic Import to avoid SSR issues and global init conflicts
                const { initializeApp, getApps } = await import("firebase/app");
                const { getAuth } = await import("firebase/auth");

                const firebaseConfig = {
                    apiKey: "AIzaSyCq0gxrmfaljo6j_BzEj7ABrmfwhhC4omo",
                    authDomain: "task-sheet-webestone.firebaseapp.com",
                    projectId: "task-sheet-webestone",
                    storageBucket: "task-sheet-webestone.firebasestorage.app",
                    messagingSenderId: "508848555962",
                    appId: "1:508848555962:web:1a0cfd2220945c1c2ebf83"
                };

                let secondaryApp = getApps().find(a => a.name === "Secondary");
                if (!secondaryApp) {
                    secondaryApp = initializeApp(firebaseConfig, "Secondary");
                }
                const secondaryAuth = getAuth(secondaryApp);

                // 1. Create User in Firebase Authentication
                await createUserWithEmailAndPassword(secondaryAuth, newAgent.email, newAgent.password);

                // 2. Add to Local State for Firestore Commit
                const agent: Agent = {
                    id: Date.now().toString(),
                    name: newAgent.name,
                    email: newAgent.email,
                    password: newAgent.password,
                    role: newAgent.role
                };
                setLocalAgents([...localAgents, agent]);
                setNewAgent({ name: "", email: "", password: "", role: 'agent' });
                setIsSaved(false);
                setAuthStatus("Identity Verified & Provisioned");
                setTimeout(() => setAuthStatus(null), 3000);
            } catch (error: any) {
                console.error("Auth User Creation Error:", error);
                setAuthStatus(`Auth Error: ${error.message}`);
                setTimeout(() => setAuthStatus(null), 5000);
            } finally {
                setIsCreatingAuth(false);
            }
        }
    };

    const removeAgent = (id: string) => {
        setLocalAgents(localAgents.filter(a => a.id !== id));
        setIsSaved(false);
    };

    const handleSave = () => {
        onSaveConfig(localProjects, localAgents);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const hasChanges = JSON.stringify(localProjects) !== JSON.stringify(initialProjects) ||
        JSON.stringify(localAgents) !== JSON.stringify(initialAgents);

    return (
        <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 lg:mb-8 border-b border-slate-200 pb-4 lg:pb-6">
                <div>
                    <h2 className="text-xl lg:text-3xl font-black text-slate-900 mb-1 lg:mb-2 italic">Configuration Control</h2>
                    <p className="text-slate-500 text-[10px] lg:text-sm font-bold uppercase tracking-widest">Master Identity & Resource Station</p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                    <AnimatePresence>
                        {isSaved && (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-tighter"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Auth Registry Updated
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className={cn(
                            "erp-button-primary w-full sm:w-auto px-6 lg:px-10 py-2.5 lg:py-3.5 rounded-2xl flex items-center justify-center gap-3 transition-all",
                            !hasChanges ? "opacity-50 grayscale cursor-not-allowed" : "shadow-xl shadow-blue-500/40 active:scale-95"
                        )}
                    >
                        <Save className="w-4 h-4 lg:w-5 lg:h-5" />
                        <span className="text-xs lg:text-sm font-black uppercase tracking-widest">Commit Changes</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                {/* Project Management */}
                <div className="space-y-6">
                    <div className="erp-card p-6 space-y-6 bg-white border-l-4 border-blue-600">
                        <div className="flex items-center gap-3 text-blue-600 mb-2">
                            <FolderKanban className="w-5 h-5" />
                            <h4 className="font-black uppercase tracking-widest text-xs">Init New Project (নতুন প্রজেক্ট)</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[9px] font-black uppercase text-slate-400">Project Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Nishad Agro Dashboard"
                                    value={newProject.name}
                                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                    className="erp-input py-2 text-xs font-bold"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Starting Date *
                                </label>
                                <input
                                    type="date"
                                    value={newProject.startDate}
                                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                                    className="erp-input py-2 text-xs font-bold"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Duration (Days) *
                                </label>
                                <input
                                    type="number"
                                    placeholder="e.g. 30"
                                    value={newProject.lengthDays}
                                    onChange={(e) => setNewProject({ ...newProject, lengthDays: parseInt(e.target.value) || 0 })}
                                    className="erp-input py-2 text-xs font-bold"
                                />
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> Website URL *
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://example.com"
                                    value={newProject.website}
                                    onChange={(e) => setNewProject({ ...newProject, website: e.target.value })}
                                    className="erp-input py-2 text-xs font-bold"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
                                    <UserIcon className="w-3 h-3" /> Owner Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Abir Khan"
                                    value={newProject.ownerName}
                                    onChange={(e) => setNewProject({ ...newProject, ownerName: e.target.value })}
                                    className="erp-input py-2 text-xs font-bold"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> Contact (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="+880..."
                                    value={newProject.ownerContact}
                                    onChange={(e) => setNewProject({ ...newProject, ownerContact: e.target.value })}
                                    className="erp-input py-2 text-xs font-bold"
                                />
                            </div>
                        </div>

                        <button
                            onClick={addProject}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            <Plus className="w-4 h-4" />
                            Register Project
                        </button>

                        <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                            <h4 className="font-black uppercase tracking-widest text-[9px] text-slate-400 px-1">Registered Portfolios</h4>
                            {localProjects.map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-white hover:border-blue-200 border border-slate-100 rounded-xl transition-all group">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-700 block">{p.name}</span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase">{p.startDate} • {p.lengthDays} Days</span>
                                    </div>
                                    <button
                                        onClick={() => setLocalProjects(localProjects.filter(item => item.id !== p.id))}
                                        className="text-slate-300 hover:text-red-500 transition-colors opacity-100 lg:opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Team Management */}
                <div className="space-y-6">
                    <div className="erp-card p-6 bg-white space-y-6 border-l-4 border-emerald-500">
                        <div className="flex items-center gap-3 text-emerald-600">
                            <UserPlus className="w-5 h-5" />
                            <h4 className="font-black uppercase tracking-widest text-xs">Authorize New Agent (নতুন মেম্বার)</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[9px] font-black uppercase text-slate-400">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Nishat Mazumder"
                                    value={newAgent.name}
                                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                                    className="erp-input py-2 text-xs font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-slate-400">Access Email</label>
                                <input
                                    type="email"
                                    placeholder="agent@webestone.com"
                                    value={newAgent.email}
                                    onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                                    className="erp-input py-2 text-xs font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-slate-400">Access Key</label>
                                <input
                                    type="text"
                                    placeholder="Secure Password"
                                    value={newAgent.password}
                                    onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                                    className="erp-input py-2 text-xs font-bold"
                                />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[9px] font-black uppercase text-slate-400">Permission</label>
                                <select
                                    value={newAgent.role}
                                    onChange={(e) => setNewAgent({ ...newAgent, role: e.target.value as 'agent' | 'admin' })}
                                    className="erp-input py-2 text-xs font-bold px-2"
                                >
                                    <option value="agent">Standard Agent</option>
                                    <option value="admin">Station Admin</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={addAgent}
                            disabled={isCreatingAuth}
                            className="w-full bg-slate-900 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                        >
                            {isCreatingAuth ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                            {isCreatingAuth ? "Provisioning..." : "Register Identity"}
                        </button>

                        {authStatus && (
                            <p className={cn(
                                "text-[9px] font-black uppercase tracking-widest text-center mt-2",
                                authStatus.includes("Error") ? "text-red-500" : "text-emerald-500"
                            )}>
                                {authStatus}
                            </p>
                        )}

                        <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                            <h4 className="font-black uppercase tracking-widest text-[9px] text-slate-400 px-1">Authorized Identity Registry</h4>
                            {localAgents.map((a) => (
                                <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group hover:border-blue-200 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm",
                                            a.role === 'admin' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                                        )}>
                                            {a.name.substring(0, 1).toUpperCase()}
                                        </div>
                                        <div>
                                            <h5 className="text-[10px] font-black text-slate-800">{a.name}</h5>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{a.role} access</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeAgent(a.id)}
                                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
