import { useEffect, useState } from "react";
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
    { value: 11, label: "Off-grid System (Deye Inverter)" },
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
                 <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">Download</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] w-full max-h-[90vh] overflow-y-auto rounded-2xl border-slate-200/70 p-6 sm:p-8 bg-white shadow-xl">
                <DialogHeader className="space-y-1.5">
                    <DialogTitle className="text-xl font-extrabold text-slate-800">Select T & C to continue downloading</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    <div className="flex flex-col gap-2">
                        <Label className="text-slate-700 font-semibold text-sm">Terms & Conditions</Label>
                        <Select
                            isMulti
                            options={tcOptions}
                            onChange={handleSelectChange}
                            value={tcOptions.filter(option => terms.includes(option.value))}
                            placeholder="Select Terms & Conditions"
                            className="text-black text-sm"
                            styles={{
                                control: (provided) => ({
                                    ...provided,
                                    backgroundColor: '#f8fafc',
                                    borderColor: '#e2e8f0',
                                    borderRadius: '0.75rem',
                                    minHeight: '44px',
                                    boxShadow: 'none',
                                    '&:hover': {
                                        borderColor: '#cbd5e1'
                                    }
                                })
                            }}
                        />
                    </div>

                    {terms.includes(8) && (
                        <div className="flex flex-col gap-2 w-full">
                            <Label className="text-slate-700 font-semibold text-sm" htmlFor="custometerm">Other Terms</Label>
                            <Textarea
                                className="w-full border border-slate-200 rounded-xl bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                                id="custometerm"
                                placeholder="Enter your custom T & C"
                                value={otherTerms}
                                onChange={(e) => setOtherTerms(e.target.value)}
                                rows={4}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-6 border-t border-slate-100 flex gap-3 sm:justify-end mt-4">
                    <DialogClose asChild>
                        <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-6">Cancel</Button>
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
                            className="inline-flex items-center justify-center rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 h-10 px-6 shadow-sm transition-colors"
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