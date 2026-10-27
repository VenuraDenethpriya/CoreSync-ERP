import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Select from "react-select";
import { useAuth } from "@clerk/clerk-react";
import { useParams } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { updateApproval } from "@/api/orderApi";
import { Input } from "@/components/ui/input";

function DesignDropDown() {
    const { orderId } = useParams();
    const { getToken } = useAuth();

    const [selectedEmails, setSelectedEmails] = useState([]);
    const [description, setDescription] = useState("");
    const [customEmail, setCustomEmail] = useState("");

    const emailOptions = [
        { value: "chalangana.CoreSync@gmail.com", label: "chalangana.CoreSync@gmail.com" },
        { value: "krranwatta@gmail.com", label: "krranwatta@gmail.com" },
        { value: "udaraisenadhipathi2@gmail.com", label: "udaraisenadhipathi2@gmail.com" },
        { value: "uvavishke@gmail.com", label: "uvavishke@gmail.com" },
        { value: "Other", label: "Other" },
    ];

    const handleSelectChange = (selectedOptions) => {
        const ids = selectedOptions ? selectedOptions.map((opt) => opt.value) : [];
        setSelectedEmails(ids);
    };

    const handleSend = async () => {
        try {
            const token = await getToken();
            let emailsToSend = selectedEmails.includes("Other")
                ? [...selectedEmails.filter(e => e !== "Other"), customEmail].filter(Boolean)
                : selectedEmails;
                
            const response = await updateApproval(token, orderId, {
                designer: {
                    email: emailsToSend,
                    description: description,
                }
            });
            if (response.message === "success") {
                toast.success("Design request sent successfully!", { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error sending design request:", error);
        }
    };

    return (
        <form className="w-full max-w-full box-border" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4 w-full">
                
                {/* Designer Email Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pb-1">
                    <div className="sm:w-1/4">
                        <Label className="text-sm font-semibold text-gray-700" htmlFor="designer-email">Designer Email</Label>
                    </div>
                    <div className="w-full sm:w-3/4 max-w-md">
                        <Select
                            isMulti
                            options={emailOptions}
                            onChange={handleSelectChange}
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
                                placeholder="Enter custom designer email"
                                type="email"
                                className="text-black text-sm w-full"
                                value={customEmail}
                                onChange={(e) => setCustomEmail(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Description & Action Button Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 pt-1">
                    <div className="sm:w-1/4 sm:pt-2">
                        <Label className="text-sm font-semibold text-gray-700" htmlFor="description">Description</Label>
                    </div>
                    <div className="w-full sm:w-3/4 max-w-md flex flex-col gap-3">
                        <Textarea
                            id="description"
                            placeholder="Enter design description"
                            className="text-black text-sm w-full resize-y"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <Button 
                            type="button" 
                            className="bg-blue-800 hover:bg-blue-900 shadow-sm w-full sm:w-auto sm:self-end px-8" 
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

export default DesignDropDown;