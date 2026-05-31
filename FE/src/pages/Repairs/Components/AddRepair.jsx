import AddRepairForm from "./AddRepairForm";


function AddRepair() {

    return (
        <div className="w-full sm:m-6 p-6  sm:px-10 bg-slate-50 rounded-md min-h-[90vh] shadow-sm">
            <div className="mb-6">
                <h1 className="sm:text-3xl text-xl font-semibold">New Repair</h1>
            </div>
            <AddRepairForm />
        </div>
    );
}

export default AddRepair;