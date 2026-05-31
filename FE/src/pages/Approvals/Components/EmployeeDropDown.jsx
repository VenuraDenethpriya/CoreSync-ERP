import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Select from "react-select";
import { useAuth, useUser } from "@clerk/clerk-react";
import { fetchUsersList } from "@/api/userApi";
import { updateApproval } from "@/api/orderApi";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

function EmployeeDropDown() {
    const { orderId } = useParams();
    const { getToken } = useAuth();
    const { user } = useUser();
    const [warehouseEmployees, setWarehouseEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const navigate = useNavigate();

    const search = "WAREHOUSE_STAFF";
    const limit = 100;
    const offset = 0;

    useEffect(() => {
        const fetchWarehouseEmployees = async () => {
            try {
                const token = await getToken();
                const response = await fetchUsersList(token, search, limit, offset);
                setWarehouseEmployees(
                    response?.data?.items.map((emp) => ({
                        value: emp.id,
                        label: `${emp.first_name} ${emp.last_name}`,
                    }))
                );
            } catch (error) {
                console.error("Error fetching warehouse employees:", error);
            }
        };
        fetchWarehouseEmployees();
    }, []);


    const handleSelectChange = (selectedOptions) => {
        const labels = selectedOptions ? selectedOptions.map((opt) => opt.label) : [];
        setSelectedEmployees(labels);
        console.log("Selected Employee Labels:", labels);
    };

    // Add employee
    const handleAddEmployee = async (e) => {
        e.preventDefault();
        try {
            const token = await getToken();
            const response = await updateApproval(token, orderId, {
                assignee: selectedEmployees,
                supervisor: user.fullName,
            });
            if (response.message === "success") {
                toast.success("Employee(s) added successfully!", {
                    position: "bottom-right",
                });
            }
        } catch (error) {
            console.error("Error adding employee:", error);
        }
    };

    return (
        <form>
            <div className="flex items-center gap-x-64">
                <div>
                    <Label htmlFor="employee">Employee Name</Label>
                </div>
                <div className="flex gap-x-6">
                    <Select
                        isMulti
                        options={warehouseEmployees}
                        onChange={handleSelectChange}
                        placeholder="Select Warehouse Employee"
                        className="text-black"
                    />
                    <Button
                        type="button"
                        className="bg-blue-800 hover:bg-blue-900"
                        onClick={handleAddEmployee}
                    >
                        Add
                    </Button>
                </div>
            </div>
        </form>
    );
}

export default EmployeeDropDown;
