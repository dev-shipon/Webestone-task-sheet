import { motion } from "framer-motion";
import { Lock, Mail, Rocket, AlertCircle, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

interface LoginProps {
    onLogin: (email: string, pass: string) => void;
    error?: string;
}

export default function LoginPage({ onLogin, error }: LoginProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [resetSent, setResetSent] = useState(false);
    const [resetError, setResetError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(email, password);
    };

    const handleResetPassword = async () => {
        if (!email) {
            setResetError("Please enter your email address first.");
            return;
        }
        setIsLoading(true);
        setResetError("");
        try {
            await sendPasswordResetEmail(auth, email);
            setResetSent(true);
            setTimeout(() => setResetSent(false), 5000);
        } catch (error: any) {
            console.error("Reset Error:", error);
            setResetError("Failed to send reset link. Verify email address.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-['Inter']">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-20 -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-3xl opacity-20 -ml-48 -mb-48" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/30 mb-6 group hover:rotate-12 transition-transform">
                        <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Webestone Station</h1>
                    <p className="text-slate-500 text-sm font-medium mt-2">Authorization required to access mission control.</p>
                </div>

                <div className="erp-card p-8 bg-white border-none shadow-2xl flex flex-col gap-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                Access Email
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="agent@webestone.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="erp-input py-3 text-sm font-bold bg-slate-50 border-slate-100 focus:bg-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Lock className="w-3 h-3" />
                                    Access Key
                                </label>
                                <button
                                    type="button"
                                    onClick={handleResetPassword}
                                    className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                                >
                                    Forgot Key?
                                </button>
                            </div>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="erp-input py-3 text-sm font-bold bg-slate-50 border-slate-100 focus:bg-white"
                            />
                        </div>

                        {(error || resetError) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-center gap-2 text-red-600 text-xs font-bold"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error || resetError}
                            </motion.div>
                        )}

                        {resetSent && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-center gap-2 text-emerald-600 text-xs font-bold"
                            >
                                <RefreshCw className="w-4 h-4 shrink-0 animate-spin-slow" />
                                Reset uplink sent to your email.
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all hover:gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Processing..." : "Initialize Session"}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            Secure ERP Protocol v4.0
                        </p>
                    </div>
                </div>

                <p className="text-center mt-8 text-[10px] text-slate-400 font-black tracking-widest uppercase">
                    Authorization Hub © 2026 WeBestOne Network
                </p>
            </motion.div>
        </div>
    );
}
