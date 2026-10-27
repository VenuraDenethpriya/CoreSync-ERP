import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import wsService from "@/api/ws";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { fechSitesList } from "@/api/siteApi";

function SiteCards() {
    const { getToken } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const [sites, setSites] = useState([]);

    const fetchSites = async () => {
        try {
            const token = await getToken();
            const res = await fechSitesList(token, "", 100, 0);
            
            // FILTER OUT COMPLETED SITES & Sort by Date
            const activeSites = (res?.data?.site || [])
                .filter((site) => site.status?.toLowerCase() !== "completed")
                .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            setSites(activeSites);
            setIsError(false);
        } catch (error) {
            console.error("Error fetching sites:", error);
            setIsError(true);
            setErrorMessage(error.message || "Failed to fetch sites.");
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchSites().finally(() => setIsLoading(false));
    }, [getToken]);

    // WebSocket Updates
    useEffect(() => {
        const handleUpdate = (data) => {
            const siteData = data.data;
            if (!siteData || !siteData.site) return;

            if (data.type === "site.created") {
                if (siteData.site.status?.toLowerCase() !== "completed") {
                    setSites((prev) => [siteData.site, ...prev].sort((a, b) => new Date(a.date) - new Date(b.date)));
                }
            } else if (data.type === "site.updated") {
                setSites((prev) => {
                    const isCompleted = siteData.site.status?.toLowerCase() === "completed";
                    
                    if (isCompleted) {
                        return prev.filter((s) => s.id !== siteData.site.id);
                    }
                    
                    const exists = prev.some((s) => s.id === siteData.site.id);
                    if (exists) {
                        return prev.map((s) => (s.id === siteData.site.id ? siteData.site : s));
                    } else {
                        return [...prev, siteData.site].sort((a, b) => new Date(a.date) - new Date(b.date));
                    }
                });
            } else if (data.type === "site.deleted") {
                setSites((prev) =>
                    prev.filter((s) => s.id !== siteData.site.id)
                );
            }
        };

        wsService.subscribe("sites", handleUpdate);
        return () => wsService.unsubscribe("sites", handleUpdate);
    }, []);

    // Format Current Date
    const currentDate = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    if (isError) {
        return (
            <div className="text-red-500 flex flex-col items-center justify-center h-screen bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="font-semibold text-lg">{errorMessage}</p>
            </div>
        );
    }

    return (
        <section className="bg-gradient-to-br py-4 from-gray-50 to-gray-100 h-screen flex flex-col">
            {/* Site Cards Grid - Added items-stretch so cards are equal height in a row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 pt-6 bg-gradient-to-b from-gray-50 to-white flex-grow overflow-y-auto items-stretch">
                {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-[280px] w-full rounded-2xl" />
                    ))
                ) : sites.length > 0 ? (
                    sites.map((site) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const siteDate = new Date(site.date);
                        siteDate.setHours(0, 0, 0, 0);

                        const isOverdue = siteDate < today;
                        const isToday = siteDate.getTime() === today.getTime();

                        // Dynamic Colors based on Date & Status
                        let topBarColor = "bg-blue-500 h-1.5";
                        let dateBadge = "bg-blue-50 text-blue-700 border-blue-200";
                        let cardWrapper = "bg-white shadow-sm border border-gray-100 z-0";
                        
                        if (isOverdue) {
                            topBarColor = "bg-red-500 h-1.5";
                            dateBadge = "bg-red-50 text-red-700 border-red-200";
                            cardWrapper = "bg-white shadow-sm border border-red-200 z-0";
                        } else if (isToday) {
                            topBarColor = "bg-green-500 h-2"; 
                            dateBadge = "bg-green-100 text-green-800 border-green-300 shadow-sm";
                            cardWrapper = "bg-white border-2 border-green-400 shadow-[0_8px_30px_rgba(34,197,94,0.2)] ring-4 ring-green-50 scale-[1.02] z-10";
                        }

                        // Safely get assignees
                        const assigneesList = site.assginee || site.assignee || [];

                        return (
                            <motion.div
                                key={site.id}
                                whileHover={{ y: -4, scale: isToday ? 1.04 : 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                                onClick={() => navigate(`/orders/${site.order_id}`)}
                                className={`flex flex-col h-full relative overflow-hidden cursor-pointer transition-all duration-300 rounded-2xl ${cardWrapper}`}
                            >
                                {/* Top Color Accent Bar */}
                                <div className={`w-full shrink-0 ${topBarColor}`}></div>

                                {/* Content Wrapper - Uses flex layout to push footer down without overlapping */}
                                <div className="p-5 flex flex-col h-full gap-4">
                                    
                                    {/* Header: Order No & Date */}
                                    <div className="flex justify-between items-start gap-2 shrink-0">
                                        <div className="min-w-0">
                                            <h3 className="text-xl font-black text-gray-900 truncate flex items-center gap-2" title={site.order_no}>
                                                {site.order_no}
                                                {isToday && (
                                                    <span className="flex items-center gap-1 bg-green-500 text-white text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-md font-bold animate-pulse shadow-sm">
                                                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                                        Today
                                                    </span>
                                                )}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-sm font-medium">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="truncate">{site.location || "No Location"}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right shrink-0">
                                            <div className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${dateBadge}`}>
                                                {siteDate.toLocaleDateString("en-GB")}
                                            </div>
                                            <div className="text-xs font-bold text-gray-600 mt-1.5 bg-gray-50 px-2 py-1 rounded-md text-center border border-gray-100">
                                                {site.start_time} - {site.end_time}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle Section - Takes up available flexible space safely */}
                                    <div className="flex flex-col gap-3 flex-grow">
                                        {/* Assignees Section */}
                                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                            <div className="flex items-center gap-1.5 mb-2.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                                </svg>
                                                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Assigned Team</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {assigneesList.length > 0 ? (
                                                    assigneesList.map((person, idx) => (
                                                        <div key={idx} className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold px-2.5 py-1.5 rounded-lg shadow-sm">
                                                            <div className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-800 text-[10px] font-bold shrink-0">
                                                                {person.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span>{person}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="flex items-center gap-1.5 bg-red-50 border border-red-100 text-red-600 text-sm font-bold px-2.5 py-1.5 rounded-lg shadow-sm">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        Unassigned
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Description Section */}
                                        {site.description && site.description.trim() !== "" && (
                                            <div>
                                                <p className="text-xs text-gray-600 italic line-clamp-3 bg-yellow-50/50 border border-yellow-100/50 p-2.5 rounded-lg">
                                                    <span className="font-semibold text-yellow-700 not-italic mr-1">Note:</span>
                                                    "{site.description}"
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tech Details Box - Forced to bottom safely */}
                                    <div className="pt-3 border-t border-gray-100 shrink-0 mt-auto">
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-400 font-medium text-[11px] uppercase tracking-wider block mb-0.5">Capacity</span>
                                                <span className="font-semibold text-gray-800">{site.capacity} kW</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400 font-medium text-[11px] uppercase tracking-wider block mb-0.5">Solar Type</span>
                                                <span className="font-semibold text-gray-800">{site.solar_type || "N/A"}</span>
                                            </div>
                                            <div className="col-span-2 truncate">
                                                <span className="text-gray-400 font-medium text-[11px] uppercase tracking-wider block mb-0.5">Inverter & Panel</span>
                                                <span className="font-semibold text-gray-800 truncate block">
                                                    {site.inverter || "N/A"} • {site.panel_type || "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center h-full text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-lg font-medium italic">No active sites available.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="mt-auto shrink-0 z-20">
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 shadow-md rounded-t-2xl py-5 px-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-blue-200 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center bg-white/80 shadow-sm rounded-full p-2.5 border border-blue-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="text-gray-800 font-extrabold tracking-wide text-sm sm:text-base">
                            {currentDate}
                        </div>
                    </div>
                </div>
                <div className="h-[3px] bg-gradient-to-r from-indigo-400 via-blue-500 to-indigo-600 rounded-b-2xl"></div>
            </footer>
        </section>
    );
}

export default SiteCards;