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

    const [selectedCADFile, setSelectedCADFile] = useState([{ value: 0 }]);
    const [selectedEmails, setSelectedEmails] = useState([{ value: 0 }]);
    const [quantity, setQuantity] = useState(1);
    const [customEmail, setCustomEmail] = useState("")



    console.log("Selected CAD File:", selectedCADFile);
    console.log("Selected Email:", selectedEmails);
    console.log("Quantity:", quantity);

    // const CADFile = [
    //     { value: "CAD File 1", label: "CAD File 1" },
    //     { value: "CAD File 2", label: "CAD File 2" },
    //     { value: "CAD File 3", label: "CAD File 3" },
    // ]

    const [CADFile, setCADFile] = useState()

    const emailOptions = [
        { value: "kshfabtech@gmail.com", label: "kshfabtech@gmail.com" },
        { value: "Other", label: "Other" },
    ]

    const handleCADFileChange = (cadFiles) => {
        const values = cadFiles ? cadFiles.map((opt) => opt.value) : [];
        setSelectedCADFile(values);
    };

    const handleEmailChange = (selectedOptions) => {
        const values = selectedOptions ? selectedOptions.map((opt) => opt.value) : []
        setSelectedEmails(values)
    }

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
                const res = await featchCadFile(token)
                setCADFile(res);
            } catch (err) {
                console.log("Error fetching CAD files:", err)
            }
        }
        featchCADFilesName()
    }, [getToken])

    return (

        <form>
            <div className="flex-shrink-0">
                <div className="flex items-center gap-x-64 pb-4 w-full">
                    <div>
                        <Label className="cad-file" htmlFor="cad-file">CAD File</Label>
                    </div>
                    {/* Multi-select dropdown */}
                    <div className="flex gap-x-6 ml-14">
                        <Select
                            isMulti
                            options={CADFile}
                            onChange={handleCADFileChange}
                            placeholder="Select CAD File"
                            className="text-black w-60"
                        />
                    </div>

                </div>
                <div className="flex items-center gap-x-64 pb-2">
                    <div>
                        <Label className="workshop-email" htmlFor="workshop-email">Email</Label>
                    </div>
                    {/* Multi-select dropdown */}
                    <div className="flex gap-x-6 ml-[75px]">
                        <Select
                            isMulti
                            options={emailOptions}
                            onChange={handleEmailChange}
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
                        <Label className="cad-file" htmlFor="cad-file">Quantity</Label>
                    </div>
                    <div className="flex gap-x-6 ml-14">
                        <Input type="number" placeholder="Quantity" className="text-black w-60" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                        <Button type="button" className="bg-blue-800 hover:bg-blue-900 ml-2" onClick={handleSend}>Send</Button>
                    </div>
                </div>
            </div>


        </form>
    );
}

export default HardwareDropDown;