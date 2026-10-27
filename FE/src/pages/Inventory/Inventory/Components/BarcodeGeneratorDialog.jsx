import React, { useRef } from 'react';
import Barcode from 'react-barcode';
import { jsPDF } from "jspdf";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function BarcodeGeneratorDialog({ item, open, onOpenChange }) {
  const barcodeValue = item?.itemCode ? String(item.itemCode) : null;
  const barcodeRef = useRef(null);

  const handleDownloadPdf = () => {
    if (barcodeRef.current) {
      const svgElement = barcodeRef.current.querySelector('svg');

      if (svgElement) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const pngDataUrl = canvas.toDataURL('image/png');

          const doc = new jsPDF('p', 'mm', 'a4');
          
          const pageWidth = 210;  // A4 Width in mm
          const pageHeight = 297; // A4 Height in mm
          
          const columns = 5;
          const margin = 10;
          const xGap = 2;
          const yGap = 5;
          
          const usableWidth = pageWidth - (margin * 2);
          const columnWidth = usableWidth / columns;
          
          const imgRatio = img.height / img.width;
          const pdfImgWidth = columnWidth - xGap;
          const pdfImgHeight = pdfImgWidth * imgRatio;

          let x = margin;
          let y = margin;

          while (y + pdfImgHeight < pageHeight - margin) {
            for (let i = 0; i < columns; i++) {
              doc.addImage(pngDataUrl, 'PNG', x, y, pdfImgWidth, pdfImgHeight);
              x += columnWidth;
            }

            x = margin;
            y += pdfImgHeight + yGap;
          }

          const fileName = `${item.itemName || 'barcode'}_${item.itemCode || 'labels'}.pdf`;
          doc.save(fileName);

          URL.revokeObjectURL(url);
        };
        img.src = url;
      } else {
        console.error("SVG element not found in barcodeRef.current");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] w-full rounded-2xl border-slate-200/70 p-6 sm:p-8 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-extrabold text-slate-800">
            Barcode for <span className="text-blue-600">{item?.itemName}</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Here is the barcode for item code: <span className="font-semibold text-slate-700">{item?.itemCode}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6 bg-slate-50/50 rounded-2xl border border-slate-200/70 my-4" ref={barcodeRef}>
          {barcodeValue ? (
            <Barcode
              value={barcodeValue}
              format="CODE128"
              width={2.5}
              height={80} 
              displayValue={true}
              fontSize={18}
              background="transparent"
              lineColor="#0f172a"
            />
          ) : (
            <p className="text-rose-500 text-sm font-medium">Cannot generate barcode: Item Code is missing.</p>
          )}
        </div>

        <DialogFooter className="pt-4 border-t border-slate-100 flex gap-3 sm:justify-end">
          <DialogClose asChild>
            <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-6">
              Close
            </Button>
          </DialogClose>
          {barcodeValue && (
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-6" onClick={handleDownloadPdf}>
              Download PDF Labels (A4)
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BarcodeGeneratorDialog;