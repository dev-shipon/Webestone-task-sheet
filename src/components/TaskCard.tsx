"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, AlertCircle, PlayCircle, MoreVertical, ExternalLink, Calendar, Link as LinkIcon, MessageSquare, Send, AlertTriangle, ShieldAlert, X, Plus, Trash2, Ban, RotateCcw, FileUp, Loader2, Image } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export type TaskStatus = 'Done' | 'In Progress' | 'Not Started' | 'Action Needed' | 'Needs Improvement' | 'Rejected' | 'Waiting for Review';

export interface Agent {
    id: string;
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'agent';
    designation?: string;
    phone?: string;
    image?: string;
}

export interface Project {
    id: string;
    name: string;
    startDate: string;
    lengthDays: number;
    website: string;
    ownerName?: string;
    ownerContact?: string;
}

export interface Task {
    id: string;
    title: string;
    project: string;
    agent: string;
    deadline: string;
    status: TaskStatus;
    remarks: string;
    feedbackRemark?: string;
    submissionLinks: string[];
    submissionDate: string;
}

const statusConfig = {
    'Done': {
        color: 'text-emerald-700 bg-emerald-50 border-emerald-100',
        dot: 'bg-emerald-500',
        icon: CheckCircle2
    },
    'In Progress': {
        color: 'text-blue-700 bg-blue-50 border-blue-100',
        dot: 'bg-blue-500',
        icon: PlayCircle
    },
    'Not Started': {
        color: 'text-slate-500 bg-slate-50 border-slate-200',
        dot: 'bg-slate-400',
        icon: Clock
    },
    'Action Needed': {
        color: 'text-amber-700 bg-amber-50 border-amber-100',
        dot: 'bg-amber-500',
        icon: AlertCircle
    },
    'Needs Improvement': {
        color: 'text-orange-700 bg-orange-50 border-orange-100',
        dot: 'bg-orange-500',
        icon: AlertTriangle
    },
    'Rejected': {
        color: 'text-red-700 bg-red-50 border-red-100',
        dot: 'bg-red-500',
        icon: Ban
    },
    'Waiting for Review': {
        color: 'text-indigo-700 bg-indigo-50 border-indigo-100',
        dot: 'bg-indigo-500',
        icon: Clock
    }
};

interface TaskCardProps {
    task: Task;
    isAdminView: boolean;
    onUpdate: (taskId: string, updates: Partial<Task>) => void;
    onDelete?: (taskId: string) => void;
    currentUserId: string;
    agents: Agent[];
}

