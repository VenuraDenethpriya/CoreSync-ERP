import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Select from "react-select";
import { useAuth } from "@clerk/clerk-react";
import { featchCadFile, updateApproval } from "@/api/orderApi";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

function HardwareDropDown() {
    const { orderId } = useParams();
    const { getToken } = useAuth();

    const [selectedCADFile, setSelectedCADFile] = useState([]);
    const [selectedEmails, setSelectedEmails] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [customEmail, setCustomEmail] = useState("");
    const [CADFile, setCADFile] = useState([]);

    const emailOptions = [
        { value: "kshfabtech@gmail.com", label: "kshfabtech@gmail.com" },
        { value: "Other", label: "Other" },
    ];

    const handleCADFileChange = (cadFiles) => {
        const values = cadFiles ? cadFiles.map((opt) => opt.value) : [];
        setSelectedCADFile(values);
    };

    const handleEmailChange = (selectedOptions) => {
        const values = selectedOptions ? selectedOptions.map((opt) => opt.value) : [];
        setSelectedEmails(values);
    };

    const handleSend = async () => {
        try {
            const token = await getToken();
            let emailsToSend = selectedEmails.includes("Other")
                ? [...selectedEmails.filter(e => e !== "Other"), customEmail].filter(Boolean)
                : selectedEmails;

            const response = await updateApproval(token, orderId, {
                cad_files: {
                    file_name: selectedCADFile,
                    email: emailsToSend,
                    quantity: Number(quantity),
                }
            });
            if (response.message === "success") {
                toast.success("CAD file(s) request sent successfully!", { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error sending CAD file request:", error);
        }
    };

    useEffect(() => {
        const featchCADFilesName = async () => {
            try {
                const token = await getToken();
                const res = await featchCadFile(token);
                setCADFile(res);
            } catch (err) {
                console.log("Error fetching CAD files:", err);
            }
        };
        featchCADFilesName();
    }, [getToken]);

    return (
        /* Removed all fixed hardcoded margins (like ml-[368px]) and arbitrary wide X-gaps */
        <form className="w-full max-w-full box-border" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4 w-full">
                
                {/* CAD File Field Segment */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pb-1">
                    <div className="sm:w-1/4">
                        <Label className="text-sm font-semibold text-gray-700" htmlFor="cad-file">CAD File</Label>
                    </div>
                    <div className="w-full sm:w-3/4 max-w-md">
                        <Select
                            isMulti
                            options={CADFile}
                            onChange={handleCADFileChange}
                            placeholder="Select CAD File"
                            className="text-black text-sm w-full"
                            classNamePrefix="react-select"
                        />
                    </div>
                </div>

                {/* Email Dropdown Segment */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pb-1">
                    <div className="sm:w-1/4">
                        <Label className="text-sm font-semibold text-gray-700" htmlFor="workshop-email">Email</Label>
                    </div>
                    <div className="w-full sm:w-3/4 max-w-md">
                        <Select
                            isMulti
                            options={emailOptions}
                            onChange={handleEmailChange}
                            placeholder="Select Email"
                            className="text-black text-sm w-full"
                            classNamePrefix="react-select"
                        />
                    </div>
                </div>

                {/* Conditional Custom Email Input Row */}
                {selectedEmails.includes("Other") && (
                    <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4 animate-fade-in">
                        <div className="hidden sm:block sm:w-1/4"></div>
                        <div className="w-full sm:w-3/4 max-w-md">
                            <Input
                                placeholder="Enter custom email address"
                                type="email"
                                className="text-black text-sm w-full"
                                value={customEmail}
                                onChange={(e) => setCustomEmail(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Quantity & Action Button Segment */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pt-1">
                    <div className="sm:w-1/4">
                        <Label className="text-sm font-semibold text-gray-700" htmlFor="quantity">Quantity</Label>
                    </div>
                    <div className="w-full sm:w-3/4 max-w-md flex gap-3">
                        <Input 
                            id="quantity"
                            type="number" 
                            placeholder="Quantity" 
                            className="text-black text-sm flex-1" 
                            min="1" 
                            value={quantity} 
                            onChange={(e) => setQuantity(e.target.value)} 
                        />
                        <Button 
                            type="button" 
                            className="bg-blue-800 hover:bg-blue-900 shadow-sm shrink-0 px-6" 
                            onClick={handleSend}
                        >
                            Send
                        </Button>
                    </div>
                </div>

            </div>
        </form>
    );
}

export default HardwareDropDown;