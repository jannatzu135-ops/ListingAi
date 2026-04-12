import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  Calendar, 
  ShieldCheck, 
  Zap, 
  Infinity,
  ArrowRight,
  RefreshCcw,
  Sparkles,
  Download,
  MoreVertical,
  Settings,
  BarChart3,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  Check,
  AlertCircle,
  Clock,
  Filter,
  ChevronRight,
  Bell,
  X as CloseIcon
} from "lucide-react";
import { collection, onSnapshot, doc, updateDoc, getDoc, addDoc, query, orderBy, limit } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { cn } from "../lib/utils";
import { ErrorDisplay } from "./ErrorDisplay";
import * as XLSX from "xlsx";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format, subDays } from "date-fns";

export default function AdminPanelView() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "settings" | "analytics">("users");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "expired" | "blocked">("all");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [isUpdatingCode, setIsUpdatingCode] = useState(false);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationTarget, setNotificationTarget] = useState<"all" | "new" | "expired">("all");
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Admin Panel Error:", err);
      handleFirestoreError(err, OperationType.LIST, "users");
      setError(err.message);
      setLoading(false);
    });

    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        setAccessCode(docSnap.data().accessCode);
      }
    });

    const unsubStats = onSnapshot(
      query(collection(db, "daily_stats"), orderBy("date", "desc"), limit(7)),
      (snapshot) => {
        const statsData = snapshot.docs.map(doc => doc.data()).reverse();
        setDailyStats(statsData);
      }
    );

    return () => {
      unsubUsers();
      unsubSettings();
      unsubStats();
    };
  }, []);

  const sendNotification = async () => {
    if (!notificationMessage) return;
    setIsSendingNotification(true);
    try {
      await addDoc(collection(db, "notifications"), {
        message: notificationMessage,
        target: notificationTarget,
        createdAt: new Date().toISOString(),
        active: true
      });
      setNotificationMessage("");
      alert("Notification sent successfully!");
    } catch (err) {
      console.error("Error sending notification:", err);
      alert("Failed to send notification.");
    } finally {
      setIsSendingNotification(false);
    }
  };

  const updateAccessCode = async () => {
    if (!accessCode) return;
    setIsUpdatingCode(true);
    try {
      await updateDoc(doc(db, "settings", "global"), {
        accessCode,
        updatedAt: new Date().toISOString()
      });
      alert("Access code updated successfully!");
    } catch (err) {
      console.error("Error updating access code:", err);
      alert("Failed to update access code.");
    } finally {
      setIsUpdatingCode(false);
    }
  };

  const updatePlan = async (userId: string, planType: string) => {
    const userRef = doc(db, "users", userId);
    let expiryDate = "";

    if (planType === "trial") {
      const date = new Date();
      date.setDate(date.getDate() + 2);
      expiryDate = date.toISOString();
    } else if (planType === "pro_max") {
      const date = new Date();
      date.setDate(date.getDate() + 3);
      expiryDate = date.toISOString();
    } else if (planType === "monthly") {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      expiryDate = date.toISOString();
    } else if (planType === "yearly") {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      expiryDate = date.toISOString();
    } else if (planType === "6month") {
      const date = new Date();
      date.setMonth(date.getMonth() + 6);
      expiryDate = date.toISOString();
    } else if (planType === "none") {
      expiryDate = "";
    }

    try {
      await updateDoc(userRef, {
        planType,
        expiryDate,
        isBlocked: false, // Unblock if assigning a plan
        hasUsedTrial: planType !== "none",
        hasVirtualTryOnAddon: planType !== "trial" && planType !== "none",
        hasLowShippingAddon: planType !== "trial" && planType !== "none"
      });
    } catch (error) {
      console.error("Error updating plan:", error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      alert("Failed to update plan. Check console for details.");
    }
  };

  const toggleBlock = async (userId: string, currentStatus: boolean) => {
    const userRef = doc(db, "users", userId);
    try {
      await updateDoc(userRef, {
        isBlocked: !currentStatus,
        planType: !currentStatus ? "none" : "none" // Reset plan if blocking
      });
    } catch (error) {
      console.error("Error toggling block:", error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      alert("Failed to update block status.");
    }
  };

  const toggleAddon = async (userId: string, currentStatus: boolean) => {
    const userRef = doc(db, "users", userId);
    try {
      await updateDoc(userRef, {
        hasVirtualTryOnAddon: !currentStatus
      });
    } catch (error) {
      console.error("Error toggling addon:", error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      alert("Failed to update addon status.");
    }
  };

  const toggleLowShippingAddon = async (userId: string, currentStatus: boolean) => {
    const userRef = doc(db, "users", userId);
    try {
      await updateDoc(userRef, {
        hasLowShippingAddon: !currentStatus
      });
    } catch (error) {
      console.error("Error toggling low shipping addon:", error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      alert("Failed to update low shipping addon status.");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isExpired = user.planType !== 'none' && user.expiryDate && new Date(user.expiryDate) <= new Date();
    const isActive = user.planType !== 'none' && !isExpired && !user.isBlocked;

    if (filterStatus === "active") return matchesSearch && isActive;
    if (filterStatus === "expired") return matchesSearch && isExpired;
    if (filterStatus === "blocked") return matchesSearch && user.isBlocked;
    return matchesSearch;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.planType !== 'none' && !u.isBlocked && (new Date(u.expiryDate) > new Date())).length,
    expired: users.filter(u => u.planType !== 'none' && !u.isBlocked && new Date(u.expiryDate) <= new Date()).length,
    blocked: users.filter(u => u.isBlocked).length,
    newToday: users.filter(u => u.createdAt && new Date(u.createdAt).toDateString() === new Date().toDateString()).length
  };

  const exportToExcel = () => {
    const exportData = filteredUsers.map(user => ({
      'Name': user.displayName || 'Anonymous',
      'Email': user.email || 'N/A',
      'Plan': user.planType || 'none',
      'Expiry Date': user.expiryDate ? new Date(user.expiryDate).toLocaleDateString() : 'N/A',
      'Trial Used': user.hasUsedTrial ? 'Yes' : 'No',
      'Status': user.isBlocked ? 'Blocked' : 'Active',
      'Photoshoot Addon': user.hasVirtualTryOnAddon ? 'Yes' : 'No',
      'Shipping Addon': user.hasLowShippingAddon ? 'Yes' : 'No',
      'Daily Images': user.dailyImageCount || 0,
      'Daily Listings': user.dailyListingCount || 0,
      'Created At': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, `ListingAi_Users_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="animate-spin text-blue-600" size={40} />
          <p className="text-slate-500 font-bold animate-pulse">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-red-100 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <UserX size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Access Denied</h2>
            <p className="text-xs text-slate-400">Make sure you are logged in with the admin email: jannatzu135@gmail.com</p>
          </div>
          <ErrorDisplay error={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 w-fit shadow-sm">
        <button
          onClick={() => setActiveTab("users")}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
            activeTab === "users" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          )}
        >
          <Users size={18} />
          Users
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
            activeTab === "analytics" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          )}
        >
          <BarChart3 size={18} />
          Analytics
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
            activeTab === "settings" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          )}
        >
          <Settings size={18} />
          Settings
        </button>
      </div>

      {activeTab === "users" && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
              <p className="text-slate-500 font-medium">Monitor and control user access</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 500);
                }}
                className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500 shadow-sm"
                title="Refresh Data"
              >
                <RefreshCcw size={20} />
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 transition-all w-full md:w-64 font-medium shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <Users size={28} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Users</p>
                <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                <p className="text-[10px] text-blue-600 font-bold mt-1">+{stats.newToday} today</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-green-600/10 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                <UserCheck size={28} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active Plans</p>
                <p className="text-3xl font-black text-slate-900">{stats.active}</p>
                <p className="text-[10px] text-green-600 font-bold mt-1">{Math.round((stats.active/stats.total)*100)}% conversion</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-amber-600/10 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <Clock size={28} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Expired</p>
                <p className="text-3xl font-black text-slate-900">{stats.expired}</p>
                <p className="text-[10px] text-amber-600 font-bold mt-1">Needs attention</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                <UserX size={28} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Blocked</p>
                <p className="text-3xl font-black text-slate-900">{stats.blocked}</p>
                <p className="text-[10px] text-red-600 font-bold mt-1">Restricted access</p>
              </div>
            </div>
          </div>

          {/* Filters and Table */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                {(["all", "active", "expired", "blocked"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      filterStatus === status ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                <Download size={14} />
                Export Data
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="px-8 py-5">User Profile</th>
                    <th className="px-8 py-5">Subscription</th>
                    <th className="px-8 py-5">Addons</th>
                    <th className="px-8 py-5">Usage</th>
                    <th className="px-8 py-5">Expiry</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                          <Users size={48} />
                          <p className="font-black uppercase tracking-widest text-sm">No Users Found</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.map((user) => {
                    const isExpired = user.planType !== 'none' && user.expiryDate && new Date(user.expiryDate) <= new Date();
                    const isActive = user.planType !== 'none' && !isExpired && !user.isBlocked;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm overflow-hidden border-2 border-white shadow-sm">
                                {user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : user.email?.[0].toUpperCase()}
                              </div>
                              <div className={cn(
                                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm",
                                isActive ? "bg-green-500" : user.isBlocked ? "bg-red-500" : "bg-slate-300"
                              )} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-900 leading-none">{user.displayName || 'Anonymous'}</p>
                                {user.isBlocked && (
                                  <span className="px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-black uppercase tracking-tighter rounded">Blocked</span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium mt-1.5">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5",
                            user.planType === "trial" ? "bg-green-600/10 text-green-600" :
                            user.planType === "pro_max" ? "bg-rose-600/10 text-rose-600" :
                            user.planType === "monthly" ? "bg-blue-600/10 text-blue-600" :
                            user.planType === "yearly" ? "bg-purple-600/10 text-purple-600" :
                            user.planType === "6month" ? "bg-amber-600/10 text-amber-600" :
                            "bg-slate-100 text-slate-400"
                          )}>
                            <Zap size={10} fill="currentColor" />
                            {user.planType === "pro_max" ? "ListingAi Max" : user.planType}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-wrap gap-1.5">
                            {user.hasVirtualTryOnAddon && (
                              <div className="px-2 py-1 bg-amber-500/10 text-amber-600 text-[8px] font-black uppercase tracking-tighter rounded-lg border border-amber-500/20">Photoshoot</div>
                            )}
                            {user.hasLowShippingAddon && (
                              <div className="px-2 py-1 bg-indigo-500/10 text-indigo-600 text-[8px] font-black uppercase tracking-tighter rounded-lg border border-indigo-500/20">Shipping</div>
                            )}
                            {!user.hasVirtualTryOnAddon && !user.hasLowShippingAddon && (
                              <span className="text-[10px] text-slate-300 font-bold">None</span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                              <span>Listings</span>
                              <span className="text-slate-900">{user.dailyListingCount || 0}/20</span>
                            </div>
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 transition-all" 
                                style={{ width: `${Math.min(((user.dailyListingCount || 0) / 20) * 100, 100)}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                              <Calendar size={14} className="text-slate-400" />
                              {user.expiryDate ? new Date(user.expiryDate).toLocaleDateString() : 'N/A'}
                            </div>
                            {isActive && (
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Active</span>
                              </div>
                            )}
                            {isExpired && (
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Expired</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditModalOpen(true);
                            }}
                            className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm group-hover:scale-110"
                          >
                            <Edit3 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "settings" && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto space-y-8"
        >
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-blue-500/5 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <Settings size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Settings</h2>
                <p className="text-slate-500 font-medium">Configure global application parameters</p>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-50">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Global Access Code</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-mono text-lg font-bold"
                    placeholder="Enter new access code"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium ml-1">This code is required for users to enter the application.</p>
              </div>

              <button
                onClick={updateAccessCode}
                disabled={isUpdatingCode}
                className={cn(
                  "w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3",
                  isUpdatingCode && "opacity-50 cursor-not-allowed"
                )}
              >
                {isUpdatingCode ? <RefreshCcw className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                {isUpdatingCode ? "Updating..." : "Update Access Code"}
              </button>
            </div>
          </div>

          <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-1">
              <p className="font-black text-amber-900 uppercase tracking-widest text-xs">Security Note</p>
              <p className="text-sm text-amber-700 font-medium leading-relaxed">
                Changing the access code will immediately require all users to re-enter the new code. 
                Existing sessions will be invalidated on their next interaction.
              </p>
            </div>
          </div>

          {/* Notification System */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-blue-500/5 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <Bell size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Broadcast Notification</h2>
                <p className="text-slate-500 font-medium">Send a pop-up message to users</p>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-50">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                <div className="flex gap-2">
                  {(["all", "new", "expired"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setNotificationTarget(t)}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                        notificationTarget === t ? "bg-blue-600 text-white border-transparent shadow-lg" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                      )}
                    >
                      {t} Users
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                <textarea 
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-medium text-sm min-h-[120px] resize-none"
                  placeholder="Enter your message here..."
                />
              </div>

              <button
                onClick={sendNotification}
                disabled={isSendingNotification || !notificationMessage}
                className={cn(
                  "w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3",
                  (isSendingNotification || !notificationMessage) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSendingNotification ? <RefreshCcw className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                {isSendingNotification ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "analytics" && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* DAU Graph */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Daily Active Users (Last 7 Days)</h3>
              <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                <Users size={12} />
                Live Tracking
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyStats}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    tickFormatter={(str) => format(new Date(str), 'MMM d')}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 800, color: '#1e293b' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="activeUsers" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Feature Usage Chart */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Feature Popularity</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Listing', count: dailyStats.reduce((acc, curr) => acc + (curr.listingCount || 0), 0) },
                    { name: 'Photoshoot', count: dailyStats.reduce((acc, curr) => acc + (curr.photoshootCount || 0), 0) },
                    { name: 'Shipping', count: dailyStats.reduce((acc, curr) => acc + (curr.shippingCount || 0), 0) }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {
                        [0, 1, 2].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#2563eb', '#f59e0b', '#6366f1'][index]} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Plan Distribution</h3>
              <div className="space-y-4">
                {["trial", "pro_max", "monthly", "6month", "yearly", "none"].map(plan => {
                  const count = users.filter(u => u.planType === plan).length;
                  const percentage = Math.round((count / users.length) * 100);
                  return (
                    <div key={plan} className="space-y-2">
                      <div className="flex items-center justify-between text-sm font-bold">
                        <span className="capitalize text-slate-600">{plan === "pro_max" ? "ListingAi Max" : plan}</span>
                        <span className="text-slate-900">{count} users ({percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-1000",
                            plan === "pro_max" ? "bg-rose-500" :
                            plan === "yearly" ? "bg-purple-500" :
                            plan === "monthly" ? "bg-blue-500" :
                            plan === "6month" ? "bg-amber-500" :
                            plan === "trial" ? "bg-green-500" : "bg-slate-200"
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 6).map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 font-bold text-xs border border-slate-100">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 truncate w-32">{user.email}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* User Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <UserCheck size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manage User</h2>
                    <p className="text-slate-500 font-medium text-sm">{selectedUser.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                >
                  <CloseIcon size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto space-y-8">
                {/* Plan Selection */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subscription Plan</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: "trial", label: "Trial", color: "bg-green-600" },
                      { id: "pro_max", label: "Max (3D)", color: "bg-rose-600" },
                      { id: "monthly", label: "1 Month", color: "bg-blue-600" },
                      { id: "6month", label: "6 Months", color: "bg-amber-600" },
                      { id: "yearly", label: "1 Year", color: "bg-purple-600" },
                      { id: "none", label: "Reset", color: "bg-red-600" }
                    ].map(plan => (
                      <button
                        key={plan.id}
                        onClick={() => updatePlan(selectedUser.id, plan.id)}
                        className={cn(
                          "px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2",
                          selectedUser.planType === plan.id 
                            ? `${plan.color} text-white border-transparent shadow-lg` 
                            : "bg-white text-slate-600 border-slate-100 hover:border-slate-300"
                        )}
                      >
                        {plan.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Addons */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Premium Addons</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => toggleAddon(selectedUser.id, !!selectedUser.hasVirtualTryOnAddon)}
                      className={cn(
                        "p-5 rounded-[2rem] border-2 transition-all flex items-center justify-between group",
                        selectedUser.hasVirtualTryOnAddon 
                          ? "bg-amber-50 border-amber-500 text-amber-900" 
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                          selectedUser.hasVirtualTryOnAddon ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-400"
                        )}>
                          <Sparkles size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-black uppercase tracking-widest text-[10px]">AI Photoshoot</p>
                          <p className="text-xs font-bold opacity-60">Virtual Try-On Access</p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                        selectedUser.hasVirtualTryOnAddon ? "bg-amber-500 text-white scale-110" : "bg-slate-100 text-transparent"
                      )}>
                        <Check size={14} />
                      </div>
                    </button>

                    <button
                      onClick={() => toggleLowShippingAddon(selectedUser.id, !!selectedUser.hasLowShippingAddon)}
                      className={cn(
                        "p-5 rounded-[2rem] border-2 transition-all flex items-center justify-between group",
                        selectedUser.hasLowShippingAddon 
                          ? "bg-indigo-50 border-indigo-500 text-indigo-900" 
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                          selectedUser.hasLowShippingAddon ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-400"
                        )}>
                          <Zap size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-black uppercase tracking-widest text-[10px]">Low Shipping</p>
                          <p className="text-xs font-bold opacity-60">Shipping Tool Access</p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                        selectedUser.hasLowShippingAddon ? "bg-indigo-500 text-white scale-110" : "bg-slate-100 text-transparent"
                      )}>
                        <Check size={14} />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Account Status */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Security</h3>
                  <button
                    onClick={() => toggleBlock(selectedUser.id, !!selectedUser.isBlocked)}
                    className={cn(
                      "w-full p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group",
                      selectedUser.isBlocked 
                        ? "bg-red-50 border-red-500 text-red-900" 
                        : "bg-white border-slate-100 text-slate-600 hover:border-red-200"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                        selectedUser.isBlocked ? "bg-red-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-red-100 group-hover:text-red-500"
                      )}>
                        {selectedUser.isBlocked ? <Lock size={24} /> : <Unlock size={24} />}
                      </div>
                      <div className="text-left">
                        <p className="font-black uppercase tracking-widest text-sm">{selectedUser.isBlocked ? "Account Blocked" : "Account Active"}</p>
                        <p className="text-xs font-bold opacity-60">
                          {selectedUser.isBlocked ? "User cannot access any features" : "User has standard access permissions"}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      selectedUser.isBlocked ? "bg-red-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-red-500 group-hover:text-white"
                    )}>
                      {selectedUser.isBlocked ? "Unblock Now" : "Block User"}
                    </div>
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <Clock size={14} />
                  Last Updated: {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleTimeString() : 'N/A'}
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 uppercase tracking-widest"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

