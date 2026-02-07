"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Rocket, Users, Settings, LogOut, ChevronRight, PieChart, Briefcase, X, Menu, User, Bell, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

import { Agent } from "./TaskCard";

const menuItems = [
    { icon: User, label: "My Portal", id: "portal" },
    { icon: LayoutDashboard, label: "Task Overview", id: "dashboard" },
    { icon: Bell, label: "Notice Board", id: "notices" },
    { icon: ShieldAlert, label: "Review Center", id: "reviews", adminOnly: true },
    { icon: Briefcase, label: "Projects", id: "projects", adminOnly: true },
    { icon: Users, label: "Team Members", id: "users", adminOnly: true },
    { icon: Rocket, label: "Manage Tasks", id: "admin", adminOnly: true },
    { icon: Settings, label: "Manage Agency", id: "settings", adminOnly: true },
];

export default function Sidebar({ activeTab, setActiveTab, user, reviewCount = 0, onLogout }: {
    activeTab: string,
    setActiveTab: (id: string) => void,
    user: Agent | null,
    reviewCount?: number,
    onLogout: () => void
}) {
    const isAdmin = user?.role === 'admin';
    const filteredMenu = menuItems.filter(item => !item.adminOnly || isAdmin);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const SidebarContent = () => (
        <>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Rocket className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-black text-xl tracking-tighter text-slate-800 dark:text-white">Webestone</span>
                </div>
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="lg:hidden p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-lg"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
                {filteredMenu.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setActiveTab(item.id);
                            setIsMobileOpen(false);
                        }}
                        className={cn(
                            "sidebar-item w-full",
                            activeTab === item.id && "active"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm">{item.label}</span>
                        {item.id === 'reviews' && reviewCount > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                                {reviewCount}
                            </span>
                        )}
                        {activeTab === item.id && (
                            <ChevronRight className="w-4 h-4 ml-auto" />
                        )}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div
                    onClick={() => {
                        setActiveTab('profile');
                        setIsMobileOpen(false);
                    }}
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all cursor-pointer",
                        activeTab === 'profile' ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"
                    )}
                >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                        {user?.image ? (
                            <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-4 h-4" />
                        )}
                    </div>
                    <div className="flex flex-col items-start overflow-hidden">
                        <span className="text-xs font-black truncate w-full">{user?.name}</span>
                        <span className="text-[9px] font-bold uppercase tracking-tighter opacity-50 truncate w-full">{user?.designation || user?.role}</span>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-bold"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm">Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 hidden lg:flex flex-col">
                <SidebarContent />
            </aside>

            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl z-[60] flex items-center justify-center active:scale-90 transition-transform"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 w-[280px] bg-white dark:bg-slate-900 z-[80] lg:hidden flex flex-col shadow-2xl"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
