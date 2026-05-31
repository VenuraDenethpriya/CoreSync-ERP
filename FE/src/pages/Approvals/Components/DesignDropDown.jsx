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

    const [selectedEmails, setSelectedEmails] = useState([{ value: 0 }]);
    const [description, setDescription] = useState("");
    const [customEmail, setCustomEmail] = useState("")


    const emailOptions = [
        { value: "chalangana.renewaa@gmail.com", label: "chalangana.renewaa@gmail.com" },
        { value: "krranwatta@gmail.com", label: "krranwatta@gmail.com" },
        { value: "udaraisenadhipathi2@gmail.com", label: "udaraisenadhipathi2@gmail.com" },
        { value: "uvavishke@gmail.com", label: "uvavishke@gmail.com" },
        { value: "Other", label: "Other" },
    ]

    const handleSelectChange = (selectedOptions) => {
        const ids = selectedOptions ? selectedOptions.map((opt) => opt.value) : [];
        setSelectedEmails(ids);
        console.log("Selected Email IDs:", ids);
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

        <form>
            <div className="flex items-center gap-x-64 pb-2">
                <div>
                    <Label className="designer-email" htmlFor="designer-email">Designer Email</Label>
                </div>
                <div className="flex gap-x-6 ml-4">
                    <Select
                        isMulti
                        options={emailOptions}
                        onChange={handleSelectChange}
                        placeholder="Select Email"
                        className="text-black w-60"
                    />
                </div>
            </div>
            <Input
                    placeholder="Enter email"
                    className={selectedEmails.includes("Other") ? "grid w-60 ml-[368px]" : "hidden"}
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                />
            <div className="flex items-center gap-x-64 pt-4">
                <div>
                    <Label className="description" htmlFor="description">Description</Label>
                </div>
                <div className="flex gap-x-6 ml-10">
                    <Textarea
                        placeholder="Enter design description"
                        className="text-black w-60"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Button type="button" className="bg-blue-800 hover:bg-blue-900 ml-2" onClick={handleSend}>Send</Button>
                </div>
            </div>
        </form>
    );
}

export default DesignDropDown;
