import { Button } from "@/components/ui/button";
import { useState } from "react";
import { OrderTable } from "./Components/TableCard.page";
import { PackTable } from "./Components/PackTableCard.page";
import { TaskTable } from "./Components/TaskTableCard.page";
import { SiteTable } from "./Components/SiteTableCard.page";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { LockIcon, Plus } from "lucide-react";
import { Roles } from "@/const/const";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Approvals = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("approvals");
  const [activeSubTab, setActiveSubTab] = useState("orders");
  const [exportData, setExportData] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // NAVIGATION HANDLERS
  const handleNewTask = () => navigate("/users/add-task");
  const handleNewSite = () => navigate("/approvals/site/add-site");

  const handleTaskCards = () => {
    setIsAnimating(true);
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    setTimeout(() => navigate("task-cards"), 300);
  };

  const handleSiteCards = () => {
    setIsAnimating(true);
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    setTimeout(() => navigate("site-cards"), 300);
  };

  // if (user?.publicMetadata?.role === Roles.SALES_TEAM || user?.publicMetadata?.role === Roles.HR_HEAD) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[70vh] w-full px-4">
  //       <div className="bg-white shadow-sm rounded-2xl p-8 max-w-md text-center border border-red-100">
  //         <div className="flex flex-col items-center justify-center gap-3">
  //           <LockIcon className="w-12 h-12 text-red-500" />
  //           <h1 className="text-xl font-bold text-gray-800">Access Denied</h1>
  //           <p className="text-sm text-gray-500">
  //             You are not authorized to access this page. Please contact your
  //             administrator if you believe this is a mistake.
  //           </p>
  //           <Button
  //             className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm"
  //             onClick={() => navigate("/")}
  //           >
  //             Go to Dashboard
  //           </Button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  const tabTriggerClass = "rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm";
  const subTabTriggerClass = "rounded-xl px-4 py-2 text-xs font-bold transition-all text-slate-600 hover:text-slate-900 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm";

  return (
    <div className="w-full space-y-6">

      {/* --- HEADER SECTION --- */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight truncate">
            {activeTab === "approvals" && "Approvals Management"}
            {activeTab === "task" && "Tasks Management"}
            {activeTab === "site" && "Sites Management"}
          </h1>
          {/* <p className="text-sm text-slate-500 mt-1">
            {activeTab === "approvals" && "Review and approve pending system orders and packs."}
            {activeTab === "task" && "Manage team tasks and assignments."}
            {activeTab === "site" && "Manage project sites and operational locations."}
          </p> */}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {activeTab === "task" && (
            <Button onClick={handleNewTask} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm h-10 px-4">
              <Plus className="w-4 h-4 mr-2" /> New Task
            </Button>
          )}
          {activeTab === "site" && (
            <Button onClick={handleNewSite} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm h-10 px-4">
              <Plus className="w-4 h-4 mr-2" /> New Site
            </Button>
          )}
        </div>
      </div>

      {/* --- TABS SECTION --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-1 mb-4">
          <TabsList className="inline-flex gap-2 min-w-max border-b border-slate-200/70 bg-transparent h-auto p-0">
            <TabsTrigger value="approvals" className={tabTriggerClass}>Approvals</TabsTrigger>
            <TabsTrigger value="task" className={tabTriggerClass}>Tasks</TabsTrigger>
            <TabsTrigger value="site" className={tabTriggerClass}>Sites</TabsTrigger>
          </TabsList>
        </div>

        {/* --- TAB CONTENTS --- */}

        {/* Approvals (Nested Tabs) */}
        <TabsContent value="approvals" className="mt-0 outline-none w-full space-y-4">
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
            <div className="flex gap-2 bg-slate-100/80 p-1.5 rounded-2xl w-fit border border-slate-200/70 mb-4">
              <TabsList className="bg-transparent h-auto p-0 gap-1">
                <TabsTrigger value="orders" className={subTabTriggerClass}>Orders</TabsTrigger>
                <TabsTrigger value="packs" className={subTabTriggerClass}>Packs</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="orders" className="w-full mt-0 outline-none">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-2">
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[850px] p-2">
                    <OrderTable setExportData={setExportData} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="packs" className="w-full mt-0 outline-none">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-2">
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[850px] p-2">
                    <PackTable setExportData={setExportData} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Tasks */}
        <TabsContent value="task" className="mt-0 outline-none w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-2">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[850px] p-2">
                <TaskTable handleTaskCards={handleTaskCards} setExportData={setExportData} isAnimating={isAnimating} />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Sites */}
        <TabsContent value="site" className="mt-0 outline-none w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-2">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[850px] p-2">
                <SiteTable handleSiteCards={handleSiteCards} setExportData={setExportData} isAnimating={isAnimating} />
              </div>
            </div>
          </div>
        </TabsContent>

      </Tabs>

    </div>
  );
};

export default Approvals;