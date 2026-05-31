import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { PDFDownloadLink } from "@react-pdf/renderer";
import OrderTemplate from "./OrderPdf";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function TCDialog(props) {
  const [terms, setTerms] = useState([]);
  const [hasOther, setHasOther] = useState(false);
  const [otherTerms, setOtherTerms] = useState("");
  const [open, setOpen] = useState(false);

  const debouncedTerms = useDebounce(terms, 400);
  const debouncedOtherTerms = useDebounce(otherTerms, 400);

  const pdfRef = useRef(null);

  const termLabels = [
    "Normal Battery Pack",
    "Normal Battery Pack with Inverter",
    "Battery Cells",
    "Forklift",
    "E- Bikes",
    "E- Vehicles (CATL battery pack)",
    "Off-Grid Solar System",
    "On-Grid Solar System",
  ];

  const handleTermsChange = (id) => {
    setTerms((prev) =>
      prev.includes(id)
        ? prev.filter((t) => t !== id)
        : [...prev, id]
    );
  };

  const resetFields = () => {
    setTerms([]);
    setHasOther(false);
    setOtherTerms("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-800 hover:bg-blue-900">
          Download
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[430px]">
        <DialogHeader>
          <DialogTitle>Select T & C to continue downloading</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          {termLabels.map((label, id) => (
            <div key={id} className="flex items-center gap-3">
              <Checkbox
                id={`terms-${id}`}
                checked={terms.includes(id)}
                onCheckedChange={() => handleTermsChange(id)}
              />
              <Label htmlFor={`terms-${id}`} className="font-normal">
                {label}
              </Label>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <Checkbox
            id="other"
            checked={hasOther}
            onCheckedChange={(checked) => {
              setHasOther(checked);
              if (!checked) setOtherTerms("");
            }}
          />
          <Label htmlFor="other" className="font-normal">
            Other
          </Label>
        </div>

        {hasOther && (
          <Textarea
            className="mt-2"
            placeholder="Enter your custom T & C"
            value={otherTerms}
            onChange={(e) => setOtherTerms(e.target.value)}
          />
        )}

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          {props.isClient && (
            <PDFDownloadLink
              ref={pdfRef}
              key={`${debouncedTerms.length}-${debouncedOtherTerms.length}`}
              document={
                <OrderTemplate
                  orderData={props.orderData}
                  discountPercentage={props.discountPercentage}
                  totalPaid={props.totalPaid}
                  terms={terms}
                  otherTerms={hasOther ? otherTerms : ""}
                  vatAmount={props.vatAmount}
                  netTotal={props.netTotal}
                />
              }
              fileName={
                props.orderData?.PaymentStatus === "Paid"
                  ? `Invoice_${props.orderData?.type}${props.orderData?.order_no}.pdf`
                  : `Proforma_Invoice_${props.orderData?.type}${props.orderData?.order_no}.pdf`
              }
              className="inline-flex items-center justify-center rounded-md text-sm font-medium
                border border-blue-700 bg-blue-700 text-white hover:bg-blue-800
                h-9 px-4"
              onClick={() => {
                setTimeout(() => {
                  setOpen(false);
                  resetFields();
                }, 400);
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

export default TCDialog;
