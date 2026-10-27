import AddPackForm from "./AddPackForm";


function AddPack() {

    return (
        <div className="w-full sm:m-6 p-6  sm:px-10 bg-slate-50 rounded-md min-h-[90vh] shadow-sm">
            <div className="mb-6">
                <h1 className="sm:text-3xl text-xl font-semibold">New Pack</h1>
            </div>
            <AddPackForm />
        </div>
    );
}

export default AddPack;