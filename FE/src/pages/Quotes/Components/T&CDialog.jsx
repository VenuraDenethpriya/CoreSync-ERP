import { useEffect, useRef, useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Select from "react-select";
import { useAuth, useUser } from "@clerk/clerk-react";
import { createAuditLog } from "@/api/settingApi";
import BatteryPackQuoteDetailsTemplate from "./BatteryPackQuotePdf";

const tcOptions = [
    { value: 0, label: "Normal Battery Pack" },
    { value: 1, label: "Normal Battery Pack with Inverter" },
    { value: 9, label: "Hybrid Inverter" },
    { value: 10, label: "Advance Battery Pack - 10 year warranty for battery pack" },
    { value: 2, label: "Battery Cells" },
    { value: 3, label: "Forklift" },
    { value: 4, label: "E- Bikes" },
    { value: 5, label: "E- Vehicles (CATL battery pack)" },
    { value: 6, label: "Off-Grid Solar System" },
    { value: 11, label: "Off-Grid System Complete Installation" },
    { value: 7, label: "On-Grid Solar System" },
    { value: 12, label: "On-Grid to Hybrid System Conversion" },
    { value: 13, label: "Hybrid Solar System" },
    { value: 8, label: "Other" },
];

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

function TCDropDown(props) {
    const { user } = useUser();
    const { getToken } = useAuth();

    const [terms, setTerms] = useState([]);
    const [otherTerms, setOtherTerms] = useState("");
    const [open, setOpen] = useState(false);


    const debouncedTerms = useDebounce(terms, 500);
    const debouncedOtherTerms = useDebounce(otherTerms, 500);

    const handleSelectChange = (selectedOptions) => {
        const selectedValues = (selectedOptions || []).map(option => option.value);
        setTerms(selectedValues);
        if (!selectedValues.includes(8)) {
            setOtherTerms("");
        }
    };

    const resetFields = () => {
        setTerms([]);
        setOtherTerms("");
    };

    const handleDownloadLog = async () => {
        try {
            const token = await getToken();
            await createAuditLog(token, {
                action: "PDF Downloaded",
                status_code: 200,
                user: user.id,
                description: `${user.firstName} ${user.lastName} downloaded the Quote for ${props.quoteData?.type}${props.quoteData?.quote_no}.`,
            });
        } catch (error) {
            console.error("Failed to log download action:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-800 hover:bg-blue-900">Download</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1000px]">
                <DialogHeader>
                    <DialogTitle>Select T & C to continue downloading</DialogTitle>
                </DialogHeader>

                <div className="mb-4">
                    <Select
                        isMulti
                        options={tcOptions}
                        onChange={handleSelectChange}
                        value={tcOptions.filter(option => terms.includes(option.value))}
                        placeholder="Select Terms & Conditions"
                        className="text-black"
                    />
                </div>

                {terms.includes(8) && (
                    <div className="flex flex-col gap-2 w-full mb-4">
                        <Label className="font-normal" htmlFor="custometerm">Other</Label>
                        <Textarea
                            className="focus:border-blue-400"
                            id="custometerm"
                            placeholder="Enter your custom T & C"
                            value={otherTerms}
                            onChange={(e) => setOtherTerms(e.target.value)}
                        />
                    </div>
                )}

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>

                    {props.isClient && (
                        <PDFDownloadLink
                            key={`${JSON.stringify(debouncedTerms)}-${debouncedOtherTerms}`}
                            document={
                                <BatteryPackQuoteDetailsTemplate
                                    quoteData={props.quoteData}
                                    discountPercentage={props.discountPercentage}
                                    terms={debouncedTerms}
                                    otherTerms={debouncedOtherTerms}
                                    vatAmount={props.vatAmount}
                                    netTotal={props.netTotal}
                                />
                            }
                            fileName={`${props.quoteData?.type}${props.quoteData?.quote_no}.pdf`}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-blue-700 bg-blue-700 text-blue-50 hover:bg-blue-800 h-9 px-4 py-2"
                            onClick={() => {
                                handleDownloadLog();
                                setTimeout(() => {
                                    setOpen(false);
                                    resetFields();
                                }, 1000);
                            }}
                        >
                            {({ loading }) => (loading ? "Generating..." : "Continue")}
                        </PDFDownloadLink>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default TCDropDown;