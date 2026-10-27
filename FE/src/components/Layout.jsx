import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper
} from "@mui/material";
import { UserButton, useUser } from "@clerk/clerk-react";

import {
  LayoutDashboard,
  Boxes,
  Package,
  FileSignature,
  ShoppingCart,
  ClipboardCheck,
  TrendingUp,
  Wrench,
  PieChart,
  Wallet,
  Users,
  Briefcase,
  UserCog,
  Contact,
  Cog,
  ClipboardList, // [ADDED 2026-10-13]
} from "lucide-react";

import Sidebar, { SidebarItem } from "./SideBar";
import { Toaster } from "@/components/ui/sonner";
import { Roles } from "@/const/const";

const Layout = () => {
  const [expanded, setExpanded] = useState(true);
  const { user, isLoaded } = useUser();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();
  const navigate = useNavigate();
  const [isHrOpen, setIsHrOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setExpanded(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/") return "/";
    if (path.startsWith("/inventory")) return "/inventory";
    if (path.startsWith("/stock-control")) return "/stock-control"; // [ADDED 2026-10-13]
    if (path.startsWith("/products")) return "/products";
    if (path.startsWith("/quotes")) return "/quotes";
    if (path.startsWith("/orders")) return "/orders";
    if (path.startsWith("/approvals")) return "/approvals";
    if (path.startsWith("/productions")) return "/productions";
    if (path.startsWith("/sales")) return "/sales";
    if (path.startsWith("/myinfo")) return "/myinfo";
    return "/";
  };

  const hrMenuItems = [
    { label: "Talent Pool", path: "/hr/talent-pool" },
    { label: "Interview Tracker", path: "/hr/interviews-tracker" },
    { label: "Employees Database", path: "/hr/employees" },
    { label: "Leave", path: "/hr/leave" },
    { label: "Payroll", path: "/hr/payroll" },
    { label: "Letters", path: "/hr/letters" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f3f4f6] w-full overflow-x-hidden">
      <Toaster />

      {/* --- DESKTOP SIDEBAR --- */}
      {!isMobile && (
        <div className="h-screen sticky top-0 z-[60]">
          <Sidebar expanded={expanded} setExpanded={setExpanded}>
            <div
              className={`custom-scrollbar w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${expanded
                ? "overflow-y-auto overflow-x-hidden h-[calc(100vh-160px)] pb-4"
                : "overflow-visible h-full"
                }`}
            >
              <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" to="/" />
              <SidebarItem icon={<Boxes size={20} />} text="Inventory" to="/inventory" />
              {/* [ADDED 2026-10-13] */}
              <SidebarItem icon={<ClipboardList size={20} />} text="Stock Control" to="/stock-control" />
              <SidebarItem icon={<Package size={20} />} text="Products" to="/products" />
              <SidebarItem icon={<FileSignature size={20} />} text="Quotes" to="/quotes" />
              <SidebarItem icon={<ShoppingCart size={20} />} text="Orders" to="/orders" />
              <SidebarItem icon={<ClipboardCheck size={20} />} text="Approvals" to="/approvals" />
              <SidebarItem icon={<Cog size={20} />} text="Production" to="/productions" />
              <SidebarItem icon={<TrendingUp size={20} />} text="Sales" to="/sales" />
              <SidebarItem icon={<Wrench size={20} />} text="Repairs" to="/repairs" />
              <SidebarItem icon={<PieChart size={20} />} text="Reports" to="/reports" />
              <SidebarItem icon={<Wallet size={20} />} text="Finance" to="/finance" />
              {/* --- HR SUBMENU --- */}
              <div
                onMouseLeave={() => !expanded && setIsHrOpen(false)}
                className="relative"
              >
                <SidebarItem
                  icon={<Briefcase size={20} />}
                  text="Human Resources"
                  onClick={() => setIsHrOpen(!isHrOpen)}
                >
                  {expanded && (
                    <div className={`relative overflow-hidden transition-all duration-300 ease-in-out ${isHrOpen ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                      <ul className="flex flex-col gap-1 pl-2 pb-2">
                        {hrMenuItems.map((item) => (
                          <li
                            key={item.path}
                            onClick={(e) => { e.stopPropagation(); navigate(item.path); setIsHrOpen(false); }}
                            className="group relative flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 ml-4"
                          >
                            <span className="absolute left-0 top-1/2 h-0 w-1 rounded-full bg-blue-600 transition-all duration-200 group-hover:h-5 -translate-y-1/2"></span>
                            <span className="whitespace-nowrap">{item.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </SidebarItem>

                {!expanded && isHrOpen && (
                  <div className="absolute left-full top-0 pl-2 w-56 z-[100]">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 py-2 w-full">
                      <ul className="flex flex-col gap-1 px-2">
                        {hrMenuItems.map((item) => (
                          <li
                            key={item.path}
                            onClick={(e) => { e.stopPropagation(); navigate(item.path); setIsHrOpen(false); }}
                            className="group relative flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 ml-0"
                          >
                            <span className="absolute left-0 top-1/2 h-0 w-1 rounded-full bg-blue-600 transition-all duration-200 group-hover:h-5 -translate-y-1/2"></span>
                            <span className="whitespace-nowrap">{item.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              <SidebarItem icon={<Users size={20} />} text="Customers" to="/customers" />
              <SidebarItem icon={<UserCog size={20} />} text="Users" to="/users" />
              <SidebarItem icon={<Contact size={20} />} text="My Info" to="/myinfo" />
            </div>
          </Sidebar>
        </div>
      )}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out min-w-0 flex flex-col 
          ${isMobile
            ? "ml-0 pb-24 px-4 pt-4"
            : expanded
              ? "ml-[280px] p-6 lg:p-8"
              : "ml-[72px] p-6 lg:p-8"
          }
        `}
      >
        {isMobile && (
          <div className="sticky top-0 z-[50] flex items-center justify-between bg-white p-4 shadow-sm border-b border-slate-200 -mx-4 -mt-4 mb-6">
            <h1 className="font-bold text-xl text-blue-800 tracking-tight">CoreSync</h1>
            <UserButton afterSignOutUrl="/login" />
          </div>
        )}

        <div className="w-full max-w-[1600px] mx-auto flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>

      {isMobile && isLoaded && (
        <Paper
          sx={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            width: '100%', zIndex: 9999, borderTop: '1px solid #e5e7eb',
            boxSizing: 'border-box'
          }}
          elevation={10}
        >
          <BottomNavigation
            showLabels
            value={getActiveTab()}
            onChange={(event, newValue) => navigate(newValue)}
            sx={{
              height: 70, width: '100%', pb: 1,
              '& .Mui-selected': {
                color: '#1d4ed8 !important',
                '& .MuiBottomNavigationAction-label': { fontWeight: 800, fontSize: '11px', mt: 0.5 },
                '& svg': { transform: 'scale(1.2)', transition: 'transform 0.2s ease-in-out' }
              },
              '& .MuiBottomNavigationAction-root': {
                color: '#64748b', minWidth: '50px', maxWidth: '100%', padding: '6px 2px',
                '& .MuiBottomNavigationAction-label': { fontSize: '10px' }
              }
            }}
          >
            {user && user?.publicMetadata?.role !== Roles.INVENTORY_MANAGER && (
              <BottomNavigationAction label="Home" value="/" icon={<LayoutDashboard size={20} />} />
            )}
            <BottomNavigationAction label="Stock" value="/inventory" icon={<Boxes size={20} />} />
            <BottomNavigationAction label="Products" value="/products" icon={<Package size={20} />} />
            {user && user?.publicMetadata?.role !== Roles.INVENTORY_MANAGER && (
              <BottomNavigationAction label="Quotes" value="/quotes" icon={<FileSignature size={20} />} />
            )}
            <BottomNavigationAction label="Orders" value="/orders" icon={<ShoppingCart size={20} />} />

            {user && user?.publicMetadata?.role === Roles.INVENTORY_MANAGER && (
              <BottomNavigationAction label="Approvals" value="/approvals" icon={<ClipboardCheck size={20} />} />
            )}
            {user && user?.publicMetadata?.role === Roles.INVENTORY_MANAGER && (
              <BottomNavigationAction label="Production" value="/productions" icon={<Cog size={20} />} />
            )}

            {user && user?.publicMetadata?.role === Roles.SUPER_ADMIN || user?.publicMetadata?.role === Roles.SALES_TEAM || user?.publicMetadata?.role === Roles.SALES_HEAD ? (
              <BottomNavigationAction label="Sales" value="/sales" icon={<TrendingUp size={20} />} />
            ) : null
            }

            <BottomNavigationAction label="My Info" value="/myinfo" icon={<Contact size={20} />} />
          </BottomNavigation>
        </Paper>
      )}
    </div>
  );
};

export default Layout;