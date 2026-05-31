import AddOrderForm from "./AddOrderForm";


function AddOrder() {

    return (
        // <>
        //     <div className="max-w-screen sm:m-6 py-6 sm:px-14 px-6 bg-slate-50 rounded-md">
        //         <div >
        //             <h1 className="sm:text-3xl text-xl font-semibold ">New Order</h1>
        //         </div>
        //         <AddOrderForm />
        //     </div>
        // </>
        <div className="w-full sm:m-6 p-6  sm:px-10 bg-slate-50 rounded-md min-h-[90vh] shadow-sm">
            <div className="mb-6">
                <h1 className="sm:text-3xl text-xl font-semibold">New Order</h1>
            </div>
            <AddOrderForm />
        </div>
    );
}

export default AddOrder;