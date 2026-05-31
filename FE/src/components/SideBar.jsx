import {
  LuChevronsRight,
  LuChevronsLeft,
} from "react-icons/lu";
import logoExpanded from "../assets/logo-long.jpg";
import logoCollapsed from "../assets/logo.png";
import { createContext, useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserButton, SignedIn, useUser } from "@clerk/clerk-react";

export const SidebarContext = createContext();

export default function Sidebar({ children, expanded, setExpanded }) {
  const { user } = useUser();

  return (
    <aside className="fixed h-screen">
      <nav className="h-full flex flex-col bg-white border-r shadow-sm">

        <div className="p-4 pb-6 pt-6 flex justify-between items-center">
          <img
            src={expanded ? logoExpanded : logoCollapsed}
            className={`overflow-hidden transition-all ${
              expanded ? "w-40" : "w-10"
            }`}
            alt="Logo"
          />
        </div>

        <hr className="mb-3" />

        {/* Sidebar Items Context */}
        {/* <SidebarContext.Provider value={{ expanded }}> */}
        <SidebarContext.Provider value={{ expanded, setExpanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>

        {/* Footer Section with Clerk UserButton */}
        <SignedIn>
          <div className="border-t flex p-4 items-center">
            <UserButton afterSignOutUrl="/" />
            {expanded && (
              <div className="ml-3 leading-4">
                <h4 className="font-semibold">{user?.fullName}</h4>
                <span className="text-xs text-gray-600">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            )}
          </div>
        </SignedIn>
      </nav>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setExpanded((curr) => !curr)}
        className="absolute top-4 right-[-20px] p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 shadow"
      >
        {expanded ? <LuChevronsLeft /> : <LuChevronsRight />}
      </button>
    </aside>
  );
}

// export function SidebarItem({ icon, text, alert, to, children, onClick }) {
//   const { expanded } = useContext(SidebarContext);
//   const location = useLocation();
//   const navigate = useNavigate();
  
//   const isActive = to ? location.pathname === to : false;

//   const handleLogout = async (e) => {
//     e.preventDefault();
//     navigate("/login");
//   };

//   const ItemContent = (
//     <>
//       {icon}
//       <span
//         className={`overflow-hidden transition-all ${
//           expanded ? "w-52 ml-3" : "w-0"
//         }`}
//       >
//         {text}
//       </span>
//     </>
//   );

//   return (
//     <li
//       className={`relative flex flex-col py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${
//         isActive
//           ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
//           : "hover:bg-indigo-50 text-gray-600"
//       }`}
//       // Fire the passed onClick function, or handle logout
//       onClick={(e) => {
//         if (text === "Logout") {
//           handleLogout(e);
//           return;
//         }
//         if (onClick) onClick(e);
//       }}
//     >
//       {to ? (
//         <Link to={to} className="flex items-center w-full">
//           {ItemContent}
//         </Link>
//       ) : (
//         <div className="flex items-center w-full">
//           {ItemContent}
//         </div>
//       )}

//       {children && (
//         <div 
//           className={`mt-1 ${expanded ? "block" : "hidden"}`}
//           // Prevents clicks on sub-items from closing the menu
//           onClick={(e) => e.stopPropagation()} 
//         >
//           {children}
//         </div>
//       )}

//       {alert && (
//         <div
//           className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${
//             expanded ? "" : "top-2"
//           }`}
//         />
//       )}

//       {!expanded && (
//         <div
//           className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-20 -translate-x-3 z-50 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 shadow-md lg:block hidden`}
//           style={{ whiteSpace: "nowrap" }}
//         >
//           {text}
//         </div>
//       )}
//     </li>
//   );
// }

export function SidebarItem({ icon, text, alert, to, children, onClick }) {
  const { expanded } = useContext(SidebarContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = to ? location.pathname === to : false;

  const handleLogout = async (e) => {
    e.preventDefault();
    navigate("/login");
  };

  const ItemContent = (
    <>
      {icon}
      <span
        className={`overflow-hidden whitespace-nowrap transition-all ${
          expanded ? "w-52 ml-3" : "w-0"
        }`}
      >
        {text}
      </span>
    </>
  );

  return (
    <li
      className={`relative flex flex-col py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${
        isActive
          ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
          : "hover:bg-indigo-50 text-gray-600"
      }`}
      onClick={(e) => {
        if (text === "Logout") {
          handleLogout(e);
          return;
        }
        if (onClick) onClick(e);
      }}
    >
      {to ? (
        <Link to={to} className="flex items-center w-full">
          {ItemContent}
        </Link>
      ) : (
        <div className="flex items-center w-full">
          {ItemContent}
        </div>
      )}

      {/* Sub-menu rendering logic */}
      {children && (
        <div 
          className={
            expanded 
              ? "mt-1 block" 
              : "absolute left-full top-0 ml-4 bg-white border border-gray-200 shadow-xl rounded-lg py-2 w-48 z-[999]" // Floating flyout menu when collapsed
          }
          onClick={(e) => e.stopPropagation()} 
        >
          {children}
        </div>
      )}

      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${
            expanded ? "" : "top-2"
          }`}
        />
      )}

      {/* Hide the hover tooltip if the flyout menu is currently open */}
      {!expanded && !children && (
        <div
          className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-20 -translate-x-3 z-50 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 shadow-md lg:block hidden`}
          style={{ whiteSpace: "nowrap" }}
        >
          {text}
        </div>
      )}
    </li>
  );
}