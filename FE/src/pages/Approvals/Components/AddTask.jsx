import AddTaskForm from "./AddTaskForm";

function AddTask() {
    return (
        <div className="w-full space-y-6">
            {/* --- HEADER SECTION --- */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                    Add Task
                </h1>
                {/* <p className="text-sm text-slate-500 mt-1">
                    Fill in the details below to schedule and assign a new task.
                </p> */}
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/70">
                <AddTaskForm />
            </div>
        </div>
    );
}

export default AddTask;