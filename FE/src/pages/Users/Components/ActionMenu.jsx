import { Pencil, Trash2 } from "lucide-react"

function ActionMenu({ user, onClose, onOpenDialog }) {


  return (
    <section>
      <div
        className="bg-white border border-gray-200 rounded-xl shadow-xl p-2 min-w-[200px]"
        onClick={(e) => e.stopPropagation()}
        style={{
          zIndex: 99999,
          position: 'absolute',
        }}
      >
        <ul className="space-y-1">
          {/* Edit Dialog */}
          <li
            className="flex items-center gap-2 text-sm font-medium hover:bg-gray-100 rounded-md px-3 py-2 cursor-pointer transition w-full"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDialog('edit', user);
            }}
          >
            <Pencil size={16} /> Edit
          </li>

          {/* Delete Alert */}
          <li
            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md px-3 py-2 cursor-pointer transition w-full"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDialog('delete', user);
            }}
          >
            <Trash2 size={16} /> Delete
          </li>
        </ul>
      </div>
    </section>
  )
}

export default ActionMenu