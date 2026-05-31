import { Plus } from "lucide-react"

function ActionMenu({ call, onClose, onOpenDialog }) {


  return (
    <section>
      <div
        className="bg-white border border-gray-200 rounded-xl shadow-xl p-2 min-w-[200px]"
        onClick={(e) => e.stopPropagation()}
        style={{
          zIndex: 99999,
          position: 'absolute'
        }}
      >
        <ul className="space-y-1">
          <li
            className="flex items-center gap-2 text-sm font-medium hover:bg-gray-100 rounded-md px-3 py-2 cursor-pointer transition w-full"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDialog('addToSale', call);
            }}
          >
            <Plus size={16} /> Add to sale
          </li>
        </ul>
      </div>
    </section>
  )
}

export default ActionMenu