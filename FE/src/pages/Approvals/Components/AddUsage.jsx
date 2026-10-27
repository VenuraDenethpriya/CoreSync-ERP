// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//     Dialog,
//     DialogClose,
//     DialogContent,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { PlusCircle, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
// import { createInventoryUsage, fetchInventoryItemByCode } from "@/api/inventoryApi";
// import { useAuth, useUser } from "@clerk/clerk-react";
// import { createRepairItemUsage } from "@/api/repair";

// function AddUsage({ onUpdate, ...props }) {
//     const { getToken } = useAuth();
//     const { user } = useUser();
//     const userID = user?.id;
//     const [scannedItems, setScannedItems] = useState([]);
//     const [currentScan, setCurrentScan] = useState("");
//     const [isOpen, setIsOpen] = useState(false);
    
//     const [notification, setNotification] = useState(null);
//     const [submissionResult, setSubmissionResult] = useState(null);

//     const showNotification = (type, text) => {
//         setNotification({ type, text });
//         if (type === "error") {
//             setTimeout(() => setNotification(null), 3000);
//         }
//     };

//     const handleBarcodeScan = async (e) => {
//         const code = e.target.value.trim().toUpperCase();
//         if (!code) return;

//         setCurrentScan("");

//         try {
//             const token = await getToken();
//             const response = await fetchInventoryItemByCode(token, code);

//             if (response?.message === "This item already used") {
//                 showNotification("error", "This item already used");
//                 return;
//             }
//             if (response?.message === "record not found") {
//                 showNotification("error", "Item not found for code: " + code);
//                 return;
//             }

//             const matchedItem = response?.data;

//             if (!matchedItem) {
//                 showNotification("error", "Item not found for code: " + code);
//                 return;
//             }

//             const exists = scannedItems.find(item => item.id === matchedItem.id);

//             if (exists) {
//                 setScannedItems(prev =>
//                     prev.map(item =>
//                         item.id === matchedItem.id ? { ...item, quantity: item.quantity + 1 } : item
//                     )
//                 );
//             } else {
//                 setScannedItems(prev => [
//                     ...prev,
//                     {
//                         id: matchedItem.id,
//                         code: matchedItem.item_code,
//                         name: matchedItem.item_name,
//                         quantity: 1,
//                         user: userID,
//                     }
//                 ]);
//             }
//         } catch (error) {
//             console.error("Error scanning barcode:", error);
//             if (error.response?.data?.message === "This item already used") {
//                 showNotification("error", "This item already used");
//             } else {
//                 showNotification("error", "Error scanning barcode. Please try again.");
//             }
//         }
//     };

//     const handleRemoveItem = (id) => {
//         setScannedItems(prev => prev.filter(item => item.id !== id));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const token = await getToken();
//             let response;

//             if (props.type === "order") {
//                 const usageData = scannedItems.map(item => ({
//                     item_id: item.id,
//                     order_id: props.orderData.order_id || props.orderData.id,
//                     user_name: userID,
//                 }));
//                 response = await createInventoryUsage(token, { usages: usageData });
//             } 
//             else if (props.type === "job") {
//                 const usageData = scannedItems.map(item => ({
//                     item_id: item.id,
//                     repair_id: props.jobData.Job_id || props.jobData.repair_id || props.jobData.id,
//                     user_name: userID,
//                 }));
//                 response = await createRepairItemUsage(token, { repair_usages: usageData });
//             }
//             else if (props.type === "pack") {
//                 const usageData = scannedItems.map(item => ({
//                     item_id: item.id,
//                     pack_id: props.packData.Pack_id,
//                     user_name: userID,
//                 }));
//                 response = await createInventoryUsage(token, { usages: usageData });
//             }

//             if (response && (response.message === "success" || response.status === "success" || response.status === 200 || response.status === 201)) {
//                 const addedItemsList = response.data || [];
                
//                 const totalScanned = scannedItems.reduce((acc, item) => acc + item.quantity, 0);
//                 const totalAdded = addedItemsList.length;

//                 setSubmissionResult({
//                     totalScanned,
//                     totalAdded,
//                     addedCodes: addedItemsList.map(item => item.item_code).filter(Boolean)
//                 });
                
//                 if (onUpdate) {
//                     onUpdate();
//                 }

//             } else {
//                 showNotification("error", `Error: ${response?.message || "Failed to submit"}`);
//             }

