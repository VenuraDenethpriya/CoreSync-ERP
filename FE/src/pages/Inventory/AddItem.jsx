import AddInventoryItemForm from "./Components/AddInventoryItemForm";

function AddInventoryItem() {

    return (
        <>
            <div className="max-w-screen sm:m-6 py-6 sm:px-14 px-6 bg-slate-50 rounded-md">
                <div >
                    <h1 className="sm:text-3xl text-xl font-semibold py-4">Add Inventory Item</h1>
                </div>
                <AddInventoryItemForm />
            </div>
        </>


    );
}

export default AddInventoryItem;