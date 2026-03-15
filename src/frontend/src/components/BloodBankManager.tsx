import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { InventoryItem } from "../backend.d";
import {
  useAddInventoryItem,
  useUpdateInventoryItem,
} from "../hooks/useQueries";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface BloodTypeEntry {
  type: string;
  quantity: string;
  available: boolean;
  itemId: bigint | null;
}

interface RareBloodTypeEntry {
  id: string; // local unique key
  name: string;
  quantity: string;
  available: boolean;
  itemId: bigint | null;
}

interface BloodBankManagerProps {
  hospitalId: bigint;
  items: InventoryItem[];
}

export default function BloodBankManager({
  hospitalId,
  items,
}: BloodBankManagerProps) {
  const add = useAddInventoryItem(hospitalId);
  const update = useUpdateInventoryItem(hospitalId);

  // ── Standard blood types ────────────────────────────────────────────────
  const [entries, setEntries] = useState<BloodTypeEntry[]>(() =>
    BLOOD_TYPES.map((type) => {
      const existing = items.find(
        (i) => i.category.toLowerCase() === "blood type" && i.name === type,
      );
      return {
        type,
        quantity: existing ? existing.quantity.toString() : "0",
        available: existing ? existing.available : false,
        itemId: existing ? existing.id : null,
      };
    }),
  );

  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    setEntries(
      BLOOD_TYPES.map((type) => {
        const existing = items.find(
          (i) => i.category.toLowerCase() === "blood type" && i.name === type,
        );
        return {
          type,
          quantity: existing ? existing.quantity.toString() : "0",
          available: existing ? existing.available : false,
          itemId: existing ? existing.id : null,
        };
      }),
    );
  }, [items]);

  const updateEntry = (
    type: string,
    field: keyof Omit<BloodTypeEntry, "type" | "itemId">,
    value: string | boolean,
  ) => {
    setEntries((prev) =>
      prev.map((e) => (e.type === type ? { ...e, [field]: value } : e)),
    );
  };

  const handleSave = async (entry: BloodTypeEntry) => {
    setSaving(entry.type);
    const data = {
      name: entry.type,
      category: "Blood Type",
      available: entry.available,
      quantity: BigInt(entry.quantity || 0),
      unit: "units",
    };
    try {
      if (entry.itemId !== null) {
        await update.mutateAsync({ itemId: entry.itemId, ...data });
      } else {
        await add.mutateAsync(data);
      }
      toast.success(`${entry.type} blood type saved`);
    } catch {
      toast.error(`Failed to save ${entry.type}`);
    } finally {
      setSaving(null);
    }
  };

  const bloodTypeColor = (type: string) => {
    if (type.includes("AB")) return "bg-purple-50 border-purple-200";
    if (type.startsWith("A")) return "bg-blue-50 border-blue-200";
    if (type.startsWith("B")) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  const badgeColor = (type: string) => {
    if (type.includes("AB")) return "bg-purple-100 text-purple-700";
    if (type.startsWith("A")) return "bg-blue-100 text-blue-700";
    if (type.startsWith("B")) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  // ── Rare blood types ────────────────────────────────────────────────────
  const [rareEntries, setRareEntries] = useState<RareBloodTypeEntry[]>(() => {
    const existing = items.filter(
      (i) => i.category.toLowerCase() === "rare blood type",
    );
    if (existing.length === 0) return [];
    return existing.map((i, idx) => ({
      id: `existing-${idx}`,
      name: i.name,
      quantity: i.quantity.toString(),
      available: i.available,
      itemId: i.id,
    }));
  });

  const [rareSaving, setRareSaving] = useState<string | null>(null);

  useEffect(() => {
    const existing = items.filter(
      (i) => i.category.toLowerCase() === "rare blood type",
    );
    setRareEntries((prev) => {
      // Merge: update itemIds for saved entries; keep unsaved (itemId=null) rows
      const merged: RareBloodTypeEntry[] = [];

      // Keep unsaved local rows
      const unsaved = prev.filter((r) => r.itemId === null);

      // Map saved backend items
      for (const item of existing) {
        const prevRow = prev.find(
          (r) =>
            r.itemId !== null && r.itemId.toString() === item.id.toString(),
        );
        merged.push({
          id: prevRow?.id ?? `existing-${item.id.toString()}`,
          name: item.name,
          quantity: item.quantity.toString(),
          available: item.available,
          itemId: item.id,
        });
      }

      return [...merged, ...unsaved];
    });
  }, [items]);

  const addRareEntry = () => {
    setRareEntries((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        name: "",
        quantity: "0",
        available: false,
        itemId: null,
      },
    ]);
  };

  const updateRareEntry = (
    id: string,
    field: keyof Omit<RareBloodTypeEntry, "id" | "itemId">,
    value: string | boolean,
  ) => {
    setRareEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };

  const removeRareEntry = (id: string) => {
    setRareEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSaveRare = async (entry: RareBloodTypeEntry) => {
    if (!entry.name.trim()) {
      toast.error("Please enter a blood type name");
      return;
    }
    setRareSaving(entry.id);
    const data = {
      name: entry.name.trim(),
      category: "Rare Blood Type",
      available: entry.available,
      quantity: BigInt(entry.quantity || 0),
      unit: "units",
    };
    try {
      if (entry.itemId !== null) {
        await update.mutateAsync({ itemId: entry.itemId, ...data });
      } else {
        await add.mutateAsync(data);
      }
      toast.success(`${entry.name} saved`);
    } catch {
      toast.error(`Failed to save ${entry.name}`);
    } finally {
      setRareSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Standard blood types ── */}
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Set the available quantity and status for each blood type. Click Save
          on each card to update.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {entries.map((entry) => (
            <div
              key={entry.type}
              className={`rounded-xl border p-4 space-y-3 ${bloodTypeColor(entry.type)}`}
              data-ocid={`bloodbank.${entry.type.replace("+", "pos").replace("-", "neg")}.card`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-bold text-lg px-3 py-1 rounded-full ${badgeColor(entry.type)}`}
                >
                  {entry.type}
                </span>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`avail-${entry.type}`} className="text-xs">
                    Available
                  </Label>
                  <Switch
                    id={`avail-${entry.type}`}
                    checked={entry.available}
                    onCheckedChange={(v) =>
                      updateEntry(entry.type, "available", v)
                    }
                    data-ocid={`bloodbank.${entry.type.replace("+", "pos").replace("-", "neg")}.switch`}
                  />
                </div>
              </div>
              <div className="flex items-end gap-3">
                <div className="flex-1 grid gap-1">
                  <Label className="text-xs text-muted-foreground">
                    Quantity (units)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={entry.quantity}
                    onChange={(e) =>
                      updateEntry(entry.type, "quantity", e.target.value)
                    }
                    className="bg-white h-9"
                    data-ocid={`bloodbank.${entry.type.replace("+", "pos").replace("-", "neg")}.input`}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSave(entry)}
                  disabled={saving === entry.type}
                  className="bg-teal-700 hover:bg-teal-800 text-white h-9"
                  data-ocid={`bloodbank.${entry.type.replace("+", "pos").replace("-", "neg")}.save_button`}
                >
                  {saving === entry.type ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Rare Blood Types section ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-rose-700 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-600 text-xs font-bold">
                ✦
              </span>
              Rare Blood Types
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add rare or special blood types not covered by standard ABO/Rh
              groups (e.g. Rh-null, Bombay hh, Duffy-null).
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={addRareEntry}
            className="border-rose-300 text-rose-700 hover:bg-rose-50 hover:text-rose-800 gap-1.5 shrink-0"
            data-ocid="bloodbank.rare.primary_button"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Rare Blood Type
          </Button>
        </div>

        {rareEntries.length === 0 ? (
          <div
            className="rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/50 py-8 text-center"
            data-ocid="bloodbank.rare.empty_state"
          >
            <p className="text-sm text-rose-400 font-medium">
              No rare blood types added yet
            </p>
            <p className="text-xs text-rose-300 mt-1">
              Click &quot;Add Rare Blood Type&quot; to register a rare type.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {rareEntries.map((entry, idx) => (
              <div
                key={entry.id}
                className="rounded-xl border border-rose-200 bg-rose-50 p-4 space-y-3"
                data-ocid={`bloodbank.rare.item.${idx + 1}`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-500">
                    Rare Blood Type #{idx + 1}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeRareEntry(entry.id)}
                    className="w-7 h-7 text-rose-400 hover:text-rose-700 hover:bg-rose-100"
                    data-ocid={`bloodbank.rare.delete_button.${idx + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="grid gap-1">
                    <Label className="text-xs text-rose-600 font-medium">
                      Blood Type Name
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g. Rh-null, Bombay (hh)"
                      value={entry.name}
                      onChange={(e) =>
                        updateRareEntry(entry.id, "name", e.target.value)
                      }
                      className="bg-white border-rose-200 focus-visible:ring-rose-400 h-9 text-sm"
                      data-ocid={`bloodbank.rare.input.${idx + 1}`}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs text-rose-600 font-medium">
                      Availability (units)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={entry.quantity}
                      onChange={(e) =>
                        updateRareEntry(entry.id, "quantity", e.target.value)
                      }
                      className="bg-white border-rose-200 focus-visible:ring-rose-400 h-9 text-sm"
                      data-ocid={`bloodbank.rare.input.${idx + 1}`}
                    />
                  </div>
                </div>

                {/* Available toggle + Save */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`rare-avail-${entry.id}`}
                      checked={entry.available}
                      onCheckedChange={(v) =>
                        updateRareEntry(entry.id, "available", v)
                      }
                      data-ocid={`bloodbank.rare.switch.${idx + 1}`}
                    />
                    <Label
                      htmlFor={`rare-avail-${entry.id}`}
                      className="text-xs text-rose-600 cursor-pointer"
                    >
                      Available
                    </Label>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSaveRare(entry)}
                    disabled={rareSaving === entry.id}
                    className="bg-rose-600 hover:bg-rose-700 text-white h-9 gap-1.5"
                    data-ocid={`bloodbank.rare.save_button.${idx + 1}`}
                  >
                    {rareSaving === entry.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
