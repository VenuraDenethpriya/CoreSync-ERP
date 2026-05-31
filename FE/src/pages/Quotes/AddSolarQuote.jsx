import AddSolarQuoteForm from "./Components/AddSolarQuoteForm";

function AddSolarQuote() {
    return (
        <>
            <div className="max-w-screen sm:m-6 py-6 sm:px-14 px-6 bg-slate-50 rounded-md">
                <div >
                    <h1 className="text-3xl font-semibold py-4">Add Solar</h1>
                </div>
                <AddSolarQuoteForm />
            </div>
        </>
    );
}

export default AddSolarQuote;