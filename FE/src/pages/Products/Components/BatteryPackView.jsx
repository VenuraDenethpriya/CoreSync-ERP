import { Button } from "@/components/ui/button";
import { EditBatteryPack } from "./EditBatteryPack";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { DeleteAlert } from "./DeleteAlert";
import { toast } from "sonner";
import BatteryPackDetailsTemplate from "./BatteryPackPdf";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Roles } from "@/const/const";
import { ErrorState } from "@/components/Skeleton";
import { createAuditLog } from "@/api/settingApi";
import { LockIcon, Plus, Trash2, Save, Search, CheckCircle2, Pencil, Check, X } from "lucide-react"; 
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchInventoryItemsList } from "@/api/inventoryApi";
import { createProductDom, fetchProductBomList, fetchProductById, deleteProduct, deleteProductBom, updateProductBom } from "@/api/productApi"; 
import { useDebounce } from "@/hooks/useDebounce";

function BatteryPackView({ initialData }) {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const { productId } = useParams();

    const [productData, setProductData] = useState(initialData || {});
    const [isLoading, setIsLoading] = useState(!initialData || Object.keys(initialData).length === 0);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [sellable, setSellable] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);

    const [inventoryOptions, setInventoryOptions] = useState([]);
    
    const [bomItems, setBomItems] = useState([]); 
    const [savedBomItems, setSavedBomItems] = useState([]); 
    
    const [selectedInventoryId, setSelectedInventoryId] = useState("");
    const [selectedQuantity, setSelectedQuantity] = useState("");
    const [isSavingBom, setIsSavingBom] = useState(false);

    const [editingBomId, setEditingBomId] = useState(null);
    const [editQuantity, setEditQuantity] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const handleProductUpdate = (updatedFields) => {
        setProductData((prev) => ({
            ...prev,
            ...updatedFields
        }));
    };

    useEffect(() => {
        const fetchProductData = async () => {
            if (initialData?.id) {
                setProductData(initialData);
                setIsLoading(false);
            } else if (productId) {
                try {
                    setIsLoading(true);
                    const token = await getToken();
                    const response = await fetchProductById(token, productId);
                    setProductData(response.data);
                    setIsError(false);
                } catch (error) {
                    setIsError(true);
                    setErrorMessage("Error fetching data: " + error.message);
                    console.error("Main Fetch Error:", error);
                } finally {
                    setIsLoading(false);
                }
            }

            if (productId) {
                try {
                    const token = await getToken();
                    const bomResponse = await fetchProductBomList(token, productId); 
                    
                    const fetchedBoms = bomResponse?.data?.items || bomResponse?.items || [];
                    
                    const formattedBoms = fetchedBoms.map(item => ({
                        bom_id: item.id,
                        inventory_id: item.inventory_id,
                        name: item.inventory_name || "Unknown Item", 
                        quantity: item.quantity
                    }));

                    setSavedBomItems(formattedBoms);
                } catch (bomError) {
                    console.error("Failed to load existing BOM items:", bomError);
                }
            }
        };

        fetchProductData();
    }, [initialData?.id, productId, getToken]);

    useEffect(() => {
        const fetchInventoryData = async () => {
            try {
                const token = await getToken();
                const invResponse = await fetchInventoryItemsList(token, debouncedSearch, limit, offset, sellable);
                
                const itemsArray = invResponse?.data?.items || invResponse?.data?.inventory || invResponse?.data || invResponse || [];
                setInventoryOptions(itemsArray);
            } catch (invError) {
                console.error("Inventory Fetch Error:", invError);
                toast.error("Failed to load inventory items for the BOM dropdown.");
            }
        };

        fetchInventoryData();
    }, [getToken, debouncedSearch, limit, offset, sellable]);

    const handleAddBomItem = () => {
        if (!selectedInventoryId || !selectedQuantity || selectedQuantity <= 0) {
            toast.error("Please select an item and enter a valid quantity.");
            return;
        }

        const selectedItemDetails = inventoryOptions.find(
            item => String(item.id || item.inventory_id) === String(selectedInventoryId)
        );

        if (!selectedItemDetails) {
            toast.error("Selected item details not found.");
            return;
        }

        if (bomItems.some(item => String(item.inventory_id) === String(selectedInventoryId))) {
            toast.error("Item is already in your draft list.");
            return;
        }
        if (savedBomItems.some(item => String(item.inventory_id) === String(selectedInventoryId))) {
            toast.error("Item has already been saved to this BOM.");
            return;
        }

        setBomItems(prev => [...prev, {
            inventory_id: selectedInventoryId,
            name: selectedItemDetails.name || selectedItemDetails.item_name,
            quantity: parseFloat(selectedQuantity)
        }]);

        setSelectedInventoryId("");
        setSelectedQuantity("");
    };

    const handleRemoveBomItem = (inventory_id) => {
        setBomItems(prev => prev.filter(item => item.inventory_id !== inventory_id));
    };

    const handleDeleteSavedBomItem = async (bomId) => {
        try {
            const token = await getToken();
            await deleteProductBom(token, bomId);
            
            toast.success("Saved BOM item deleted successfully!");
            setSavedBomItems(prev => prev.filter(item => item.bom_id !== bomId));
        } catch (error) {
            toast.error("Failed to delete the saved BOM item.");
        }
    };

    const handleEditSavedBomItem = (item) => {
        setEditingBomId(item.bom_id);
        setEditQuantity(String(item.quantity));
    };

    const handleCancelEdit = () => {
        setEditingBomId(null);
        setEditQuantity("");
    };

    const handleUpdateSavedBomItem = async (bomId) => {
        if (!editQuantity || parseFloat(editQuantity) <= 0) {
            toast.error("Please enter a valid quantity.");
            return;
        }

        try {
            setIsUpdating(true);
            const token = await getToken();
            
            const payload = {
                bom_id: bomId,
                quantity: parseFloat(editQuantity)
            };

            await updateProductBom(token, bomId, payload);
            
            toast.success("Quantity updated successfully!");
            
            setSavedBomItems(prev => prev.map(item => 
                item.bom_id === bomId ? { ...item, quantity: parseFloat(editQuantity) } : item
            ));
            
            handleCancelEdit(); 
        } catch (error) {
            toast.error("Failed to update BOM quantity.");
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveBom = async () => {
        if (bomItems.length === 0) {
            toast.error("No new items to save.");
            return;
        }

        try {
            setIsSavingBom(true);
            const token = await getToken();

            const payload = {
                items: bomItems.map(item => ({
                    product_id: productId,
                    inventory_id: item.inventory_id,
                    quantity: item.quantity,
                    created_by: user.id,
                }))
            };

            const response = await createProductDom(token, payload);

            if (response?.message === "success" || response?.status === "success" || response) {
                toast.success("BOM saved successfully!");
                
                const bomResponse = await fetchProductBomList(token, productId); 
                const fetchedBoms = bomResponse?.data?.items || bomResponse?.items || [];
                setSavedBomItems(fetchedBoms.map(item => ({
                    bom_id: item.id,
                    inventory_id: item.inventory_id,
                    name: item.inventory_name || "Unknown Item", 
                    quantity: item.quantity
                })));

                setBomItems([]); 
                
            } else {
                toast.error("Failed to save BOM.");
            }
        } catch (error) {
            toast.error("An error occurred while saving the BOM.");
            console.error(error);
        } finally {
            setIsSavingBom(false);
        }
    };

    const handleDelete = async () => {
        try {
            const token = await getToken();
            await deleteProduct(token, productId);
            toast.success("Battery pack deleted successfully!", { position: "bottom-right" });
            navigate("/products");
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("Error deleting product!");
        }
    };

    const handleDownloadLog = async () => {
        try {
            const token = await getToken();
            await createAuditLog(token, {
                action: "PDF Downloaded",
                status_code: 200,
                user: user.id,
                description: `${user.firstName} ${user.lastName} downloaded the ${productData?.name} report as a PDF file.`,
            });
        } catch (error) {
            console.error("Failed to log download action:", error);
        }
    };

    const isReadOnlyUser = user?.publicMetadata?.role === Roles.READ_ONLY || user?.publicMetadata?.role === Roles.WAREHOUSE_STAFF || user?.publicMetadata?.role === Roles.SALES_TEAM || user?.publicMetadata?.role === Roles.HR_HEAD;

    if (user?.publicMetadata?.role === Roles.WAREHOUSE_STAFF || user?.publicMetadata?.role === Roles.SALES_TEAM || user?.publicMetadata?.role === Roles.HR_HEAD) {
        return (
            <div className="flex items-center justify-center min-h-[70vh] w-full px-4">
                <div className="bg-white shadow-sm rounded-2xl p-8 max-w-md text-center border border-red-100">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <LockIcon className="w-12 h-12 text-red-500" />
                        <h1 className="text-xl font-bold text-gray-800">Access Denied</h1>
                        <p className="text-sm text-gray-500">
                            You are not authorized to access this page. Please contact your administrator if you believe this is a mistake.
                        </p>
                        <Button
                            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl"
                            onClick={() => navigate("/")}
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="w-full space-y-6">
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row justify-between items-center gap-4 animate-pulse">
                    <div className="h-8 w-64 bg-slate-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (isError) {
        return <ErrorState errorMessage={errorMessage} />;
    }

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">{productData.name}</h1>

                {!isMobile && (
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        {user.publicMetadata.role !== Roles.READ_ONLY && (
                            <EditBatteryPack productData={productData} onUpdate={handleProductUpdate} />
                        )}

                        {user.publicMetadata.role !== Roles.INVENTORY_MANAGER && user.publicMetadata.role !== Roles.READ_ONLY && (
                            <DeleteAlert handleDelete={handleDelete} productData={productData} />
                        )}

                        {user.publicMetadata.role !== Roles.INVENTORY_MANAGER && user.publicMetadata.role !== Roles.READ_ONLY && (
                            <PDFDownloadLink
                                document={<BatteryPackDetailsTemplate productData={productData} />}
                                fileName={`Battery-Pack-Report-${productData.name}.pdf`}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 h-10 px-4 py-2 transition-colors"
                                onClick={handleDownloadLog}
                            >
                                {({ loading }) => (loading ? "Generating..." : "Download")}
                            </PDFDownloadLink>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {/* Primary Details */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <h3 className="text-lg font-bold mb-5 text-slate-800">Primary Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                        <DetailRow label="Product Category" value={productData.category} />
                        <DetailRow label="Base Price" value={`LKR ${Number(productData.base_price || 0).toLocaleString()}`} />
                    </div>
                </div>

                {/* Product Details */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <h3 className="text-lg font-bold mb-5 text-slate-800">Product Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                        <div className="space-y-3">
                            <DetailRow label="Pack Type" value={productData.type} />
                            <DetailRow label="Cell Count" value={productData.cell_count} />
                            <DetailRow label="Cell Type" value={productData.cell_type} />
                            <DetailRow label="BMS Type" value={productData.bms_type} />
                            <DetailRow label="Monitor" value={productData.monitor} />
                        </div>
                        <div className="space-y-3">
                            <DetailRow label="Capacity" value={productData.capacity ? productData.capacity + " Ah" : undefined} />
                            <DetailRow label="Voltage" value={productData.voltage ? productData.voltage + " V" : undefined} />
                            <DetailRow label="Is Active" value={productData.is_active ? "Yes" : "No"} />
                            <DetailRow label="Specification" value={productData.Specifications} />
                        </div>
                    </div>
                </div>

                {/* Bill of Materials (BOM) Section */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-lg font-bold text-slate-800">Bill of Materials (BOM)</h3>
                    </div>

                    {!isReadOnlyUser && (
                        <div className="flex flex-col sm:flex-row items-end gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="w-full sm:w-1/2">
                                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Inventory Item</label>
                                <Select value={selectedInventoryId} onValueChange={setSelectedInventoryId}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Select item..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="p-2 sticky top-0 bg-white z-10 border-b mb-1">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                                                <Input
                                                    placeholder="Search inventory..."
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                    onKeyDown={(e) => e.stopPropagation()} 
                                                    className="pl-8 h-9 bg-slate-50 border-slate-200 focus-visible:ring-slate-300"
                                                />
                                            </div>
                                        </div>

                                        <div className="max-h-[200px] overflow-y-auto">
                                            {inventoryOptions && inventoryOptions.length > 0 ? (
                                                inventoryOptions.map(item => (
                                                    <SelectItem
                                                        key={item.id}
                                                        value={String(item.id || item.inventory_id)}
                                                    >
                                                        {item.name || item.item_name || "Unknown Item"}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-4 text-sm text-slate-500 text-center">
                                                    {debouncedSearch ? "No items match your search" : "No inventory found"}
                                                </div>
                                            )}
                                        </div>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full sm:w-1/4">
                                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Quantity</label>
                                <Input
                                    type="number"
                                    min="0.01"
                                    step="any"
                                    placeholder="Qty"
                                    value={selectedQuantity}
                                    onChange={(e) => setSelectedQuantity(e.target.value)}
                                    className="bg-white"
                                />
                            </div>

                            <Button
                                type="button"
                                onClick={handleAddBomItem}
                                className="w-full sm:w-auto shrink-0 bg-slate-800 hover:bg-slate-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add to BOM
                            </Button>
                        </div>
                    )}

                    {/* DRAFT ITEMS TABLE */}
                    {bomItems.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-amber-600 mb-2">Unsaved Items</h4>
                            <div className="border border-amber-200 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-amber-50 border-b border-amber-200 text-amber-800 font-semibold text-xs uppercase">
                                        <tr>
                                            <th className="px-4 py-3">Item Name</th>
                                            <th className="px-4 py-3 w-32">Quantity</th>
                                            {!isReadOnlyUser && <th className="px-4 py-3 w-16 text-center">Action</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-amber-100 bg-white">
                                        {bomItems.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-amber-50/30">
                                                <td className="px-4 py-3 font-medium text-slate-700">{item.name}</td>
                                                <td className="px-4 py-3 text-slate-600">{item.quantity}</td>
                                                {!isReadOnlyUser && (
                                                    <td className="px-4 py-3 text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleRemoveBomItem(item.inventory_id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* SAVE DRAFTS BUTTON */}
                    {!isReadOnlyUser && bomItems.length > 0 && (
                        <div className="flex justify-end mb-8 border-b border-slate-100 pb-6">
                            <Button
                                onClick={handleSaveBom}
                                disabled={isSavingBom}
                                className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                            >
                                {isSavingBom ? "Saving..." : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save BOM Items
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* ALREADY SAVED ITEMS TABLE WITH INLINE EDITING */}
                    {savedBomItems.length > 0 ? (
                        <div className="mt-6">
                            <h4 className="text-sm font-semibold text-emerald-700 mb-2 flex items-center">
                                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                Saved BOM Items
                            </h4>
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase">
                                        <tr>
                                            <th className="px-4 py-3">Item Name</th>
                                            <th className="px-4 py-3 w-32">Quantity</th>
                                            {!isReadOnlyUser && <th className="px-4 py-3 w-24 text-center">Action</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {savedBomItems.map((item, idx) => {
                                            const isEditing = editingBomId === item.bom_id;

                                            return (
                                                <tr key={idx} className="hover:bg-slate-50/50">
                                                    <td className="px-4 py-3 font-medium text-slate-700">{item.name}</td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {isEditing ? (
                                                            <Input
                                                                type="number"
                                                                min="0.01"
                                                                step="any"
                                                                value={editQuantity}
                                                                onChange={(e) => setEditQuantity(e.target.value)}
                                                                className="h-8 w-24 bg-white"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            item.quantity
                                                        )}
                                                    </td>
                                                    
                                                    {!isReadOnlyUser && (
                                                        <td className="px-4 py-3 text-center flex justify-center gap-1">
                                                            {isEditing ? (
                                                                <>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        disabled={isUpdating}
                                                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                        onClick={() => handleUpdateSavedBomItem(item.bom_id)}
                                                                    >
                                                                        <Check className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        disabled={isUpdating}
                                                                        className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                                                        onClick={handleCancelEdit}
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                                        onClick={() => handleEditSavedBomItem(item)}
                                                                    >
                                                                        <Pencil className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                        onClick={() => handleDeleteSavedBomItem(item.bom_id)}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            No saved items found.
                        </div>
                    )}

                </div>

                {/* Timestamps */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="text-xs sm:text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-16">
                        <Timestamp label="Created At" value={productData.created_at} />
                        <Timestamp label="Last Updated At" value={productData.updated_at} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline py-1.5">
            <span className="text-slate-500 text-sm font-semibold">{label}:</span>
            <span className="text-sm text-slate-800 font-medium mt-1 sm:mt-0">{value || "N/A"}</span>
        </div>
    );
}

function Timestamp({ label, value }) {
    return (
        <div className="flex flex-col">
            <span className="uppercase tracking-wider text-[10px] text-slate-400 font-bold mb-1">{label}</span>
            <span className="font-semibold text-slate-700 text-sm">{value ? new Date(value).toLocaleString() : "N/A"}</span>
        </div>
    );
}

export default BatteryPackView;