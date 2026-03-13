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
import { Textarea } from "@/components/ui/textarea";
import { Check, Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Treatment } from "../backend.d";
import {
  useAddTreatment,
  useRemoveTreatment,
  useUpdateTreatment,
} from "../hooks/useQueries";

interface TreatmentManagerProps {
  hospitalId: bigint;
  treatments: Treatment[];
}

interface TreatmentForm {
  conditionName: string;
  treatmentName: string;
  description: string;
}

const DEFAULT_FORM: TreatmentForm = {
  conditionName: "",
  treatmentName: "",
  description: "",
};

export default function TreatmentManager({
  hospitalId,
  treatments,
}: TreatmentManagerProps) {
  const [open, setOpen] = useState(false);
  const [editTreatment, setEditTreatment] = useState<Treatment | null>(null);
  const [form, setForm] = useState<TreatmentForm>(DEFAULT_FORM);
  const [confirmDelete, setConfirmDelete] = useState<bigint | null>(null);

  const add = useAddTreatment(hospitalId);
  const update = useUpdateTreatment(hospitalId);
  const remove = useRemoveTreatment(hospitalId);

  const openAdd = () => {
    setEditTreatment(null);
    setForm(DEFAULT_FORM);
    setOpen(true);
  };
  const openEdit = (t: Treatment) => {
    setEditTreatment(t);
    setForm({
      conditionName: t.conditionName,
      treatmentName: t.treatmentName,
      description: t.description,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editTreatment) {
        await update.mutateAsync({ treatmentId: editTreatment.id, ...form });
        toast.success("Treatment updated");
      } else {
        await add.mutateAsync(form);
        toast.success("Treatment added");
      }
      setOpen(false);
    } catch {
      toast.error("Failed to save treatment");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await remove.mutateAsync(id);
      toast.success("Treatment removed");
      setConfirmDelete(null);
    } catch {
      toast.error("Failed to remove treatment");
    }
  };

  const isPending = add.isPending || update.isPending;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-foreground">Treatment Methods</h3>
        <Button
          size="sm"
          onClick={openAdd}
          className="bg-teal-700 hover:bg-teal-800 text-white gap-2"
          data-ocid="treatment.add_button"
        >
          <Plus className="w-4 h-4" /> Add Treatment
        </Button>
      </div>

      {treatments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-xl">
          No treatments listed yet. Add your first treatment method.
        </div>
      ) : (
        <div className="space-y-3">
          {treatments.map((t, idx) => {
            const ocid = idx < 3 ? idx + 1 : 3;
            return (
              <div
                key={t.id.toString()}
                className="p-4 bg-teal-50 rounded-xl border border-teal-100 flex items-start justify-between gap-4"
                data-ocid={`treatment.item.${ocid}`}
              >
                <div className="flex-1">
                  <div className="text-sm font-semibold text-teal-800">
                    {t.treatmentName}
                  </div>
                  <div className="text-xs text-teal-600 mb-1">
                    For: {t.conditionName}
                  </div>
                  {t.description && (
                    <p className="text-sm text-teal-700/80">{t.description}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    className="p-1.5 hover:bg-teal-100 rounded"
                    data-ocid={`treatment.edit_button.${ocid}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(t.id)}
                    className="p-1.5 hover:bg-red-50 text-red-500 rounded"
                    data-ocid={`treatment.delete_button.${ocid}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editTreatment ? "Edit Treatment" : "Add Treatment"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Condition Name</Label>
              <Input
                value={form.conditionName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, conditionName: e.target.value }))
                }
                placeholder="e.g. Hypertension"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Treatment Name</Label>
              <Input
                value={form.treatmentName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, treatmentName: e.target.value }))
                }
                placeholder="e.g. ACE Inhibitor Therapy"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Describe the treatment approach..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="bg-teal-700 hover:bg-teal-800 text-white"
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
            <DialogTitle>Remove Treatment</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove this treatment? This cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                confirmDelete !== null && handleDelete(confirmDelete)
              }
              disabled={remove.isPending}
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
