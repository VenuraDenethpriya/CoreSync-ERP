import AddUserForm from "./Components/AddUserForm";

function AddUser() {
    
    return (
        <>
        <div className="max-w-screen sm:m-6 py-6 sm:px-14 px-6 bg-slate-50 rounded-md">
            <div >
                <h1 className="sm:text-3xl text-xl font-semibold py-4">Add User</h1>
            </div>
            <AddUserForm />
        </div>
        </>        
    );
}

export default AddUser;