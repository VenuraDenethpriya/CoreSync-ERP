import { Roles } from "@/const/const";
import { useUser } from "@clerk/clerk-react";
import { Pencil, Trash2, Barcode, RefreshCw, Package } from "lucide-react"

function ActionMenu({ item, onClose, onOpenDialog }) {
  const { user } = useUser();


  if (user.publicMetadata.role == Roles.WAREHOUSE_STAFF) {
    return <section>
      <div
        className="bg-white border border-gray-200 rounded-xl shadow-xl p-2 min-w-[200px]"
        onClick={(e) => e.stopPropagation()}
        style={{
          zIndex: 99999,
          position: 'fixed'
        }}
      >
        <ul className="space-y-1">
          {/* Usage Dialog */}
          <li
            className="flex items-center gap-2 text-sm font-medium hover:bg-gray-100 rounded-md px-3 py-2 cursor-pointer transition w-full"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDialog('usage', item);
            }}
          >
            <Package size={16} /> Usage
          </li>
        </ul>
      </div>
    </section>;
  }
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
          {/* Usage Dialog */}
          {/* <li
            className="flex items-center gap-2 text-sm font-medium hover:bg-gray-100 rounded-md px-3 py-2 cursor-pointer transition w-full"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDialog('usage', item);
            }}
          >
            <Package size={16} /> Usage
          </li> */}

          {/* Restock Dialog */}
          <li
            className="flex items-center gap-2 text-sm font-medium hover:bg-gray-100 rounded-md px-3 py-2 cursor-pointer transition w-full"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDialog('restock', item);
            }}
          >
            <RefreshCw size={16} /> Restock
          </li>

          {/* Generate Barcode */}
          <li
            className="flex items-center gap-2 text-sm font-medium hover:bg-gray-100 rounded-md px-3 py-2 cursor-pointer transition w-full"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDialog('barcode', item);
              if (onClose) onClose();
            }}
          >
            <Barcode size={16} /> Generate Barcode
          </li>

          {/* Edit Dialog */}
          {/* <li
            className="flex items-center gap-2 text-sm font-medium hover:bg-gray-100 rounded-md px-3 py-2 cursor-pointer transition w-full"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDialog('edit', item);
            }}
          >
            <Pencil size={16} /> Edit
          </li> */}

          {/* Delete Alert */}
          {/* <li
            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md px-3 py-2 cursor-pointer transition w-full"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDialog('delete', item);
            }}
          >
            <Trash2 size={16} /> Delete
          </li> */}
        </ul>
      </div>
    </section>
  )
}

export default ActionMenu