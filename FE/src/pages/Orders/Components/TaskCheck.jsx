import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label";

function TaskCheck() {
    return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Checkbox id="terms" />
        <Label htmlFor="terms">Accept terms and conditions</Label>
      </div>
      <div className="flex items-start gap-3">
        <Checkbox id="terms-2" defaultChecked />
        <div className="grid gap-2">
          <Label htmlFor="terms-2">Accept terms and conditions</Label>
        </div>
      </div>
    </div>
  )
}

export default TaskCheck;