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
import OrderTemplate from "./OrderPdf";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import ReactSelect from "react-select"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth, useUser } from "@clerk/clerk-react";
import { createAuditLog } from "@/api/settingApi";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns"; 

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
    const [checked, setChecked] = useState(false);
    const [deliveryDate, setDeliveryDate] = useState(new Date());
    const [place, setPlace] = useState(props.orderData?.address);
    const [additional, setAdditional] = useState("");
    const [paymentMode, setPaymentMode] = useState("");

    const debouncedTerms = useDebounce(terms, 500);
    const debouncedOtherTerms = useDebounce(otherTerms, 500);
    const debouncedChecked = useDebounce(checked, 500);
    
    const debouncedDeliveryDate = useDebounce(deliveryDate, 500);
    const debouncedPlace = useDebounce(place, 500);
    const debouncedAdditional = useDebounce(additional, 500);
    const debouncedPaymentMode = useDebounce(paymentMode, 500);

    const isGenerating =
        JSON.stringify(terms) !== JSON.stringify(debouncedTerms) ||
        otherTerms !== debouncedOtherTerms ||
        checked !== debouncedChecked ||
        deliveryDate !== debouncedDeliveryDate ||
        place !== debouncedPlace ||
        additional !== debouncedAdditional ||
        paymentMode !== debouncedPaymentMode;

    const pdfRef = useRef(null);

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
        setChecked(false);
        setDeliveryDate(undefined);
        setPlace("");
        setAdditional("");
        setPaymentMode("");
    };

    const showOther = terms.includes(8);

    const handleDownloadLog = async () => {
        try {
            const token = await getToken();
            await createAuditLog(token, {
                action: "PDF Downloaded",
                status_code: 200,
                user: user.id,
                description: `${user.firstName} ${user.lastName} downloaded the invoice for order ${props.orderData?.type}${props.orderData?.order_no}.`,
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
                    <DialogTitle className="text-xl font-extrabold text-slate-800">Fill below data to continue downloading</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-5 py-4">
                    {/* Multi-select dropdown using ReactSelect */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-slate-700 font-semibold text-sm">Terms & Conditions</Label>
                        <ReactSelect
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

                    {/* Other Terms textarea */}
                    {showOther && (
                        <div className="flex flex-col gap-2 w-full">
                            <Label className="text-slate-700 font-semibold text-sm" htmlFor="custometerm">Other</Label>
                            <Textarea
                                className="w-full border border-slate-200 rounded-xl bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                                id="custometerm"
                                placeholder="Enter your custom T & C"
                                value={otherTerms}
                                onChange={(e) => setOtherTerms(e.target.value)}
                                rows={3}
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-2 w-full">
                        <Label className="text-slate-700 font-semibold text-sm">Date of Delivery</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal bg-slate-50 border-slate-200 h-11 rounded-xl",
                                        !deliveryDate && "text-muted-foreground"
                                    )}
                                >
                                    {deliveryDate ? format(deliveryDate, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2" align="start">
                                <Calendar
                                    mode="single"
                                    selected={deliveryDate}
                                    onSelect={setDeliveryDate}
                                    disabled={(date) => date < new Date("1900-01-01")}
                                    initialFocus
                                    classNames={{
                                        head_cell: "w-10 font-medium text-[0.8rem] pb-2",
                                        cell: "h-10 w-10 text-center p-0 relative focus-within:relative focus-within:z-20",
                                        day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100",
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <Label className="text-slate-700 font-semibold text-sm" htmlFor="place">Place of Supply</Label>
                        <Input
                            className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                            id="place"
                            placeholder="Enter place of supply"
                            value={place}
                            onChange={(e) => setPlace(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <Label className="text-slate-700 font-semibold text-sm" htmlFor="additional">Additional Information</Label>
                        <Textarea
                            className="w-full border border-slate-200 rounded-xl bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                            id="additional"
                            placeholder="Enter additional information"
                            value={additional}
                            onChange={(e) => setAdditional(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Payment Checkbox */}
                    {props.orderData?.PaymentStatus !== "Paid" && (
                        <div className="flex items-center gap-3 pt-2">
                            <Checkbox
                                id="payment"
                                checked={checked}
                                onCheckedChange={(value) => setChecked(value)}
                            />
                            <Label htmlFor="payment" className="text-sm font-semibold text-slate-700 cursor-pointer">
                                Mark invoice as fully paid.
                            </Label>
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-4 border-t border-slate-100 flex gap-3 sm:justify-end mt-4">
                    <DialogClose asChild>
                        <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-6">Cancel</Button>
                    </DialogClose>

                    {props.isClient && (
                        <>
                            {isGenerating ? (
                                <Button disabled className="bg-blue-600 opacity-50 cursor-not-allowed rounded-xl px-6 text-white h-10">
                                    Preparing...
                                </Button>
                            ) : (
                                <PDFDownloadLink
                                    ref={pdfRef}
                                    key={`${JSON.stringify(debouncedTerms)}-${debouncedOtherTerms}-${debouncedChecked}-${debouncedPaymentMode}-${debouncedPlace}`}
                                    document={
                                        <OrderTemplate
                                            checked={debouncedChecked}
                                            orderData={props.orderData}
                                            discountPercentage={props.discountPercentage}
                                            totalPaid={props.totalPaid}
                                            terms={debouncedTerms}
                                            otherTerms={debouncedOtherTerms}
                                            vatAmount={props.vatAmount}
                                            netTotal={props.netTotal}
                                            deliveryDate={debouncedDeliveryDate}
                                            place={debouncedPlace}
                                            additional={debouncedAdditional}
                                            paymentMode={debouncedPaymentMode}
                                        />
                                    }
                                    fileName={
                                        props.orderData?.PaymentStatus === "Paid" || debouncedChecked
                                            ? `Invoice_${props.orderData?.type}${props.orderData?.order_no}.pdf`
                                            : `Proforma Invoice_${props.orderData?.type}${props.orderData?.order_no}.pdf`
                                    }
                                    className="inline-flex items-center justify-center rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 h-10 px-6 shadow-sm transition-colors"
                                    onClick={() => {
                                        handleDownloadLog();
                                        setTimeout(() => {
                                            resetFields();
                                            window.location.reload();
                                        }, 500);
                                    }}
                                >
                                    {({ loading }) => (loading ? "Generating..." : "Download")}
                                </PDFDownloadLink>
                            )}
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default TCDropDown;