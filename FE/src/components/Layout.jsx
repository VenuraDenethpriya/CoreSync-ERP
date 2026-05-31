import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper
} from "@mui/material";
import { UserButton } from "@clerk/clerk-react";

import {
  LuLayoutDashboard,
  LuClipboardList,
  LuPackage,
  LuTrendingUp,
  LuFileText,
  LuFileCheck,
  LuUsers,
  LuUserCog,
  LuUser,
} from "react-icons/lu";
import { GoStack } from "react-icons/go";

import Sidebar, { SidebarItem } from "./SideBar";
import { Toaster } from "@/components/ui/sonner";
import { LucideReceipt, LucideToolCase } from "lucide-react";


const Layout = () => {
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();
  const navigate = useNavigate();
  const [isHrOpen, setIsHrOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/") return "/";
    if (path.startsWith("/inventory")) return "/inventory";
    if (path.startsWith("/products")) return "/products";
    if (path.startsWith("/quotes")) return "/quotes";
    if (path.startsWith("/orders")) return "/orders";
    return "/";
  };

  return (
    <div className="flex min-h-screen bg-[#eee] w-full overflow-x-hidden">
      <Toaster />

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="h-screen sticky top-0 z-50">
          <Sidebar expanded={expanded} setExpanded={setExpanded}>
            <SidebarItem icon={<LuLayoutDashboard size={20} />} text="Dashboard" to="/" />
            <SidebarItem icon={<LuClipboardList size={20} />} text="Inventory" to="/inventory" />
            <SidebarItem icon={<LuPackage size={20} />} text="Products" to="/products" />
            <SidebarItem icon={<LuFileText size={20} />} text="Quotes" to="/quotes" />
            <SidebarItem icon={<GoStack size={20} />} text="Orders" to="/orders" />
            <SidebarItem icon={<LuFileCheck size={20} />} text="Approvals" to="/approvals" />
            <SidebarItem icon={<LuTrendingUp size={20} />} text="Sales" to="/sales" />
            <SidebarItem icon={<LucideToolCase size={20} />} text="Repairs" to="/repairs" />
            <SidebarItem icon={<LucideReceipt size={20} />} text="Reports" to="/reports" />
            <SidebarItem icon={<LuUsers size={20} />} text="Customers" to="/customers" />

            <SidebarItem
              icon={<LuUser size={20} />}
              text="Human Resources"
              onClick={() => setIsHrOpen(!isHrOpen)}
            >
              {/* FIX: Only render this div if the sidebar is expanded OR if the menu is actively open */}
              {(expanded || isHrOpen) && (
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isHrOpen
                      ? "max-h-96 opacity-100 mt-2"
                      : "max-h-0 opacity-0"
                    }`}
                >
                  <ul className="flex flex-col gap-1 pl-2">
                    {[
                      { label: "Talent Pool", path: "/hr/talent-pool" },
                      { label: "Interview Tracker", path: "/hr/interviews-tracker" },
                      { label: "Employees", path: "/hr/employees" },
                      { label: "Leave", path: "/hr/leave" },
                      { label: "Payroll", path: "/hr/payroll" },
                      { label: "Letters", path: "/hr/letters" },
                    ].map((item) => (
                      <li
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setIsHrOpen(false);
                        }}
                        className={`
                          group relative flex items-center gap-3
                          px-4 py-2.5 rounded-xl cursor-pointer
                          text-sm font-medium text-gray-600
                          transition-all duration-200
                          hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50
                          hover:text-indigo-700 hover:shadow-sm
                          hover:translate-x-1
                          ${expanded ? "ml-4" : "justify-center"}
                        `}
                      >
                        {/* Left active indicator */}
                        <span className="absolute left-0 top-1/2 h-0 w-1 rounded-full bg-indigo-600 transition-all duration-200 group-hover:h-5 -translate-y-1/2"></span>

                        {/* Text */}
                        <span>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </SidebarItem>
            <SidebarItem icon={<LuUserCog size={20} />} text="Users" to="/users" />
          </Sidebar>
        </div>
      )}

      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${isMobile ? "ml-0 pb-24" : expanded ? "ml-[260px]" : "ml-8"
          }`}
      >
        {isMobile && (
          <div className="sticky top-0 z-[100] flex items-center justify-between bg-white p-4  shadow-sm">
            <h1 className="font-bold text-xl text-blue-800">RIMS</h1>
            <UserButton afterSignOutUrl="/login" />
          </div>
        )}

        <div className={``}>
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            borderTop: '1px solid #e5e7eb'
          }}
          elevation={10}
        >
          <BottomNavigation
            showLabels
            value={getActiveTab()}
            onChange={(event, newValue) => {
              navigate(newValue);
            }}
            sx={{
              height: 70,
              pb: 1,
              '& .Mui-selected': {
                color: '#1e40af !important',
                '& .MuiBottomNavigationAction-label': {
                  fontWeight: 800,
                  fontSize: '12px',
                  mt: 0.5
                },
                '& svg': {
                  transform: 'scale(1.2)',
                  transition: 'transform 0.2s ease-in-out'
                }
              },
              '& .MuiBottomNavigationAction-root': {
                color: '#6b7280',
              }
            }}
          >
            <BottomNavigationAction
              label="Home"
              value="/"
              icon={<LuLayoutDashboard size={22} />}
            />
            <BottomNavigationAction
              label="Stock"
              value="/inventory"
              icon={<LuClipboardList size={22} />}
            />
            <BottomNavigationAction
              label="Products"
              value="/products"
              icon={<LuPackage size={22} />}
            />
            <BottomNavigationAction
              label="Quotes"
              value="/quotes"
              icon={<LuFileText size={22} />}
            />
            <BottomNavigationAction
              label="Orders"
              value="/orders"
              icon={<GoStack size={22} />}
            />
          </BottomNavigation>
        </Paper>
      )}
    </div>
  );
};

export default Layout;