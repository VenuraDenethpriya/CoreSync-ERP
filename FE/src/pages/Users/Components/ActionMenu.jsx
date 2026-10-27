import { Pencil, Trash2 } from "lucide-react"

function ActionMenu({ user, onClose, onOpenDialog }) {
  return (
    <section>
      <div
        className="bg-white border border-slate-200/70 rounded-2xl shadow-xl p-2 min-w-[200px]"
        onClick={(e) => e.stopPropagation()}
        style={{
          zIndex: 99999,
          position: 'absolute',
        }}
      >
        <ul className="space-y-1">
          {/* Edit Dialog */}
          <li
            className="flex items-center gap-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl px-3 py-2 cursor-pointer transition-all w-full"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDialog('edit', user);
            }}
          >
            <Pencil size={16} className="text-slate-500" /> Edit
          </li>

          {/* Delete Alert */}
          <li
            className="flex items-center gap-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl px-3 py-2 cursor-pointer transition-all w-full"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDialog('delete', user);
            }}
          >
            <Trash2 size={16} className="text-rose-500" /> Delete
          </li>
        </ul>
      </div>
    </section>
  )
}

export default ActionMenu