//         } catch (error) {
//             console.error("Error submitting usage data:", error);
//             showNotification("error", "An unexpected error occurred.");
//         }
//     };

//     return (
//         <Dialog open={isOpen} onOpenChange={(open) => {
//             setIsOpen(open);
//             if (!open) {
//                 setNotification(null); 
//                 setSubmissionResult(null);
//                 setScannedItems([]);
//                 setCurrentScan("");
//             }
//         }}>
//             <DialogTrigger asChild>
//                 <button className="flex items-center text-blue-600 hover:underline cursor-pointer mt-1 gap-x-1">
//                     <PlusCircle size={12} />
//                     <span className="text-xs">Add</span>
//                 </button>
//             </DialogTrigger>
            
//             <DialogContent className="sm:max-w-[700px]">
//                 <DialogHeader className="pb-4">
//                     <DialogTitle>
//                         {props.type === "order"
//                             ? `Item usage for ${props.orderData?.type || props?.order_type || ""}${props.orderData?.order_no || props?.order_no || ""}`
//                             : (props.type === "job")
//                                 ? `Item usage for ${props.jobData?.Job_no}`
//                                 : "Add usage"
//                         }
//                     </DialogTitle>
//                 </DialogHeader>

//                 {submissionResult ? (
//                     <div className="flex flex-col gap-4 py-2">
//                         <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 border border-green-200 rounded-md">
//                             <CheckCircle2 size={20} />
//                             <span className="font-semibold text-sm">Submission successful! Please verify the results below.</span>
//                         </div>
                        
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="p-4 bg-slate-50 border rounded-lg shadow-sm text-center">
//                                 <p className="text-sm text-muted-foreground font-medium mb-1">Total Scanned</p>
//                                 <p className="text-3xl font-bold">{submissionResult.totalScanned}</p>
//                             </div>
//                             <div className="p-4 bg-slate-50 border rounded-lg shadow-sm text-center">
//                                 <p className="text-sm text-muted-foreground font-medium mb-1">Total Added successfully</p>
//                                 <p className="text-3xl font-bold text-green-600">{submissionResult.totalAdded}</p>
//                             </div>
//                         </div>

//                         <div className="mt-2">
//                             <p className="text-sm font-semibold mb-2">Added Item Codes:</p>
//                             <div className="max-h-48 overflow-y-auto p-3 border rounded-md bg-slate-50">
//                                 {submissionResult.addedCodes.length > 0 ? (
//                                     <ul className="list-disc pl-5 space-y-1">
//                                         {submissionResult.addedCodes.map((code, index) => (
//                                             <li key={index} className="text-sm font-mono text-slate-700">{code}</li>
//                                         ))}
//                                     </ul>
//                                 ) : (
//                                     <p className="text-sm text-slate-500 italic">No specific codes returned by the server.</p>
//                                 )}
//                             </div>
//                         </div>

//                         <DialogFooter className="pt-4 flex sm:justify-end gap-2">
//                             <DialogClose asChild>
//                                 <Button variant="outline">Close</Button>
//                             </DialogClose>
//                             <Button 
//                                 onClick={() => {
//                                     setSubmissionResult(null);
//                                     setScannedItems([]);
//                                     setNotification(null);
//                                 }}
//                             >
//                                 Scan New Batch
//                             </Button>
//                         </DialogFooter>
//                     </div>
//                 ) : (
//                     <form onSubmit={handleSubmit}>
//                         {notification && (
//                             <div className={`flex items-center gap-2 p-3 mb-4 rounded-md text-sm font-medium transition-all ${
//                                 notification.type === "success" 
//                                     ? "bg-green-50 text-green-800 border border-green-200" 
//                                     : "bg-red-50 text-red-800 border border-red-200"
//                             }`}>
//                                 {notification.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
//                                 {notification.text}
//                             </div>
//                         )}

//                         <div className="mb-4">
//                             <Input
//                                 value={currentScan}
//                                 onChange={(e) => setCurrentScan(e.target.value)}
//                                 onKeyDown={(e) => {
//                                     if (e.key === "Enter") {
//                                         e.preventDefault();
//                                         handleBarcodeScan(e);
//                                     }
//                                 }}
//                                 placeholder="Scan or enter item code"
//                                 autoFocus
//                             />
//                         </div>

