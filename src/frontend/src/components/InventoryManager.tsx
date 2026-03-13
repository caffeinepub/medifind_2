import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, Edit2, Loader2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { InventoryItem } from "../backend.d";
import {
  useAddInventoryItem,
  useRemoveInventoryItem,
  useUpdateInventoryItem,
} from "../hooks/useQueries";

interface InventoryManagerProps {
  hospitalId: bigint;
  items: InventoryItem[];
}

interface ItemForm {
  name: string;
  category: string;
  available: boolean;
  quantity: string;
  unit: string;
}

const DEFAULT_FORM: ItemForm = {
  name: "",
  category: "",
  available: true,
  quantity: "0",
  unit: "",
};

export default function InventoryManager({
  hospitalId,
  items,
}: InventoryManagerProps) {
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<ItemForm>(DEFAULT_FORM);
  const [confirmDelete, setConfirmDelete] = useState<bigint | null>(null);

  const add = useAddInventoryItem(hospitalId);
  const update = useUpdateInventoryItem(hospitalId);
  const remove = useRemoveInventoryItem(hospitalId);

  const openAdd = () => {
    setEditItem(null);
    setForm(DEFAULT_FORM);
    setOpen(true);
  };
  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setForm({
      name: item.name,
      category: item.category,
      available: item.available,
      quantity: item.quantity.toString(),
      unit: item.unit,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    const data = {
      name: form.name,
      category: form.category,
      available: form.available,
      quantity: BigInt(form.quantity || 0),
      unit: form.unit,
    };
    try {
      if (editItem) {
        await update.mutateAsync({ itemId: editItem.id, ...data });
        toast.success("Item updated");
      } else {
        await add.mutateAsync(data);
        toast.success("Item added");
      }
      setOpen(false);
    } catch {
      toast.error("Failed to save item");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await remove.mutateAsync(id);
      toast.success("Item removed");
      setConfirmDelete(null);
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const isPending = add.isPending || update.isPending;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-foreground">Inventory Items</h3>
        <Button
          size="sm"
          onClick={openAdd}
          className="bg-teal-700 hover:bg-teal-800 text-white gap-2"
          data-ocid="inventory.add_button"
        >
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-xl">
          No inventory items yet. Add your first item.
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Available</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => {
                const ocid = idx < 3 ? idx + 1 : 3;
                return (
                  <TableRow
                    key={item.id.toString()}
                    data-ocid={`inventory.item.${ocid}`}
                  >
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.category}
                    </TableCell>
                    <TableCell>{item.quantity.toString()}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          item.available
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.available ? "Yes" : "No"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="p-1.5 hover:bg-accent rounded"
                          data-ocid={`inventory.edit_button.${ocid}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(item.id)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded"
                          data-ocid={`inventory.delete_button.${ocid}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="inventory.dialog">
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Edit Item" : "Add Inventory Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Paracetamol"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Input
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                placeholder="e.g. Medication"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, quantity: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Unit</Label>
                <Input
                  value={form.unit}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, unit: e.target.value }))
                  }
                  placeholder="e.g. boxes"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.available}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, available: v }))
                }
                id="avail-switch"
              />
              <Label htmlFor="avail-switch">Available</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="inventory.cancel_button"
            >
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="bg-teal-700 hover:bg-teal-800 text-white"
              data-ocid="inventory.save_button"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Check className="w-4 h-4 mr-1" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmDelete !== null}
        onOpenChange={() => setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Item</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove this inventory item? This cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              data-ocid="inventory.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                confirmDelete !== null && handleDelete(confirmDelete)
              }
              disabled={remove.isPending}
              data-ocid="inventory.confirm_button"
            >
              {remove.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
