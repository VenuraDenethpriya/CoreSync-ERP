import AddBatteryPackForm from "./Components/AddBatteryPackForm";

function AddBatteryPack() {

    return (
        <>
            <div className="max-w-screen sm:m-6 py-6 sm:px-14 px-6 bg-slate-50 rounded-md">
                <div >
                    <h1 className="sm:text-3xl text-xl font-semibold py-4">Add Battery Pack</h1>
                </div>
                <AddBatteryPackForm />
            </div>
        </>


    );
}

export default AddBatteryPack;