//                         <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-1">
//                             {scannedItems.map((item, index) => (
//                                 <div key={item.id} className="grid grid-cols-11 items-center gap-4">
//                                     <Input className="col-span-8" readOnly value={item.code} />
//                                     <Input
//                                         className="col-span-2 text-center"
//                                         type="number"
//                                         min="1"
//                                         value={item.quantity}
//                                         onChange={(e) => {
//                                             const qty = parseInt(e.target.value) || 1;
//                                             setScannedItems(prev =>
//                                                 prev.map((itm, i) =>
//                                                     i === index ? { ...itm, quantity: qty } : itm
//                                                 )
//                                             );
//                                         }}
//                                     />
//                                     <button
//                                         type="button"
//                                         onClick={() => handleRemoveItem(item.id)}
//                                         className="col-span-1 flex justify-center items-center text-red-500 hover:text-red-700"
//                                     >
//                                         <Trash2 size={15} />
//                                     </button>
//                                 </div>
//                             ))}
//                         </div>

//                         <DialogFooter className="pt-6 sm:justify-between">
//                             <div className="flex items-center">
//                                 <p className="text-sm font-medium text-muted-foreground">
//                                     Total Items Scanned: {scannedItems.reduce((acc, item) => acc + item.quantity, 0)}
//                                 </p>
//                             </div>
//                             <div className="flex gap-2">
//                                 <DialogClose asChild>
//                                     <Button variant="outline">Cancel</Button>
//                                 </DialogClose>
//                                 <Button type="submit" disabled={scannedItems.length === 0}>
//                                     Save Usage
//                                 </Button>
//                             </div>
//                         </DialogFooter>
//                     </form>
//                 )}
//             </DialogContent>
//         </Dialog>
//     );
// }

// export default AddUsage;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, CheckCircle2, AlertCircle, History } from "lucide-react";
import { createInventoryUsage, fetchInventoryItemByCode, featchInventoryUsage } from "@/api/inventoryApi";
import { useAuth, useUser } from "@clerk/clerk-react";
import { createRepairItemUsage, featchRepairUsage } from "@/api/repair";

