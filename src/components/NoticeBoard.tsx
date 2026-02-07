"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, X, Bell, Info, AlertTriangle, Send, History } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Notice {
    id: string;
    type: 'urgent' | 'info' | 'update';
    content: string;
    date: string;
}

interface NoticeBoardProps {
    isAdmin?: boolean;
    notices: Notice[];
    onAddNotice: (notice: Notice) => void;
    onRemoveNotice: (id: string) => void;
}

export default function NoticeBoard({ isAdmin = false, notices, onAddNotice, onRemoveNotice }: NoticeBoardProps) {
    const [newNotice, setNewNotice] = useState("");
    const [noticeType, setNoticeType] = useState<'urgent' | 'info' | 'update'>('info');

    const handleAdd = () => {
        if (!newNotice.trim()) return;
        const notice: Notice = {
            id: Date.now().toString(),
            type: noticeType,
            content: newNotice,
            date: new Date().toISOString().split('T')[0]
        };
        onAddNotice(notice);
        setNewNotice("");
    };

    return (
        <div className="erp-card p-6 bg-white border-blue-100 shadow-xl shadow-blue-500/5 relative overflow-hidden group/board">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/board:rotate-12 transition-transform duration-700">
                <Megaphone className="w-24 h-24" />
            </div>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 shadow-sm relative">
                        <Bell className="w-6 h-6 text-amber-600" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-bounce border-2 border-white">
                            {notices.length}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest italic flex items-center gap-2">
                            Latest Notices
                        </h3>
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Directives & Command Logs</p>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[8px] font-black uppercase tracking-tighter">Auto-Synced</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-100">
                        <History className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[9px] font-black uppercase text-slate-600">Active Logs</span>
                    </div>
                </div>
            </div>

            {/* Notice Creation Area */}
            {isAdmin && (
                <div className="mb-8 space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                            {(['info', 'update', 'urgent'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setNoticeType(type)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                        noticeType === type
                                            ? (type === 'urgent' ? "bg-red-500 text-white shadow-lg shadow-red-500/30" :
                                                type === 'update' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" :
                                                    "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30")
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <textarea
                            placeholder="Draft a new command or announcement..."
                            value={newNotice}
                            onChange={(e) => setNewNotice(e.target.value)}
                            className="erp-input text-xs py-3 min-h-[50px] resize-none"
                        />
                        <button
                            onClick={handleAdd}
                            className="bg-slate-900 text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-95 flex flex-col items-center justify-center gap-1 group/btn"
                        >
                            <Send className="w-4 h-4 group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1 transition-transform" />
                            Post
                        </button>
                    </div>
                </div>
            )}

            {/* Notices List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {notices.map((notice, idx) => (
                        <motion.div
                            key={notice.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: idx * 0.05 }}
                            className={cn(
                                "p-5 rounded-[1.5rem] border flex gap-5 relative group overflow-hidden",
                                notice.type === 'urgent' ? "bg-red-50/50 border-red-100" :
                                    notice.type === 'update' ? "bg-blue-50/50 border-blue-100" :
                                        "bg-emerald-50/50 border-emerald-100"
                            )}
                        >
                            <div className={cn(
                                "w-1 h-12 absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full",
                                notice.type === 'urgent' ? "bg-red-500" :
                                    notice.type === 'update' ? "bg-blue-500" :
                                        "bg-emerald-500"
                            )} />

                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-inherit shrink-0">
                                {notice.type === 'urgent' ? <AlertTriangle className="w-5 h-5 text-red-500" /> :
                                    notice.type === 'update' ? <Info className="w-5 h-5 text-blue-500" /> :
                                        <Megaphone className="w-5 h-5 text-emerald-500" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                            notice.type === 'urgent' ? "bg-red-100 text-red-600 border-red-200" :
                                                notice.type === 'update' ? "bg-blue-100 text-blue-600 border-blue-200" :
                                                    "bg-emerald-100 text-emerald-600 border-emerald-200"
                                        )}>
                                            {notice.type}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Terminal Node: 0{idx + 1}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 italic font-mono">{notice.date}</span>
                                </div>
                                <p className="text-xs font-bold text-slate-700 leading-relaxed break-words">{notice.content}</p>
                            </div>

                            {isAdmin && (
                                <button
                                    onClick={() => onRemoveNotice(notice.id)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-red-100 shadow-sm"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </motion.div>
                    ))}
                    {notices.length === 0 && (
                        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                            <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Broadcast History Expunged</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