export default function TaskCard({ task, isAdminView, onUpdate, onDelete, currentUserId, agents = [] }: TaskCardProps) {
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [submitForm, setSubmitForm] = useState({
        links: (task.submissionLinks && task.submissionLinks.length > 0) ? [...task.submissionLinks] : [""],
        date: task.submissionDate || new Date().toISOString().split('T')[0]
    });
    const [adminFeedback, setAdminFeedback] = useState(task.feedbackRemark || "");

    const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'Done';
    const config = statusConfig[task.status];
    const Icon = config.icon;

    const handleAddLink = () => {
        setSubmitForm({ ...submitForm, links: [...submitForm.links, ""] });
    };

    const handleRemoveLink = (index: number) => {
        const newLinks = submitForm.links.filter((_, i) => i !== index);
        setSubmitForm({ ...submitForm, links: newLinks.length > 0 ? newLinks : [""] });
    };

    const handleLinkChange = (index: number, value: string) => {
        const newLinks = [...submitForm.links];
        newLinks[index] = value;
        setSubmitForm({ ...submitForm, links: newLinks });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const storageRef = ref(storage, `tasks/${task.id}/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            // Add to links array
            const newLinks = [...submitForm.links];
            if (newLinks.length === 1 && newLinks[0] === "") {
                newLinks[0] = downloadURL;
            } else {
                newLinks.push(downloadURL);
            }
            setSubmitForm(prev => ({ ...prev, links: newLinks }));
        } catch (error) {
            console.error("Task File Upload Error:", error);
            alert("Failed to upload artifact to station archive.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(task.id, {
            submissionLinks: submitForm.links.filter(l => l.trim() !== ""),
            submissionDate: submitForm.date,
            status: 'Waiting for Review',
            feedbackRemark: "" // Clear feedback when re-submitting
        });
        setShowSubmitModal(false);
    };

    const handleAdminAction = (newStatus: TaskStatus) => {
        onUpdate(task.id, {
            status: newStatus,
            feedbackRemark: adminFeedback
        });
        setShowAdminModal(false);
    };

    return (
        <div className={cn(
            "erp-card p-5 group flex flex-col h-full bg-white relative transition-all",
            isAdminView && isOverdue ? "border-red-500 border-2 shadow-lg shadow-red-500/10 scale-[1.02]" : "border-slate-200"
        )}>
            {isAdminView && isOverdue && (
                <div className="absolute -top-3 -right-3 z-20 bg-red-600 text-white p-1.5 rounded-full shadow-lg animate-bounce">
                    <ShieldAlert className="w-5 h-5" />
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                <span className={cn(
                    "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-md transition-colors",
                    isAdminView && isOverdue ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-50 text-slate-400 border-slate-100"
                )}>
                    {task.project}
                </span>
                <div className="flex items-center gap-1">
                    {isAdminView && (task.status === 'Waiting for Review' || task.status === 'Done') && (
                        <button
                            onClick={() => setShowAdminModal(true)}
                            className="bg-blue-50 text-blue-600 p-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                        >
                            <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {isAdminView && (
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();
                                if (isDeleting) return;
                                setIsDeleting(true);
                                try {
                                    await onDelete?.(task.id);
                                } catch (err) {
                                    console.error(err);
                                } finally {
                                    setIsDeleting(false);
                                }
                            }}
                            disabled={isDeleting}
                            className="bg-red-50 text-red-500 p-1.5 rounded-lg border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm disabled:opacity-50"
                            title="Delete Task"
                        >
                            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                    )}
                </div>
            </div>

            <h3 className={cn(
                "text-base font-black mb-2 line-clamp-2 leading-tight",
                isAdminView && isOverdue ? "text-red-700" : "text-slate-800"
            )}>
                {task.title}
            </h3>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-bold uppercase tracking-tighter">Deadline:</span>
                    <span className={cn(
                        "font-black px-1.5 py-0.5 rounded",
                        isOverdue ? "text-white bg-red-600" : "text-slate-700 bg-slate-100"
                    )}>{task.deadline}</span>
                </div>

                {task.remarks && (
                    <div className="flex items-start gap-2 text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-50" />
                        <p className="font-medium italic leading-relaxed line-clamp-2">{task.remarks}</p>
                    </div>
                )}

                {task.feedbackRemark && (
                    <div className="flex items-start gap-2 text-[10px] text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100">
                        <Ban className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <p className="font-black uppercase tracking-widest text-[8px] mb-1">Station Commander Feedback</p>
                            <p className="font-bold leading-relaxed">{task.feedbackRemark}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-auto space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {(() => {
                            const assignedAgent = agents.find(a => a.name === task.agent);
                            return assignedAgent?.image ? (
                                <img
                                    src={assignedAgent.image}
                                    alt={task.agent}
                                    className="w-8 h-8 rounded-xl object-cover bg-slate-900 border border-slate-200 shadow-md"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-md">
                                    {task.agent.substring(0, 2).toUpperCase()}
                                </div>
                            );
                        })()}
                        <span className="text-xs font-black text-slate-700">{task.agent}</span>
                    </div>
                    <span className={cn("status-badge flex items-center gap-1.5 px-2.5 py-1", config.color)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full shadow-sm", config.dot)} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{task.status}</span>
                    </span>
                </div>

                <div className="pt-4 border-t border-slate-50 flex flex-col gap-2">
                    {task.submissionLinks && task.submissionLinks.length > 0 ? (
                        <div className="space-y-1">
                            {task.submissionLinks.map((link, idx) => (
                                <a
                                    key={idx}
                                    href={link}
                                    target="_blank"
                                    className="text-emerald-600 hover:text-emerald-700 font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 transition-all hover:gap-2 truncate"
                                >
                                    <LinkIcon className="w-3 h-3" />
                                    Artifact 0{idx + 1}
                                </a>
                            ))}
                        </div>
                    ) : (
                        <span className="text-slate-300 text-[9px] font-black uppercase tracking-widest">Awaiting Data</span>
                    )}

                    <div className="flex items-center justify-between gap-2 mt-2">
                        {!isAdminView && task.status !== 'Done' ? (
                            <button
                                onClick={() => setShowSubmitModal(true)}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                            >
                                <Send className="w-3.5 h-3.5" />
                                {task.status === 'Needs Improvement' ? 'Re-Submit' : 'Finalize'}
                            </button>
                        ) : (
                            !isAdminView && (
                                <button
                                    onClick={() => {
                                        const msg = `UPDATE REQUEST:\nTask: ${task.title}\nStatus: ${task.status}\nOverdue: ${isOverdue ? 'YES' : 'NO'}\nDeadline: ${task.deadline}`;
                                        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                                    }}
                                    className={cn(
                                        "w-full px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1 transition-all",
                                        isOverdue ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30" : "bg-slate-900 text-white hover:bg-black"
                                    )}
                                >
                                    Nudge
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                            )
                        )}
                    </div>
                </div>

                {task.submissionDate && (
                    <div className="text-[8px] text-slate-400 text-right font-black uppercase tracking-tighter opacity-60">
                        Node Confirmed: {task.submissionDate}
                    </div>
                )}
            </div>

            {/* Submission Modal for Agent */}
            <AnimatePresence>
                {showSubmitModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border-4 border-blue-500 p-8 relative overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h4 className="text-xl font-black text-slate-800 uppercase italic">Digital Archive Upload</h4>
                                    <p className="text-[10px] text-slate-400 font-black tracking-widest">COMMIT RESOURCE TO STATION DATABASE</p>
                                </div>
                                <button onClick={() => setShowSubmitModal(false)} className="bg-slate-50 p-2 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                                        Data Artifact Links
                                        <button
                                            type="button"
                                            onClick={handleAddLink}
                                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add Link
                                        </button>
                                    </label>
                                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                        {submitForm.links.map((link, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                    <input
                                                        type="url"
                                                        required
                                                        placeholder="https://..."
                                                        value={link}
                                                        onChange={e => handleLinkChange(idx, e.target.value)}
                                                        className="erp-input py-3 pl-10 text-xs font-bold"
                                                    />
                                                </div>
                                                {submitForm.links.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveLink(idx)}
                                                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id={`file-upload-${task.id}`}
                                                className="hidden"
                                                onChange={handleFileUpload}
                                                disabled={isUploading}
                                            />
                                            <label
                                                htmlFor={`file-upload-${task.id}`}
                                                className={cn(
                                                    "w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-200 transition-all border border-slate-200",
                                                    isUploading && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />}
                                                {isUploading ? "Uploading..." : "Upload File"}
                                            </label>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id={`img-upload-${task.id}`}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                disabled={isUploading}
                                            />
                                            <label
                                                htmlFor={`img-upload-${task.id}`}
                                                className={cn(
                                                    "w-full flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-100 transition-all border border-blue-100",
                                                    isUploading && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Image className="w-3.5 h-3.5" />}
                                                {isUploading ? "Uploading..." : "Snap Screenshot"}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commitment Timestamp</label>
                                    <input
                                        type="date"
                                        required
                                        value={submitForm.date}
                                        onChange={e => setSubmitForm({ ...submitForm, date: e.target.value })}
                                        className="erp-input py-3 text-xs font-bold"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    Push to Station Network
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Admin Action Modal */}
            <AnimatePresence>
                {showAdminModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border-4 border-slate-900 p-8 relative overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h4 className="text-xl font-black text-slate-800 uppercase italic">Command Review</h4>
                                    <p className="text-[10px] text-slate-400 font-black tracking-widest">EVALUATE AND AUDIT MISSION ARTIFACTS</p>
                                </div>
                                <button onClick={() => setShowAdminModal(false)} className="bg-slate-50 p-2 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment Remarks</label>
                                    <textarea
                                        placeholder="Enter feedback or rejection reasons..."
                                        value={adminFeedback}
                                        onChange={e => setAdminFeedback(e.target.value)}
                                        className="erp-input py-4 text-xs font-bold min-h-[120px] resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleAdminAction('Needs Improvement')}
                                        className="bg-orange-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Improvement Req
                                    </button>
                                    <button
                                        onClick={() => handleAdminAction('Rejected')}
                                        className="bg-red-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-500/20"
                                    >
                                        <Ban className="w-4 h-4" />
                                        Reject Task
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleAdminAction('Done')}
                                    className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Verify & Approve
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
