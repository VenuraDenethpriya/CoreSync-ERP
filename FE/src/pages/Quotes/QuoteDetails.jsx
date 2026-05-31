import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BatteryPackQuoteView from "./Components/BatteryPackQuoteView";

function QuoteDetails() {
    return (
        <div className="max-w-screen sm:px-3 bg-slate-50 rounded-md">
            <BatteryPackQuoteView />
        </div>
    );
}

export default QuoteDetails;
