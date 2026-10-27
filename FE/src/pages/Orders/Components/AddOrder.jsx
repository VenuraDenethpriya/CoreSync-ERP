import AddOrderForm from "./AddOrderForm";

function AddOrder() {
    return (
        <div className="w-full space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                    New Order
                </h1>
                {/* <p className="text-sm text-slate-500 mt-1">
                    Fill in the quotation reference, product items, pricing, and customer details below to create a new order.
                </p> */}
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/70">
                <AddOrderForm />
            </div>
        </div>
    );
}

export default AddOrder;