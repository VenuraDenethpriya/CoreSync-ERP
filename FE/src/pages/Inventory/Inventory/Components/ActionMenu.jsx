import { Roles } from "@/const/const";
import { useUser } from "@clerk/clerk-react";
import { Pencil, Trash2, Barcode, RefreshCw, Package } from "lucide-react"

function ActionMenu({ item, onClose, onOpenDialog }) {
  const { user } = useUser();

  if (user?.publicMetadata?.role === Roles.WAREHOUSE_STAFF) {
    return (
      <section>
        <div
          className="bg-white border border-slate-200/70 rounded-2xl shadow-xl p-2 min-w-[200px]"
          onClick={(e) => e.stopPropagation()}
          style={{
            zIndex: 99999,
            position: 'fixed'
          }}
        >
          <ul className="space-y-1">
            {/* Usage Dialog */}
            <li
              className="flex items-center gap-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl px-3.5 py-2.5 cursor-pointer transition-all w-full"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDialog('usage', item);
                if (onClose) onClose();
              }}
            >
              <Package size={16} className="text-slate-500" /> Usage
            </li>
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div
        className="bg-white border border-slate-200/70 rounded-2xl shadow-xl p-2 min-w-[200px]"
        onClick={(e) => e.stopPropagation()}
        style={{
          zIndex: 99999,
          position: 'absolute'
        }}
      >
        <ul className="space-y-1">
          {/* Restock Dialog */}
          <li
            className="flex items-center gap-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl px-3.5 py-2.5 cursor-pointer transition-all w-full"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDialog('restock', item);
              if (onClose) onClose();
            }}
          >
            <RefreshCw size={16} className="text-slate-500" /> Restock
          </li>

          {/* Generate Barcode */}
          <li
            className="flex items-center gap-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl px-3.5 py-2.5 cursor-pointer transition-all w-full"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDialog('barcode', item);
              if (onClose) onClose();
            }}
          >
            <Barcode size={16} className="text-slate-500" /> Generate Barcode
          </li>
        </ul>
      </div>
    </section>
  )
}

export default ActionMenu;