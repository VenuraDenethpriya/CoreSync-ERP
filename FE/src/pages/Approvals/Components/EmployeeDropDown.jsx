import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@clerk/clerk-react";
import { useParams } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchUsersList } from "@/api/userApi";
import { updateApproval } from "@/api/orderApi";
import { Select } from "@/components/ui/select";

function EmployDropDown() {
    const { orderId } = useParams();
    const { getToken } = useAuth();

    // Form State
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [description, setDescription] = useState("");

    // API State for Dropdown Options
    const [employeesOptions, setEmployeesOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch employee list on mount
    useEffect(() => {
        const loadEmployees = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const token = await getToken();

                // Fetching staff. Adjust role ("WAREHOUSE_STAFF") or pagination if needed.
                const response = await fetchUsersList(token, "WAREHOUSE_STAFF", 100, 0);
                const items = response?.data?.items || [];

                // Map the response to the { value, label } format expected by MultiSelectDropdown
                const validEmployees = items
                    .filter(emp => emp.clerk_id && emp.clerk_id.trim() !== "")
                    .map((emp) => ({
                        id: emp.id,
                        value: emp.clerk_id,
                        label: `${emp.first_name} ${emp.last_name}`,
                    }));

                setEmployeesOptions(validEmployees);
            } catch (err) {
                console.error("Error fetching employees:", err);
                setError("Failed to load employees.");
            } finally {
                setIsLoading(false);
            }
        };

        loadEmployees();
    }, [getToken]);

    const handleSelectChange = (newSelectedValues) => {
        setSelectedEmployees(newSelectedValues);
    };

    const handleSend = async () => {
        try {
            const token = await getToken();

            // Adjust this payload structure to match your backend requirements
            const payload = {
                assignees: selectedEmployees, // Array of clerk_ids
                description: description,
            };

            const response = await updateApproval(token, orderId, payload);

            if (response.message === "success") {
                toast.success("Employees assigned successfully!", { position: "bottom-right" });

                // Optional: Clear form after successful assignment
                // setSelectedEmployees([]);
                // setDescription("");
            }
        } catch (error) {
            console.error("Error assigning employees:", error);
            toast.error("Failed to assign employees.", { position: "bottom-right" });
        }
    };

    return (
        <form>
            {/* Employee Selection Row */}
            <div className="flex items-start gap-x-64 pb-2">
                <div className="mt-2 w-32 shrink-0">
                    <Label className="employee-label font-semibold text-gray-700" htmlFor="employee-label">
                        Assign Employees
                    </Label>
                </div>
                <div className="flex flex-col gap-y-2 ml-4 w-72">
                    <Select
                        isMulti
                        options={employeesOptions}
                        value={selectedEmployees}
                        onChange={handleSelectChange}
                        isLoading={isLoading}
                        error={error}
                        placeholder="Select employees..."
                    />
                </div>
            </div>

            {/* Description Row */}
            <div className="flex items-start gap-x-64 pt-4">
                <div className="mt-2 w-32 shrink-0">
                    <Label className="description font-semibold text-gray-700" htmlFor="description">
                        Task Description
                    </Label>
                </div>
                <div className="flex gap-x-6 ml-4">
                    <Textarea
                        placeholder="Enter task or assignment details"
                        className="text-black w-72 resize-none"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <div className="flex items-end">
                        <Button
                            type="button"
                            className="bg-blue-800 hover:bg-blue-900 ml-2 h-10 px-6 shadow-sm"
                            onClick={handleSend}
                            disabled={selectedEmployees.length === 0 || !description}
                        >
                            Assign
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default EmployDropDown;