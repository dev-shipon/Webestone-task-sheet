"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import TaskCard, { Task, Agent, Project } from "@/components/TaskCard";
import MissionControl from "@/components/MissionControl";
import SettingsPanel from "@/components/SettingsPanel";
import AgentPortal from "@/components/AgentPortal";
import LoginPage from "@/components/LoginPage";
import NoticeBoard, { Notice } from "@/components/NoticeBoard";
import TeamSection from "@/components/TeamSection";
import ProjectSection from "@/components/ProjectSection";
import ProfilePanel from "@/components/ProfilePanel";
import { Search, Plus, Filter, CalendarDays, CalendarRange, LogOut, ShieldCheck, User, Download, FileSpreadsheet, Bell, LayoutDashboard, Settings, Users, ChevronRight, Briefcase, Rocket, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { db, auth } from "@/lib/firebase";
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    setDoc,
    query,
    orderBy,
    serverTimestamp,
    getDocs,
    getDoc
} from "firebase/firestore";
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser
} from "firebase/auth";

// Initial Configuration Node
const initialAgents: Agent[] = [
    { id: '1', name: 'Shipon', email: 'shipontalukdar.webestone@gmail.com', password: 'admin123', role: 'admin', designation: 'Station Admin', phone: '+880123456789' },
    { id: '2', name: 'Sarah', email: 'sarah@webestone.com', password: 'agent', role: 'agent', designation: 'Web Developer' },
    { id: '3', name: 'Surove', email: 'surove@webestone.com', password: 'agent', role: 'agent', designation: 'SEO Specialist' },
];

const initialProjects: Project[] = [
    { id: '1', name: "WeBestOne", startDate: "2026-01-01", lengthDays: 365, website: "https://webestone.com", ownerName: "Shipon", ownerContact: "+880123456789" },
    { id: '2', name: "Fast IT", startDate: "2026-01-15", lengthDays: 180, website: "https://fastit.com" },
    { id: '3', name: "Nishad Agro", startDate: "2026-02-01", lengthDays: 90, website: "https://nishadagro.com" },
];

const initialTasks: Task[] = [
    {
        id: '1',
        title: "Website UI Design and Prototyping",
        project: "WeBestOne",
        agent: "Shipon",
        status: "In Progress",
        deadline: "2026-02-01",
        remarks: "Priority task for client presentation",
        submissionLinks: [],
        submissionDate: ""
    },
    {
        id: '2',
        title: "Facebook Ads Campaign Management",
        project: "Digital Marketing",
        agent: "Sarah",
        status: "Done",
        deadline: "2026-02-10",
        remarks: "Check pixel integration",
        submissionLinks: ["https://ads.facebook.com/report/123"],
        submissionDate: "2026-02-07"
    },
];