function AddUsage({ onUpdate, ...props }) {
    const { getToken } = useAuth();
    const { user } = useUser();
    const userID = user?.id;
    const [scannedItems, setScannedItems] = useState([]);
    const [currentScan, setCurrentScan] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    
    const [existingUsages, setExistingUsages] = useState([]);
    const [isLoadingExisting, setIsLoadingExisting] = useState(false);

    const [notification, setNotification] = useState(null);
    const [submissionResult, setSubmissionResult] = useState(null);

    // Fetch existing usage items when the dialog opens
    useEffect(() => {
        if (!isOpen) {
            setExistingUsages([]);
            return;
        }

        const fetchExistingUsages = async () => {
            try {
                setIsLoadingExisting(true);
                const token = await getToken();
                let response;

                if (props.type === "job") {
                    const jobId = props.jobData?.Job_id || props.jobData?.repair_id || props.jobData?.id || props.jobData?.job_id;
                    if (!jobId) {
                        setIsLoadingExisting(false);
                        return;
                    }
                    response = await featchRepairUsage(token, { jobId, limit: 100, offset: 0 });
                } else {
                    let params = { limit: 100, offset: 0 };
                    if (props.type === "order") {
                        params.orderId = props.orderData?.order_id || props.orderData?.id;
                    } else if (props.type === "pack") {
                        params.packId = props.packData?.Pack_id || props.packData?.pack_id || props.packData?.id;
                    }

                    if (!params.orderId && !params.packId && !params.itemId) {
                        setIsLoadingExisting(false);
                        return;
                    }

                    response = await featchInventoryUsage(token, params);
                }
                
                // Extract items (supports both flat and grouped response structures)
                const rawData = response?.data?.items || response?.items || response?.data || [];
                const flatItems = [];

                if (Array.isArray(rawData)) {
                    rawData.forEach((entry) => {
                        if (entry.items && Array.isArray(entry.items)) {
                            // Grouped structure (Inventory usage)
                            entry.items.forEach((subItem) => {
                                flatItems.push({
                                    usage_id: subItem.usage_id || subItem.id,
                                    item_code: subItem.item_code || subItem.code,
                                    created_at: subItem.created_at || subItem.createdAt,
                                    inventory_code: entry.inventory_code || entry.code,
                                    inventory_name: entry.inventory_name || entry.name,
                                    user_name: entry.user_name || entry.userName,
                                });
                            });
                        } else {
                            // Flat structure (Repair usage)
                            flatItems.push({
                                usage_id: entry.id || entry.usage_id,
                                item_code: entry.item_code || entry.code,
                                created_at: entry.created_at || entry.createdAt,
                                inventory_code: entry.inventory_code || entry.code,
                                inventory_name: entry.inventory_name || entry.name,
                                user_name: entry.user_name || entry.userName,
                            });
                        }
                    });
                }

                setExistingUsages(flatItems);
            } catch (error) {
                console.error("Error fetching existing usages:", error);
            } finally {
                setIsLoadingExisting(false);
            }
        };

        fetchExistingUsages();
    }, [isOpen, getToken, props.type, props.orderData, props.packData, props.jobData]);

    const showNotification = (type, text) => {
        setNotification({ type, text });
        if (type === "error") {
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const handleBarcodeScan = async (e) => {
        const code = e.target.value.trim().toUpperCase();
        if (!code) return;

        setCurrentScan("");

        try {
            const token = await getToken();
            const response = await fetchInventoryItemByCode(token, code);

            if (response?.message === "This item already used") {
                showNotification("error", "This item already used");
                return;
            }
            if (response?.message === "record not found") {
                showNotification("error", "Item not found for code: " + code);
                return;
            }

            const matchedItem = response?.data;

            if (!matchedItem) {
                showNotification("error", "Item not found for code: " + code);
                return;
            }

            const exists = scannedItems.find(item => item.id === matchedItem.id);

            if (exists) {
                setScannedItems(prev =>
                    prev.map(item =>
                        item.id === matchedItem.id ? { ...item, quantity: item.quantity + 1 } : item
                    )
                );
            } else {
                setScannedItems(prev => [
                    ...prev,
                    {
                        id: matchedItem.id,
                        code: matchedItem.item_code,
                        name: matchedItem.item_name,
                        quantity: 1,
                        user: userID,
                    }
                ]);
            }
        } catch (error) {
            console.error("Error scanning barcode:", error);
            if (error.response?.data?.message === "This item already used") {
                showNotification("error", "This item already used");
            } else {
                showNotification("error", "Error scanning barcode. Please try again.");
            }
        }
    };

    const handleRemoveItem = (id) => {
        setScannedItems(prev => prev.filter(item => item.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await getToken();
            let response;

            if (props.type === "order") {
                const usageData = scannedItems.map(item => ({
                    item_id: item.id,
                    order_id: props.orderData.order_id || props.orderData.id,
                    user_name: userID,
                }));
                response = await createInventoryUsage(token, { usages: usageData });
            } 
            else if (props.type === "job") {
                const usageData = scannedItems.map(item => ({
                    item_id: item.id,
                    repair_id: props.jobData.Job_id || props.jobData.repair_id || props.jobData.id,
                    user_name: userID,
                }));
                response = await createRepairItemUsage(token, { repair_usages: usageData });
            }
            else if (props.type === "pack") {
                const usageData = scannedItems.map(item => ({
                    item_id: item.id,
                    pack_id: props.packData.Pack_id,
                    user_name: userID,
                }));
                response = await createInventoryUsage(token, { usages: usageData });
            }

            if (response && (response.message === "success" || response.status === "success" || response.status === 200 || response.status === 201)) {
                const addedItemsList = response.data || [];
                
                const totalScanned = scannedItems.reduce((acc, item) => acc + item.quantity, 0);
                const totalAdded = addedItemsList.length;

                setSubmissionResult({
                    totalScanned,
                    totalAdded,
                    addedCodes: addedItemsList.map(item => item.item_code).filter(Boolean)
                });
                
                if (onUpdate) {
                    onUpdate();
                }

            } else {
                showNotification("error", `Error: ${response?.message || "Failed to submit"}`);
            }

        } catch (error) {
            console.error("Error submitting usage data:", error);
            showNotification("error", "An unexpected error occurred.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
                setNotification(null); 
                setSubmissionResult(null);
                setScannedItems([]);
                setCurrentScan("");
                setExistingUsages([]);
            }
        }}>
            <DialogTrigger asChild>
                <button className="flex items-center text-blue-600 hover:underline cursor-pointer mt-1 gap-x-1">
                    <PlusCircle size={12} />
                    <span className="text-xs">Add</span>
                </button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader className="pb-4">
                    <DialogTitle>
                        {props.type === "order"
                            ? `Item usage for ${props.orderData?.type || props?.order_type || ""}${props.orderData?.order_no || props?.order_no || ""}`
                            : (props.type === "job")
                                ? `Item usage for ${props.jobData?.Job_no}`
                                : "Add usage"
                        }
                    </DialogTitle>
                </DialogHeader>

                {submissionResult ? (
                    <div className="flex flex-col gap-4 py-2">
                        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 border border-green-200 rounded-md">
                            <CheckCircle2 size={20} />
                            <span className="font-semibold text-sm">Submission successful! Please verify the results below.</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 border rounded-lg shadow-sm text-center">
                                <p className="text-sm text-muted-foreground font-medium mb-1">Total Scanned</p>
                                <p className="text-3xl font-bold">{submissionResult.totalScanned}</p>
                            </div>
                            <div className="p-4 bg-slate-50 border rounded-lg shadow-sm text-center">
                                <p className="text-sm text-muted-foreground font-medium mb-1">Total Added successfully</p>
                                <p className="text-3xl font-bold text-green-600">{submissionResult.totalAdded}</p>
                            </div>
                        </div>

                        <div className="mt-2">
                            <p className="text-sm font-semibold mb-2">Added Item Codes:</p>
                            <div className="max-h-48 overflow-y-auto p-3 border rounded-md bg-slate-50">
                                {submissionResult.addedCodes.length > 0 ? (
                                    <ul className="list-disc pl-5 space-y-1">
                                        {submissionResult.addedCodes.map((code, index) => (
                                            <li key={index} className="text-sm font-mono text-slate-700">{code}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">No specific codes returned by the server.</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="pt-4 flex sm:justify-end gap-2">
                            <DialogClose asChild>
                                <Button variant="outline">Close</Button>
                            </DialogClose>
                            <Button 
                                onClick={() => {
                                    setSubmissionResult(null);
                                    setScannedItems([]);
                                    setNotification(null);
                                }}
                            >
                                Scan New Batch
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {notification && (
                            <div className={`flex items-center gap-2 p-3 mb-4 rounded-md text-sm font-medium transition-all ${
                                notification.type === "success" 
                                    ? "bg-green-50 text-green-800 border border-green-200" 
                                    : "bg-red-50 text-red-800 border border-red-200"
                            }`}>
                                {notification.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                {notification.text}
                            </div>
                        )}

                        {/* Already Added Items Section */}
                        {existingUsages.length > 0 && (
                            <div className="mb-5 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                                <div className="flex items-center gap-1.5 mb-2 text-blue-800 font-semibold text-xs uppercase tracking-wide">
                                    <History size={14} />
                                    <span>Already Added Items ({existingUsages.length})</span>
                                </div>
                                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                                    {existingUsages.map((usage, index) => (
                                        <div key={usage.usage_id || index} className="flex items-center justify-between bg-white p-2 rounded border border-blue-100 text-xs shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-slate-800">{usage.item_code}</span>
                                                <span className="text-slate-500 truncate max-w-[200px]">{usage.inventory_name}</span>
                                            </div>
                                            <div className="text-slate-400 text-[11px]">
                                                {usage.user_name && <span className="mr-2">By: {usage.user_name}</span>}
                                                {usage.created_at && <span>{new Date(usage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mb-4">
                            <Input
                                value={currentScan}
                                onChange={(e) => setCurrentScan(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleBarcodeScan(e);
                                    }
                                }}
                                placeholder="Scan or enter item code"
                                autoFocus
                            />
                        </div>

                        <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-1">
                            {scannedItems.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-11 items-center gap-4">
                                    <Input className="col-span-8" readOnly value={item.code} />
                                    <Input
                                        className="col-span-2 text-center"
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => {
                                            const qty = parseInt(e.target.value) || 1;
                                            setScannedItems(prev =>
                                                prev.map((itm, i) =>
                                                    i === index ? { ...itm, quantity: qty } : itm
                                                )
                                            );
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="col-span-1 flex justify-center items-center text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <DialogFooter className="pt-6 sm:justify-between">
                            <div className="flex items-center">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Items Scanned: {scannedItems.reduce((acc, item) => acc + item.quantity, 0)}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={scannedItems.length === 0}>
                                    Save Usage
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default AddUsage;