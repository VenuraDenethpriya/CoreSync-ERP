import bwipjs from "bwip-js";

export async function generateBarcodeDataUrl(code) {
  try {
    const pngBuffer = await bwipjs.toBuffer({
      bcid: "code128",       // Barcode type
      text: code,            // Text to encode
      scale: 3,              // 3x scaling factor
      height: 10,            // Bar height, in millimeters
      includetext: true,     // Show human-readable text
      textxalign: "center",  // Align text to center
    });

    return `data:image/png;base64,${pngBuffer.toString("base64")}`;
  } catch (err) {
    console.error("Error generating barcode:", err);
    return null;
  }
}