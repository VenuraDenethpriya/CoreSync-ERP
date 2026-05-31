import React, { useRef } from 'react';
import Barcode from 'react-barcode';
import { jsPDF } from "jspdf";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function BarcodeGeneratorDialog({ item, open, onOpenChange }) {
  const barcodeValue = item?.itemCode ? String(item.itemCode) : null;
  const barcodeRef = useRef(null);

  const handleDownloadPdf = () => {
    if (barcodeRef.current) {
      const svgElement = barcodeRef.current.querySelector('svg');

      if (svgElement) {
        //Convert SVG to Canvas to get the Image Data
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

          // Initialize PDF (A4 size, Portrait, Millimeters)
          const doc = new jsPDF('p', 'mm', 'a4');
          
          const pageWidth = 210;  // A4 Width in mm
          const pageHeight = 297; // A4 Height in mm
          
          // Configuration for layout
          const columns = 5;
          const margin = 10; // 10mm margin on sides
          const xGap = 2; // Horizontal gap between barcodes
          const yGap = 5; // Vertical gap between rows
          
          // Calculate dimensions
          const usableWidth = pageWidth - (margin * 2);
          const columnWidth = usableWidth / columns;
          
          // Calculate Image aspect ratio to fit column
          const imgRatio = img.height / img.width;
          const pdfImgWidth = columnWidth - xGap;
          const pdfImgHeight = pdfImgWidth * imgRatio;

          let x = margin;
          let y = margin;

          // While the next row fits within the page height (minus bottom margin)
          while (y + pdfImgHeight < pageHeight - margin) {
            
            // Fill columns for the current row
            for (let i = 0; i < columns; i++) {
              doc.addImage(pngDataUrl, 'PNG', x, y, pdfImgWidth, pdfImgHeight);
              x += columnWidth;
            }

            // Reset X to left margin and move Y down for next row
            x = margin;
            y += pdfImgHeight + yGap;
          }

          // Save the PDF
          const fileName = `${item.itemName || 'barcode'}_${item.itemCode || 'labels'}.pdf`;
          doc.save(fileName);

          // Cleanup
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
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="font-normal">Barcode for <span className='font-bold'>{item?.itemName}</span></DialogTitle>
          <DialogDescription>
            Here is the barcode for item code: <span className='font-bold'>{item?.itemCode}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-4" ref={barcodeRef}>
          {barcodeValue ? (
            <Barcode
              value={barcodeValue}
              format="CODE128"
              width={2.5}
              height={80} 
              displayValue={true}
              fontSize={18}
              background="#ffffff"
              lineColor="#000000"
            />
          ) : (
            <p className="text-red-500">Cannot generate barcode: Item Code is missing.</p>
          )}
        </div>

        {barcodeValue && (
          <div className="pt-4 flex justify-center">
            <Button className="bg-blue-800 hover:bg-blue-900" onClick={handleDownloadPdf}>
              Download PDF Labels (A4)
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default BarcodeGeneratorDialog;