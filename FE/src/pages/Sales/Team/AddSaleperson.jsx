import AddSalespersonForm from "./Components/AddSalespersonForm";

function AddSaleperson() {
    return (
        <div className="w-full space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                    Add Salesperson
                </h1>
                {/* <p className="text-sm text-slate-500 mt-1">
                    Fill in the details below to register a new member of the sales team.
                </p> */}
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/70">
                <AddSalespersonForm />
            </div>
        </div>
    );
}

export default AddSaleperson;