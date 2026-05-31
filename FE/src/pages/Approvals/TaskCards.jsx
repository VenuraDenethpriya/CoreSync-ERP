import ReactDOM from "react-dom";
import React, { useEffect, useState, useMemo } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { fetchCardTasks } from "@/api/taskApi";
import { fetchUsersList } from "@/api/userApi";
import wsService from "@/api/ws";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@mui/material";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { createAuditLog } from "@/api/settingApi";
import AddUsage from "./Components/AddUsage";

function TaskCards() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [hoveredTaskId, setHoveredTaskId] = useState(null);

    useEffect(() => {
        const fetchWarehouseEmployees = async () => {
            try {
                const token = await getToken();
                const response = await fetchUsersList(token, "WAREHOUSE_STAFF", 100, 0);
                setEmployees(response?.data?.items || []);
            } catch (error) {
                console.error("Error fetching warehouse employees:", error);
            }
        };
        fetchWarehouseEmployees();
    }, [getToken]);

    const fetchTasks = async () => {
        try {
            const token = await getToken();
            const res = await fetchCardTasks(token, "", 100, 0);
            setTasks(res?.data?.tasks || []);
            setIsError(false);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            setIsError(true);
            setErrorMessage(error.message || "Failed to fetch tasks.");
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchTasks().finally(() => setIsLoading(false));
    }, [getToken]);

    useEffect(() => {
        const handleUpdate = (data) => {
            const taskData = data.data;
            if (!taskData || !taskData.task) return;

            if (data.type === "task.created") {
                setTasks((prev) => [taskData, ...prev]);
            } else if (data.type === "task.updated") {
                setTasks((prev) =>
                    prev.map((t) => (t.task.id === taskData.task.id ? taskData : t))
                );
            } else if (data.type === "task.deleted") {
                setTasks((prev) =>
                    prev.filter((t) => t.task.id !== taskData.task.id)
                );
            }
        };

        wsService.subscribe("tasks", handleUpdate);
        return () => wsService.unsubscribe("tasks", handleUpdate);
    }, []);

    const tasksByAssignee = useMemo(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const groupedTasks = {};
        tasks
            .filter(item => {
                const taskDate = new Date(item.task.date);

                return item.task.task !== "Cell Charge" &&
                    item.task.status !== "Completed" &&
                    taskDate < tomorrow;
            })
            .forEach((taskItem) => {
                const assigneeName = taskItem?.task?.assignee || 'Unassigned';
                if (!groupedTasks[assigneeName]) {
                    groupedTasks[assigneeName] = [];
                }
                groupedTasks[assigneeName].push(taskItem);
            });
        return groupedTasks;
    }, [tasks]);

    const currentDate = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const handleReportDownload = async (employeeName, assignedTasks) => {
        try {
            console.log(`Generating PDF for ${employeeName}...`);

            const doc = new jsPDF();

            doc.setFontSize(18);
            doc.text(`Task Report: ${employeeName}`, 14, 20);

            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
            doc.text(`Total Tasks: ${assignedTasks.length}`, 14, 34);

            const tableColumn = ["Date", "Time", "Order", "Task", "Description", "Status", "Items"];
            const tableRows = [];

            assignedTasks.forEach((data) => {
                const t = data.task;
                const items = data.items || [];

                const itemsString = items.length > 0
                    ? items.map(i => `${i.product_name} (x${i.quantity})`).join(", ")
                    : "None";

                const referenceNo = t.order_no ? `${t.type || ''}${t.order_no}` : (t.Job_no ? t.Job_no : "N/A");

                const taskRow = [
                    new Date(t.date).toLocaleDateString(),
                    t.time || "-",
                    // t.order_no ? `${t.type || ''}${t.order_no}` : "N/A",
                    referenceNo,
                    t.task,
                    t.description || "",
                    t.status,
                    itemsString
                ];
                tableRows.push(taskRow);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 40,
                theme: 'striped',
                headStyles: { fillColor: [66, 133, 244] },
                styles: { fontSize: 8, cellPadding: 3 },
                columnStyles: {
                    4: { cellWidth: 40 },
                    6: { cellWidth: 40 }
                }
            });

            const fileName = `${employeeName.replace(/\s+/g, '_')}_Report.pdf`;
            doc.save(fileName);
            console.log(`PDF saved as ${fileName}`);

            const token = await getToken();
            await createAuditLog(token, {
                action: "PDF Downloaded",
                status_code: 200,
                user: user.id,
                description: `${user.firstName} ${user.lastName} downloaded the task list for ${employeeName} on ${new Date().toLocaleDateString()} as a PDF file.`,
            });

        } catch (error) {
            console.error("PDF Generation failed:", error);
            alert("Failed to generate PDF. Check console for details.");
        }
    };

    if (isError) {
        return (
            <div className="text-red-500 text-center p-10">{errorMessage}</div>
        );
    }

    return (
        <section className="bg-gradient-to-br py-4 from-gray-50 to-gray-100 h-screen flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-3 bg-gradient-to-b from-gray-50 to-white flex-grow">
                {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-[380px] w-full rounded-2xl" />
                    ))
                ) : (
                    employees.slice(0, 8).map((employee) => {
                        const employeeFullName = `${employee.first_name} ${employee.last_name}`.trim();
                        const assignedTasks = tasksByAssignee[employeeFullName] || [];

                        return (
                            <motion.div
                                key={employee.id}
                                whileHover={{ scale: 1.02 }}
                                className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col relative min-h-[380px] z-0"
                            >
                                {/* Employee Header */}
                                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100">
                                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold uppercase">
                                        {employee.first_name?.charAt(0)}
                                        {employee.last_name?.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">{employeeFullName}</h3>
                                        <p className="text-xs text-gray-500">Assigned Tasks: {assignedTasks.length}</p>
                                    </div>
                                    <div>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            className="text-xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleReportDownload(employeeFullName, assignedTasks);
                                            }}
                                            disabled={assignedTasks.length === 0}
                                        >
                                            Report
                                        </Button>
                                    </div>
                                </div>

                                {/* Task List */}
                                <div className="flex-grow overflow-y-auto px-4 py-3 space-y-3">
                                    {assignedTasks.length > 0 ? (
                                        assignedTasks.map(({ task, items }) => {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            const taskDate = new Date(task.date);
                                            const isOverdue = taskDate < today;

                                            // Determine background color by task status
                                            let cardClasses = "";
                                            if (isOverdue) {
                                                cardClasses = "bg-red-50 border-red-200 hover:bg-red-100";
                                            } else if (task.status?.toLowerCase() === "in progress") {
                                                cardClasses = "bg-yellow-50 border-yellow-200 hover:bg-yellow-100";
                                            } else if (task.status?.toLowerCase() === "completed") {
                                                cardClasses = "bg-green-50 border-green-200 hover:bg-green-100";
                                            } else {
                                                cardClasses = "bg-blue-50 border-blue-200 hover:bg-blue-100";
                                            }

                                            const isHovered = hoveredTaskId === task.id;

                                            return (
                                                <motion.div
                                                    key={task.id}
                                                    onMouseEnter={() => setHoveredTaskId(task.id)}
                                                    onMouseLeave={() => setHoveredTaskId(null)}
                                                    whileHover={{ scale: 1.03 }}
                                                    className={`relative p-3 rounded-xl border ${cardClasses} cursor-pointer transition-all duration-200 ${isHovered ? 'z-10' : 'z-0'}`}
                                                >
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="flex gap-x-2">
                                                            <p className="font-medium text-gray-800 truncate">{task.task}</p>
                                                            {/* Order Badge (Blue) */}
                                                            {task.order_no ? (
                                                                <span className="text-xs font-medium bg-white/60 px-2 py-0.5 rounded-md text-blue-700 border border-blue-200">
                                                                    {task.type}{task.order_no}
                                                                </span>
                                                            ) :
                                                                /* Job Badge */
                                                                task.Job_no ? (
                                                                    <span className="flex items-center text-xs font-medium bg-purple-50 px-1.5 py-0.5 rounded-md text-purple-700 border border-purple-200 shadow-sm">
                                                                        <span className="flex items-center justify-center w-3.5 h-3.5 bg-purple-600 text-white rounded-full text-[9px] font-bold mr-1.5">
                                                                            R
                                                                        </span>
                                                                        {task.Job_no}
                                                                    </span>
                                                                ) : null}
                                                        </div>

                                                        <div className="flex flex-col items-end leading-tight">
                                                            {task.time?.includes("-") ? (
                                                                task.time.split("-").map((t, i) => (
                                                                    <span key={i} className="text-xs font-semibold text-gray-700 block">
                                                                        {t.trim()}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-xs font-semibold text-gray-700">
                                                                    {task.time?.substring(0, 5)}
                                                                </span>
                                                            )}
                                                        </div>

                                                    </div>

                                                    <p className="text-sm text-gray-700 mt-2 truncate">
                                                        {task.description || "No description"}
                                                    </p>

                                                    {/* Hover Expanded View */}
                                                    <AnimatePresence>
                                                        {isHovered && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="absolute top-0 left-0 w-full z-50 flex justify-center pointer-events-none"
                                                            >
                                                                <div
                                                                    onMouseEnter={() => setHoveredTaskId(task.id)}
                                                                    onMouseLeave={() => setHoveredTaskId(null)}
                                                                    className="pointer-events-auto w-[320px] bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl p-5 flex flex-col gap-3 relative"
                                                                    style={{
                                                                        boxShadow:
                                                                            "0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0,0,0,0.1)",
                                                                        border: "1px solid rgba(255, 255, 255, 0.3)",
                                                                    }}
                                                                >
                                                                    {/* Header */}
                                                                    <div className="flex justify-between items-start">
                                                                        <h4 className="text-gray-900 font-semibold text-base truncate">
                                                                            {task.task}
                                                                        </h4>
                                                                        {/* Order Badge with Usage */}
                                                                        {task.order_no ? (
                                                                            <span className="flex items-center gap-x-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                                                                {task.type}{task.order_no}
                                                                                <AddUsage type="order" orderData={task} onUpdate={fetchTasks} />
                                                                            </span>
                                                                        ) :
                                                                            /* Job Badge with Usage */
                                                                            task.Job_no ? (
                                                                                <span className="flex items-center gap-x-2 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-200 shadow-sm">
                                                                                    <div className="flex items-center">
                                                                                        <span className="flex items-center justify-center w-4 h-4 bg-purple-600 text-white rounded-full text-[10px] font-bold mr-1.5 shadow-inner">
                                                                                            R
                                                                                        </span>
                                                                                        {task.Job_no}
                                                                                    </div>
                                                                                    <AddUsage type="job" jobData={task} onUpdate={fetchTasks} />
                                                                                </span>
                                                                            ) : null}
                                                                    </div>

                                                                    {/* Description */}
                                                                    <p className="text-gray-700 text-sm line-clamp-4">
                                                                        {task.description || "No description provided."}
                                                                    </p>

                                                                    {/* Items */}
                                                                    {items && items.length > 0 && (
                                                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                                                            <h5 className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1">
                                                                                <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                                                                Items
                                                                            </h5>
                                                                            <ul className="space-y-1 text-gray-700 text-sm">
                                                                                {items.map((item, index) => (
                                                                                    <li key={index} className="flex justify-between items-center">
                                                                                        <span>{item.product_name}</span>
                                                                                        <span className="font-medium text-gray-900">x{item.quantity}</span>
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}


                                                                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-100/30 via-purple-100/20 to-pink-100/30 blur-xl -z-10" />
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center text-gray-500 py-12 text-sm italic">
                                            No tasks assigned.
                                        </div>
                                    )}
                                </div>

                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <footer className="mt-auto">
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 shadow-md rounded-t-2xl py-5 px-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-blue-200 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-sm rounded-full p-2.5 border border-blue-100">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-indigo-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <div className="text-gray-800 font-semibold tracking-wide text-sm sm:text-base">
                            {currentDate}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <span className="font-semibold text-gray-800 flex items-center gap-1 text-sm sm:text-base">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span className="hidden sm:inline">Cell Charge Assignees:</span>
                            <span className="sm:hidden">Assignees:</span>
                        </span>

                        <div className="flex flex-wrap gap-2">
                            {(() => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);

                                const todayCellChargeTasks = tasks.filter((item) => {
                                    if (!item?.task?.date || !item?.task?.task) return false;
                                    const taskDate = new Date(item.task.date);
                                    taskDate.setHours(0, 0, 0, 0);
                                    return (
                                        item.task.task === "Cell Charge" &&
                                        taskDate.getTime() === today.getTime()
                                    );
                                });

                                return todayCellChargeTasks.length > 0 ? (
                                    todayCellChargeTasks.map((item, index) => (
                                        <div
                                            key={index}
                                            className="group relative px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-full shadow-sm hover:shadow-md transition-all duration-300"
                                        >
                                            <strong>{item.task.assignee || "Unassigned"}</strong>:{" "}
                                            {item.task.description || "No description"}
                                            <div className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition duration-300"></div>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-gray-500 italic text-sm">None</span>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                <div className="h-[3px] bg-gradient-to-r from-indigo-400 via-blue-500 to-indigo-600 rounded-b-2xl"></div>
            </footer>



        </section>
    );
}

export default TaskCards;
