import AddRepairForm from "./AddRepairForm";

function AddRepair() {
    return (
        <div className="w-full space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                    New Repair
                </h1>
                {/* <p className="text-sm text-slate-500 mt-1">
                    Fill in the customer, order reference, and repair details below.
                </p> */}
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/70">
                <AddRepairForm />
            </div>
        </div>
    );
}

export default AddRepair;