const initialNotices: Notice[] = [
    { id: '1', type: 'urgent', content: 'All agents must update their submission links by tonight.', date: '2026-02-07' },
    { id: '2', type: 'info', content: 'New project "Nishad Agro" has been added to the station.', date: '2026-02-06' }
];

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<Agent | null>(null);
    const [authError, setAuthError] = useState("");

    const [activeTab, setActiveTab] = useState("portal");
    const [tasks, setTasks] = useState<Task[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [period, setPeriod] = useState<'all' | 'weekly' | 'monthly'>('all');

    const [projects, setProjects] = useState<Project[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [notices, setNotices] = useState<Notice[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isAuthChecking, setIsAuthChecking] = useState(true);

    // Firebase Auth State Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, we'll wait for agents list to find the profile
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
                setCurrentUser(null);
            }
            setIsAuthChecking(false);
        });
        return () => unsubscribe();
    }, []);

    // Fetch Profile once logged in and agents are loaded
    useEffect(() => {
        const syncProfile = async () => {
            if (isLoggedIn && agents.length > 0 && auth.currentUser) {
                const userProfile = agents.find(a => a.email === auth.currentUser?.email);
                if (userProfile) {
                    setCurrentUser(userProfile);
                } else {
                    // Auto-create profile for ANY authenticated user if missing in Firestore
                    const newAgent: Agent = {
                        id: agents.find(a => a.email === auth.currentUser?.email)?.id || `agent_${Date.now()}`,
                        name: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Unknown Agent',
                        email: auth.currentUser.email || '',
                        password: '***',
                        role: auth.currentUser.email === 'shipontalukdar.webestone@gmail.com' ? 'admin' : 'agent',
                        designation: 'Field Agent'
                    };
                    await setDoc(doc(db, "agents", newAgent.id), newAgent);
                    setCurrentUser(newAgent);
                }
            }
        };
        syncProfile();
    }, [isLoggedIn, agents]);

    // Firebase Real-time Sync
    // Firebase Real-time Sync
    useEffect(() => {
        const unsubTasks = onSnapshot(collection(db, "tasks"), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task));
            setTasks(data);
            if (!isLoaded) setIsLoaded(true);
        });

        const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Project));
            setProjects(data);
        });

        const unsubAgents = onSnapshot(collection(db, "agents"), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Agent));
            setAgents(data);
        });

        const unsubNotices = onSnapshot(query(collection(db, "notices"), orderBy("date", "desc")), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Notice));
            setNotices(data);
        });

        // Seeding initial data - ONLY ONCE
        const seedData = async () => {
            try {
                // Check a special flag to prevent re-seeding after deletion
                const systemRef = doc(db, "system", "setup");
                const systemSnap = await getDoc(systemRef);

                if (!systemSnap.exists()) {
                    console.log("Initialize System: Seeding default data...");

                    // 1. Seed Tasks
                    for (const t of initialTasks) {
                        const { id, ...data } = t;
                        await addDoc(collection(db, "tasks"), data);
                    }

                    // 2. Seed Projects
                    for (const p of initialProjects) {
                        const { id, ...data } = p;
                        await addDoc(collection(db, "projects"), data);
                    }

                    // 3. Seed Agents
                    for (const a of initialAgents) {
                        await setDoc(doc(db, "agents", a.id), a);
                    }

                    // 4. Seed Notices
                    for (const n of initialNotices) {
                        const { id, ...data } = n;
                        await addDoc(collection(db, "notices"), data);
                    }

                    // Mark setup as complete
                    await setDoc(systemRef, { initialized: true, date: new Date().toISOString() });
                }
            } catch (err) {
                console.error("Seeding Error:", err);
            }
        };
        seedData();

        return () => {
            unsubTasks();
            unsubProjects();
            unsubAgents();
            unsubNotices();
        };
    }, []);

    const handleLogin = async (email: string, pass: string) => {
        try {
            setAuthError("");
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (error: any) {
            console.error("Login Error:", error);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                setAuthError("Identity mismatch. Security protocol engaged.");
            } else {
                setAuthError("Access denied. System error during uplink.");
            }
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setActiveTab("portal");
    };

    const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
        try {
            const taskRef = doc(db, "tasks", taskId);
            await updateDoc(taskRef, updates);
        } catch (error) {
            console.error("Firestore Update Error:", error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm("Are you sure you want to permanently delete this task artifact?")) return;
        try {
            await deleteDoc(doc(db, "tasks", taskId));
            // No need to manually update state, onSnapshot will handle it.
        } catch (error: any) {
            console.error("Firestore Delete Error:", error);
            alert(`Delete failed: ${error.message}. Check your Firebase security rules.`);
        }
    };

    const [systemLogo, setSystemLogo] = useState<string>("/webestone-logo.svg");

    // Fetch System Branding
    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const docSnap = await getDoc(doc(db, "system", "branding"));
                if (docSnap.exists() && docSnap.data().logo) {
                    setSystemLogo(docSnap.data().logo);
                }
            } catch (error) {
                console.error("Branding Sync Error:", error);
            }
        };
        fetchBranding();
    }, []);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 35 * 1024) {
            alert("Logo too large! Max allowed size is 35KB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            setSystemLogo(base64String);
            try {
                await setDoc(doc(db, "system", "branding"), { logo: base64String }, { merge: true });
                console.log("System Logo Updated");
            } catch (err) {
                console.error("Logo Save Error:", err);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleUpdateProfile = async (updates: Partial<Agent>) => {
        if (!currentUser) return;
        try {
            await updateDoc(doc(db, "agents", currentUser.id), updates);
            setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
        } catch (error) {
            console.error("Firestore Profile Update Error:", error);
        }
    };

    const filteredTasks = useMemo(() => {
        let filtered = tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.project.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });

        if (period === 'all') return filtered;

        const now = new Date();
        const startOfPeriod = new Date();
        if (period === 'weekly') startOfPeriod.setDate(now.getDate() - 7);
        else if (period === 'monthly') startOfPeriod.setMonth(now.getMonth() - 1);

        return filtered.filter(t => new Date(t.deadline) >= startOfPeriod);
    }, [tasks, searchQuery, period]);

    const exportMonthlyTasks = () => {
        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);

        const monthlyTasks = tasks.filter(t => new Date(t.deadline) >= oneMonthAgo);

        const headers = ["ID", "Title", "Project", "Agent", "Deadline", "Status", "Remarks", "Submission Links", "Submission Date"];
        const csvRows = [
            headers.join(","),
            ...monthlyTasks.map(t => [
                t.id,
                `"${(t.title || '').replace(/"/g, '""')}"`,
                `"${(t.project || '').replace(/"/g, '""')}"`,
                t.agent,
                t.deadline,
                t.status,
                `"${(t.remarks || '').replace(/"/g, '""')}"`,
                `"${(t.submissionLinks || []).join(" | ")}"`,
                t.submissionDate
            ].join(","))
        ];

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `webestone_monthly_report_${now.toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isAuthChecking) {
        return <LoadingOverlay message="Initializing Neural Uplink..." />;
    }

    // If logged in but profile is still loading, show sync state
    if (isLoggedIn && !currentUser) {
        return <LoadingOverlay message="Synchronizing Identity Profile..." />;
    }

    if (!isLoggedIn) {
        return <LoginPage onLogin={handleLogin} error={authError} />;
    }

    const isAdmin = currentUser?.role === 'admin';
    const pendingReviewCount = tasks.filter(t => t.status === 'Waiting for Review').length;

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-['Inter']">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={currentUser} reviewCount={pendingReviewCount} onLogout={handleLogout} />

            <section className="flex-1 lg:ml-64 min-h-screen flex flex-col">
                {/* Top Header */}
                <header className="h-16 lg:h-24 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center gap-3 lg:gap-6 flex-1">
                        <h1 className="text-base lg:text-xl font-black text-slate-800 flex items-center gap-3 whitespace-nowrap italic">
                            <div className="relative group cursor-pointer w-10 h-10 shrink-0" onClick={() => document.getElementById('logo-upload-header')?.click()}>
                                <input
                                    id="logo-upload-header"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                />
                                <img
                                    src={systemLogo || "/webestone-logo.svg"}
                                    alt="System Logo"
                                    className="w-full h-full object-contain rounded hover:opacity-80 transition-opacity bg-white border border-slate-100"
                                    title="Click to Upload Logo"
                                    onError={(e) => { e.currentTarget.src = "/webestone-logo.svg"; }}
                                />
                                <div className="absolute inset-0 bg-black/20 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <span className="text-white text-[8px] font-bold">EDIT</span>
                                </div>
                            </div>
                            {activeTab === 'portal' ? 'My Portal' :
                                activeTab === 'dashboard' ? 'Task Overview' :
                                    activeTab === 'projects' ? 'Operational Resource' :
                                        activeTab === 'users' ? 'Personnel Registry' :
                                            activeTab === 'admin' ? 'Task Creation' :
                                                activeTab === 'profile' ? 'Profile Control' :
                                                    activeTab === 'notices' ? 'Notice Board' :
                                                        activeTab === 'reviews' ? 'Review Criticals' :
                                                            'Configuration'}
                        </h1>

                        <div className="relative w-full max-w-[150px] lg:max-w-md ml-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search resources..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs outline-none focus:border-blue-500 transition-all font-bold placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-6">
                        <div
                            onClick={() => setActiveTab('profile')}
                            className="hidden sm:flex flex-col items-end cursor-pointer group"
                        >
                            <div className="flex items-center gap-2">
                                <p className="text-xs font-black text-slate-800 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">{currentUser?.name}</p>
                                {isAdmin ? (
                                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                                ) : (
                                    <User className="w-4 h-4 text-emerald-500" />
                                )}
                            </div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{currentUser?.role} ID: {currentUser?.id}</p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-inner border border-slate-100"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Dynamic Content */}
                <div className="p-4 lg:p-10 flex-1">
                    <AnimatePresence mode="wait">
                        {activeTab === "portal" && (
                            <motion.div
                                key="portal"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="space-y-8"
                            >
                                <div className="erp-card p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none shadow-lg mb-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Bell className="w-5 h-5 animate-swing" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Latest Directive</p>
                                                <p className="text-xs font-bold leading-tight truncate max-w-[200px] md:max-w-md">
                                                    {notices[0]?.content || "Station operational. Standing by for directives."}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('notices')}
                                            className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                        >
                                            View All
                                        </button>
                                    </div>
                                </div>
                                <AgentPortal
                                    agentName={currentUser?.name || ""}
                                    tasks={tasks}
                                    onUpdateTask={handleUpdateTask}
                                />
                            </motion.div>
                        )}

                        {activeTab === "notices" && (
                            <motion.div key="notices" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <NoticeBoard
                                    isAdmin={isAdmin}
                                    notices={notices}
                                    onAddNotice={async (noticeData) => {
                                        try {
                                            // Remove the local ID from noticeBoard before adding to Firestore 
                                            // to let Firestore generate its own doc ID
                                            const { id, ...data } = noticeData;
                                            await addDoc(collection(db, "notices"), {
                                                ...data,
                                                createdAt: serverTimestamp()
                                            });
                                        } catch (error) {
                                            console.error("Notice Broadcast Error:", error);
                                            alert("Notice transmission failed. Check station uplink.");
                                        }
                                    }}
                                    onRemoveNotice={async (id) => {
                                        try {
                                            await deleteDoc(doc(db, "notices", id));
                                        } catch (error) {
                                            console.error("Notice Deletion Error:", error);
                                        }
                                    }}
                                />
                            </motion.div>
                        )}

                        {activeTab === "dashboard" && (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-10"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-6 w-2 bg-slate-900 rounded-full" />
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Task Overview</h2>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Live Mission Monitoring</p>
                                        </div>
                                        <div className="hidden lg:flex items-center bg-slate-200/50 p-1.5 rounded-2xl ml-8">
                                            <FilterButton active={period === 'all'} onClick={() => setPeriod('all')} label="All Tasks" icon={Filter} />
                                            <FilterButton active={period === 'weekly'} onClick={() => setPeriod('weekly')} label="Weekly" icon={CalendarDays} />
                                            <FilterButton active={period === 'monthly'} onClick={() => setPeriod('monthly')} label="Monthly" icon={CalendarRange} />
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={exportMonthlyTasks}
                                                className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all shadow-xl shadow-emerald-500/5 active:scale-95 group"
                                            >
                                                <FileSpreadsheet className="w-4 h-4" />
                                                Monthly Report
                                            </button>
                                            <button
                                                onClick={() => setActiveTab("admin")}
                                                className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 active:scale-95 group"
                                            >
                                                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                                Add New Task
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="lg:hidden flex items-center bg-slate-200/50 p-1.5 rounded-2xl w-fit">
                                    <FilterButton active={period === 'all'} onClick={() => setPeriod('all')} label="All Tasks" icon={Filter} />
                                    <FilterButton active={period === 'weekly'} onClick={() => setPeriod('weekly')} label="Weekly" icon={CalendarDays} />
                                    <FilterButton active={period === 'monthly'} onClick={() => setPeriod('monthly')} label="Monthly" icon={CalendarRange} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                                    {filteredTasks.length > 0 ? (
                                        filteredTasks.map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                onUpdate={handleUpdateTask}
                                                onDelete={handleDeleteTask}
                                                isAdminView={isAdmin}
                                                agents={agents}
                                                currentUserId={currentUser?.id || ""}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-full py-32 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center shadow-inner">
                                            <h3 className="text-slate-400 font-black uppercase tracking-widest text-sm">Station frequency clear.</h3>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "profile" && (
                            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <ProfilePanel user={currentUser!} onUpdate={handleUpdateProfile} />
                            </motion.div>
                        )}

                        {activeTab === "reviews" && isAdmin && (
                            <motion.div
                                key="reviews"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-10"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-6 w-2 bg-indigo-600 rounded-full" />
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Pending Approval Node</h2>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Awaiting Tactical Verification</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                                    {tasks.filter(t => t.status === 'Waiting for Review').length > 0 ? (
                                        tasks.filter(t => t.status === 'Waiting for Review').map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                onUpdate={handleUpdateTask}
                                                onDelete={handleDeleteTask}
                                                isAdminView={isAdmin}
                                                agents={agents}
                                                currentUserId={currentUser?.id || ""}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-full py-32 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center shadow-inner">
                                            <CheckCircle2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                            <h3 className="text-slate-400 font-black uppercase tracking-widest text-sm">All deployments verified.</h3>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "projects" && isAdmin && (
                            <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <ProjectSection
                                    projects={projects}
                                    tasks={tasks}
                                    isAdmin={isAdmin}
                                    onRemoveProject={async (projectId) => {
                                        if (confirm("Revoke project authorization?")) {
                                            await deleteDoc(doc(db, "projects", projectId));
                                        }
                                    }}
                                />
                            </motion.div>
                        )}

                        {activeTab === "users" && isAdmin && (
                            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <TeamSection
                                    agents={agents}
                                    tasks={tasks}
                                    isAdmin={isAdmin}
                                    onRemoveAgent={async (id) => {
                                        if (confirm("Revoke personnel access?")) {
                                            await deleteDoc(doc(db, "agents", id));
                                        }
                                    }}
                                />
                            </motion.div>
                        )}

                        {activeTab === "admin" && isAdmin && (
                            <motion.div
                                key="admin"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <MissionControl
                                    onTaskDeploy={async (newTask) => {
                                        // 1. Create Task in Firestore
                                        await addDoc(collection(db, "tasks"), newTask);

                                        // 2. Send Email Notification
                                        const assignedAgent = agents.find(a => a.name === newTask.agent);
                                        if (assignedAgent && assignedAgent.email) {
                                            try {
                                                await fetch('/api/send-email', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        to: assignedAgent.email,
                                                        subject: `New Task Assigned: ${newTask.title}`,
                                                        html: `
                                                            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                                                                <div style="background-color: #2563eb; padding: 20px; text-align: center;">
                                                                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Mission Assigned</h1>
                                                                </div>
                                                                <div style="padding: 30px;">
                                                                    <p style="font-size: 16px; line-height: 1.5;">Hello <strong>${assignedAgent.name}</strong>,</p>
                                                                    <p style="font-size: 16px; line-height: 1.5;">You have been assigned a new task on the Webestone ERP Station.</p>
                                                                    
                                                                    <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
                                                                        <p style="margin: 5px 0;"><strong>Task:</strong> ${newTask.title}</p>
                                                                        <p style="margin: 5px 0;"><strong>Project:</strong> ${newTask.project}</p>
                                                                        <p style="margin: 5px 0;"><strong>Deadline:</strong> ${newTask.deadline}</p>
                                                                        <p style="margin: 5px 0;"><strong>Priority/Status:</strong> ${newTask.status}</p>
                                                                    </div>
                                                                    
                                                                    <p style="font-size: 14px; color: #666;">Please login to your portal to review the details and start working.</p>
                                                                    
                                                                    <div style="text-align: center; margin-top: 30px;">
                                                                        <a href="https://task-sheet-webestone.vercel.app/" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Open Portal</a>
                                                                    </div>
                                                                </div>
                                                                <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
                                                                    <p>Webestone ERP Station • Automated Notification System</p>
                                                                </div>
                                                            </div>
                                                        `
                                                    })
                                                });
                                                console.log(`Notification sent to ${assignedAgent.email}`);
                                            } catch (emailError) {
                                                console.error("Failed to send notification email:", emailError);
                                            }
                                        }

                                        setActiveTab("dashboard");
                                    }}
                                    projects={projects}
                                    agents={agents.map(a => a.name)}
                                />
                            </motion.div>
                        )}

                        {activeTab === "settings" && isAdmin && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <SettingsPanel
                                    projects={projects}
                                    agents={agents}
                                    onSaveConfig={async (newProjects, newAgents) => {
                                        try {
                                            // 1. Handle Project Sync (Deletions & Updates)
                                            const projectIdsToDelete = projects
                                                .filter(p => !newProjects.find(np => np.id === p.id))
                                                .map(p => p.id);

                                            for (const id of projectIdsToDelete) {
                                                await deleteDoc(doc(db, "projects", id));
                                            }

                                            for (const p of newProjects) {
                                                if (p.id.length > 15) { // Existing Firestore ID
                                                    await setDoc(doc(db, "projects", p.id), p);
                                                } else { // New project (numeric ID from local state)
                                                    const { id, ...data } = p;
                                                    await addDoc(collection(db, "projects"), data);
                                                }
                                            }

                                            // 2. Handle Agent Sync (Deletions & Updates)
                                            const agentIdsToDelete = agents
                                                .filter(a => !newAgents.find(na => na.id === a.id))
                                                .map(a => a.id);

                                            for (const id of agentIdsToDelete) {
                                                // Security: Don't let admin delete themselves by accident easily
                                                if (id !== currentUser?.id) {
                                                    await deleteDoc(doc(db, "agents", id));
                                                }
                                            }

                                            for (const a of newAgents) {
                                                await setDoc(doc(db, "agents", a.id), a);
                                            }

                                        } catch (error) {
                                            console.error("Registry Sync Error:", error);
                                            alert("Failed to commit changes to the global registry.");
                                        }
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <footer className="p-8 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-auto">
                    <p>© 2026 WeBestOne ERP Station.</p>
                    <div className="flex gap-8">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Uplink Stable</span>
                    </div>
                </footer>
            </section>
        </main>
    );
}

function LoadingOverlay({ message }: { message: string }) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-['Inter'] p-6">
            <div className="flex flex-col items-center gap-6 text-center">
                <div className="relative">
                    <Rocket className="w-12 h-12 text-blue-600 animate-bounce" />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-100 rounded-full blur-sm" />
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{message}</p>
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest italic">Verifying node authorization with station network</p>
                </div>

                <button
                    onClick={() => signOut(auth)}
                    className="mt-8 px-6 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:border-red-100 transition-all flex items-center gap-2 shadow-sm"
                >
                    <LogOut className="w-3 h-3" />
                    Abort Connection
                </button>
            </div>
        </div>
    );
}

function FilterButton({ active, onClick, label, icon: Icon }: { active: boolean, onClick: () => void, label: string, icon: any }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                active
                    ? "bg-white text-blue-600 shadow-xl shadow-slate-200"
                    : "text-slate-400 hover:text-slate-700 hover:bg-white/50"
            )}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
}
