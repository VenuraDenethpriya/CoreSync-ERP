import AddPurchasesOrderForm from "./Components/AddPurchaseOrderForm";

function AddPurchasesOrder() {
    return (
        <div className="w-full space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                    Add Purchase Order
                </h1>
                {/* <p className="text-sm text-slate-500 mt-1">
                    Fill in the details below to create a new purchase order requisition.
                </p> */}
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/70">
                <AddPurchasesOrderForm />
            </div>
        </div>
    );
}

export default AddPurchasesOrder;