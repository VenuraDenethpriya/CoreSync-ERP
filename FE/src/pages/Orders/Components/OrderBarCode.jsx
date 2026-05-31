import { useRef, useState } from "react";
import Barcode from 'react-barcode';
import { Button } from "@/components/ui/button";

export default function BarcodeSection({ orderData }) {
    const [showBarcode, setShowBarcode] = useState(false);
    const barcodeRef = useRef(null);
    const barcodeValue = orderData?.type + orderData?.order_no;

    // const handleDownloadBarcode = () => {
    //     setShowBarcode(true);

    //     setTimeout(() => {
    //         if (barcodeRef.current) {
    //             const svgElement = barcodeRef.current.querySelector('svg');

    //             if (svgElement) {
    //                 const canvas = document.createElement('canvas');
    //                 const ctx = canvas.getContext('2d');

    //                 const svgData = new XMLSerializer().serializeToString(svgElement);
    //                 const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    //                 const url = URL.createObjectURL(svgBlob);

    //                 const img = new Image();
    //                 img.onload = () => {
    //                     canvas.width = img.width;
    //                     canvas.height = img.height;
    //                     ctx.drawImage(img, 0, 0);

    //                     const pngUrl = canvas.toDataURL('image/png');
    //                     const downloadLink = document.createElement('a');
    //                     downloadLink.href = pngUrl;
    //                     downloadLink.download = `${barcodeValue || 'unknown'}.png`;
    //                     document.body.appendChild(downloadLink);
    //                     downloadLink.click();
    //                     document.body.removeChild(downloadLink);
    //                     URL.revokeObjectURL(url);
    //                 };
    //                 img.src = url;
    //             } else {
    //                 console.error("SVG element not found");
    //             }
    //         }
    //     }, 100); 
    // };


    const handleDownloadBarcode = () => {
        setShowBarcode(true);

        setTimeout(() => {
            if (!barcodeRef.current) return;
            const svgElement = barcodeRef.current.querySelector("svg");
            if (!svgElement) return console.error("SVG element not found");

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(svgBlob);

            const barcodeImg = new Image();
            barcodeImg.onload = () => {
                const canvasWidth = Math.max(barcodeImg.width + 120, 600);
                const canvasHeight = barcodeImg.height + 300;
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;

                // Background gradient
                const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
                grad.addColorStop(0, "#ffffff");
                grad.addColorStop(1, "#e9f0f7");
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);

                // Card with rounded corners & shadow
                const radius = 30;
                ctx.shadowColor = "rgba(0,0,0,0.2)";
                ctx.shadowBlur = 25;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 10;
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.moveTo(radius, 0);
                ctx.lineTo(canvasWidth - radius, 0);
                ctx.quadraticCurveTo(canvasWidth, 0, canvasWidth, radius);
                ctx.lineTo(canvasWidth, canvasHeight - radius);
                ctx.quadraticCurveTo(canvasWidth, canvasHeight, canvasWidth - radius, canvasHeight);
                ctx.lineTo(radius, canvasHeight);
                ctx.quadraticCurveTo(0, canvasHeight, 0, canvasHeight - radius);
                ctx.lineTo(0, radius);
                ctx.quadraticCurveTo(0, 0, radius, 0);
                ctx.fill();
                ctx.shadowColor = "transparent";

                // Logo + Header
                const logo = new Image();
                logo.onload = () => {
                    const logoWidth = 120;
                    const logoHeight = 60;
                    ctx.drawImage(logo, 40, 40, logoWidth, logoHeight);

                    ctx.fillStyle = "#1e272e";
                    ctx.font = "bold 26px Poppins, Arial";
                    ctx.fillText("Renewaa", 180, 65);

                    ctx.font = "16px Poppins, Arial";
                    ctx.fillStyle = "#636e72";
                    ctx.fillText("Empowering our future with solar energy.", 180, 90);

                    // Contact info badges with icons (simplified as colored boxes)
                    const badgeHeight = 28;
                    const paddingX = 15;

                    // Contact info labels (clean, minimal)
                    ctx.fillStyle = "#2f3640"; // dark text color
                    ctx.font = "bold 14px Poppins, Arial";

                    // Phone
                    ctx.fillText("Phone:", 40, 135);
                    ctx.font = "14px Poppins, Arial";
                    ctx.fillText("+94 7430 20154", 100, 135);

                    // Hotline
                    ctx.font = "bold 14px Poppins, Arial";
                    ctx.fillText("Hotline:", 40, 160);
                    ctx.font = "14px Poppins, Arial";
                    ctx.fillText("+94 7430 20154", 100, 160);


                    // Barcode section
                    const barcodeY = 170;
                    ctx.fillStyle = "#fdfdfd";
                    ctx.shadowColor = "rgba(0,0,0,0.15)";
                    ctx.shadowBlur = 20;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 8;
                    ctx.fillRect(40, barcodeY, canvasWidth - 80, barcodeImg.height + 30);
                    ctx.shadowColor = "transparent";

                    // Draw barcode centered
                    const barcodeX = (canvasWidth - barcodeImg.width) / 2;
                    ctx.drawImage(barcodeImg, barcodeX, barcodeY + 15);

                    // Footer: modern design
                    const footerHeight = 60;
                    const footerY = canvasHeight - footerHeight;

                    // Background strip
                    ctx.fillStyle = "#f0f4f8"; // light modern grey
                    ctx.fillRect(0, footerY, canvasWidth, footerHeight);

                    // Accent line
                    ctx.strokeStyle = "#00a8ff"; // brand color
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(40, footerY);
                    ctx.lineTo(canvasWidth - 40, footerY);
                    ctx.stroke();

                    // Centered text
                    ctx.fillStyle = "#2f3640";
                    ctx.font = "bold 16px Poppins, Arial";
                    const text = "Thank You for Your Business!";
                    const textWidth = ctx.measureText(text).width;
                    ctx.fillText(text, (canvasWidth - textWidth) / 2, footerY + 35);

                    // Optional small icon (like checkmark) - simple circle as placeholder
                    // ctx.fillStyle = "#00a8ff";
                    // ctx.beginPath();
                    // ctx.arc(canvasWidth / 2 - textWidth / 2 - 20, footerY + 33, 6, 0, Math.PI * 2);
                    // ctx.fill();


                    // Export PNG
                    const pngUrl = canvas.toDataURL("image/png");
                    const downloadLink = document.createElement("a");
                    downloadLink.href = pngUrl;
                    downloadLink.download = `${orderData.type}_${orderData.order_no}.png`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    URL.revokeObjectURL(url);
                };
                logo.src = "/logo.svg";
            };
            barcodeImg.src = url;
        }, 100);
    };


    return (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
                // className="bg-blue-800 hover:bg-blue-900"
                variant="link"
                onClick={handleDownloadBarcode}
            >
                Bar Code
            </Button>

            {showBarcode && barcodeValue && (
                <div ref={barcodeRef} className="hidden">
                    <Barcode
                        value={barcodeValue}
                        format="CODE128"
                        width={2.5}
                        height={120}
                        displayValue={true}
                        fontSize={18}
                        background="#ffffff"
                        lineColor="#000000"
                    />
                </div>
            )}
        </div>
    );
}
