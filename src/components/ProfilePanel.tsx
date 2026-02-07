"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Briefcase, Camera, Save, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { Agent } from "./TaskCard";
import { cn } from "@/lib/utils";

interface ProfilePanelProps {
    user: Agent;
    onUpdate: (updates: Partial<Agent>) => void;
}

export default function ProfilePanel({ user, onUpdate }: ProfilePanelProps) {
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        designation: user.designation || "",
        image: user.image || ""
    });
    const [isSaved, setIsSaved] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Strict Size Limit: 35KB
        if (file.size > 35 * 1024) {
            alert("Image too large! Max allowed size is 35KB for database storage.");
            return;
        }

        setIsUploading(true);

        // Convert image to Base64 String (Data URL)
        const reader = new FileReader();

        reader.onloadend = () => {
            const base64String = reader.result as string;

            // Update local state and Firestore immediately
            setFormData(prev => ({ ...prev, image: base64String }));
            onUpdate({ image: base64String });

            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
            setIsUploading(false);
            console.log("Profile updated via Database Storage (Base64)");
        };

        reader.onerror = () => {
            console.error("Base64 Conversion Error");
            alert("Failed to process image.");
            setIsUploading(false);
        };

        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(formData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8 border-b border-slate-200 pb-6">
                <h2 className="text-2xl font-black text-slate-800 italic uppercase">Agent Profile</h2>
                <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">Personnel Information Control</p>
            </div>

            <div className="erp-card bg-white p-8 shadow-2xl space-y-8">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                            {formData.image ? (
                                <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-slate-300" />
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-2xl shadow-lg hover:bg-blue-700 transition-all active:scale-90 group-hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-black text-slate-800">{formData.name}</h3>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 italic">
                            {formData.designation || "Assigned Agent"}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <User className="w-3.5 h-3.5" /> Full Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="erp-input py-3 font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5" /> Designation
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Senior Web Developer"
                                value={formData.designation}
                                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                className="erp-input py-3 font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5" /> Access Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="erp-input py-3 font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5" /> Contact Number
                            </label>
                            <input
                                type="text"
                                placeholder="+880..."
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="erp-input py-3 font-bold"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                        <AnimatePresence>
                            {isSaved && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Profile Synchronized
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <button
                            type="submit"
                            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all shadow-xl active:scale-95 flex items-center gap-3 ml-auto"
                        >
                            <Save className="w-4 h-4" />
                            Commit Updates
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
