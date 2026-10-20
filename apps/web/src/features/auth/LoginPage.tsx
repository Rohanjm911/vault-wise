import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [demoLoaded, setDemoLoaded] = useState<boolean>(false);

  const handleFillDemo = () => {
    setEmail("demo@vaultwise.com");
    setPassword("Password123!");
    setDemoLoaded(true);
    setError(null);
    setTimeout(() => setDemoLoaded(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(
        err.message ||
          "Incorrect email or password. Please verify credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#f0fdf4] dark:bg-[#08120e] text-slate-900 dark:text-white transition-colors">
      <div className="w-full max-w-[420px] rounded-2xl p-6 sm:p-7 bg-white dark:bg-[#0f2019] border-2 border-slate-900 dark:border-[#1c382d] shadow-[6px_6px_0px_#061a12] dark:shadow-[6px_6px_0px_#020617] transition-all">
        <div className="flex items-center justify-between mb-5">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border-2 border-emerald-600 dark:border-emerald-500 shadow-[1.5px_1.5px_0px_#059669]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Vault Encrypted</span>
          </div>

          <div className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border-2 border-emerald-600 dark:border-emerald-500 shadow-[1.5px_1.5px_0px_#059669]">
            Personal Ledger
          </div>
        </div>

        <div className="text-center mb-5">
          <div className="flex justify-center mb-2">
            <img
              src="/logo.png"
              alt="Vaultwise Logo"
              className="w-20 h-20 object-contain drop-shadow-sm transition-transform duration-200 hover:scale-105"
            />
          </div>
          <h2 className="text-2xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
            Vaultwise
          </h2>
          <p className="text-[11px] font-black mt-0.5 tracking-widest uppercase text-slate-500 dark:text-slate-400">
            Your Money. Your Rules.
          </p>
        </div>

        <div className="mb-4">
          <button
            type="button"
            onClick={handleFillDemo}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer group ${
              demoLoaded
                ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 text-emerald-700 dark:text-emerald-300 shadow-[2px_2px_0px_#059669]"
                : "bg-slate-50 dark:bg-[#10241d] hover:bg-white dark:hover:bg-[#152e24] border-slate-900 dark:border-[#1c382d] text-slate-900 dark:text-white shadow-[3px_3px_0px_#061a12] dark:shadow-[3px_3px_0px_#020617] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            }`}
          >
            <div className="flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>
                {demoLoaded
                  ? "Demo Credentials Loaded!"
                  : "Fill Demo Account Credentials"}
              </span>
            </div>
            {demoLoaded ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                demo@vaultwise.com
              </span>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border-2 border-red-600 text-red-900 text-xs rounded-xl mb-4 font-bold flex items-start space-x-2 shadow-[2px_2px_0px_#ef4444]">
            <span className="text-red-600 font-bold">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Email Address
              </label>
              {email.length > 0 && (
                <span
                  className={`text-[10px] font-bold ${
                    isEmailValid
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {isEmailValid ? "✓ Valid format" : "Incomplete email"}
                </span>
              )}
            </div>

            <div className="relative rounded-xl neu-input">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@vaultwise.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-transparent text-sm focus:outline-none font-bold text-slate-900 dark:text-white rounded-xl"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Password
              </label>
              {password.length > 0 && (
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                  {password.length >= 8
                    ? "✓ Strong"
                    : `${password.length}/8 min`}
                </span>
              )}
            </div>

            <div className="relative rounded-xl neu-input">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 bg-transparent text-sm focus:outline-none font-bold text-slate-900 dark:text-white rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-1"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 font-black text-xs uppercase tracking-widest text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 active:translate-x-0.5 active:translate-y-0.5 rounded-xl border-2 border-slate-900 dark:border-emerald-400 shadow-[4px_4px_0px_#061a12] dark:shadow-[4px_4px_0px_#064e3b] active:shadow-none flex items-center justify-center space-x-2 mt-4 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>
              {isSubmitting ? "Authenticating Vault..." : "Unlock Vaultwise"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-semibold">
            Don't have a personal vault yet?{" "}
          </span>
          <button
            onClick={onSwitchToRegister}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-black underline transition-colors cursor-pointer"
          >
            Create local account
          </button>
        </div>

        <div className="mt-6 pt-4 border-t-2 border-slate-200 dark:border-slate-800 flex justify-center items-center space-x-3 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <span>⚡ Flat Math</span>
          <span>•</span>
          <span>🔒 100% Solid UI</span>
          <span>•</span>
          <span>🛡️ No Telemetry</span>
        </div>
      </div>
    </div>
  );
};
