import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Hospital } from "../backend.d";
import { useCreateHospital, useUpdateHospital } from "../hooks/useQueries";

interface HospitalFormProps {
  existing?: Hospital;
  onSuccess: () => void;
}

export default function HospitalForm({
  existing,
  onSuccess,
}: HospitalFormProps) {
  const [form, setForm] = useState({
    name: existing?.name ?? "",
    street: existing?.address.street ?? "",
    city: existing?.address.city ?? "",
    state: existing?.address.state ?? "",
    zip: existing?.address.zip ?? "",
    country: existing?.address.country ?? "",
    latitude: existing?.latitude?.toString() ?? "",
    longitude: existing?.longitude?.toString() ?? "",
    phone: existing?.phone ?? "",
    email: existing?.email ?? "",
    description: existing?.description ?? "",
  });

  const create = useCreateHospital();
  const update = useUpdateHospital();
  const isPending = create.isPending || update.isPending;

  const set =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const address = {
      street: form.street,
      city: form.city,
      state: form.state,
      zip: form.zip,
      country: form.country,
    };
    const lat = Number.parseFloat(form.latitude);
    const lng = Number.parseFloat(form.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error("Invalid latitude or longitude");
      return;
    }
    try {
      if (existing) {
        await update.mutateAsync({
          hospitalId: existing.id,
          name: form.name,
          address,
          latitude: lat,
          longitude: lng,
          phone: form.phone,
          email: form.email,
          description: form.description,
        });
        toast.success("Hospital updated successfully");
      } else {
        await create.mutateAsync({
          name: form.name,
          address,
          latitude: lat,
          longitude: lng,
          phone: form.phone,
          email: form.email,
          description: form.description,
        });
        toast.success("Hospital registered successfully!");
      }
      onSuccess();
    } catch {
      toast.error("Failed to save hospital. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-1.5">
        <Label htmlFor="h-name">Hospital Name *</Label>
        <Input
          id="h-name"
          value={form.name}
          onChange={set("name")}
          required
          placeholder="General City Hospital"
          data-ocid="hospital_form.input"
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-foreground mb-2">
          Address
        </legend>
        <div className="grid gap-1.5">
          <Label htmlFor="h-street">Street *</Label>
          <Input
            id="h-street"
            value={form.street}
            onChange={set("street")}
            required
            placeholder="123 Medical Drive"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="h-city">City *</Label>
            <Input
              id="h-city"
              value={form.city}
              onChange={set("city")}
              required
              placeholder="Springfield"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="h-state">State *</Label>
            <Input
              id="h-state"
              value={form.state}
              onChange={set("state")}
              required
              placeholder="IL"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="h-zip">ZIP Code *</Label>
            <Input
              id="h-zip"
              value={form.zip}
              onChange={set("zip")}
              required
              placeholder="62701"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="h-country">Country *</Label>
            <Input
              id="h-country"
              value={form.country}
              onChange={set("country")}
              required
              placeholder="USA"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-foreground mb-2">
          Location Coordinates
        </legend>
        <p className="text-xs text-muted-foreground">
          Used for distance-based search. Find coordinates at maps.google.com.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="h-lat">Latitude *</Label>
            <Input
              id="h-lat"
              value={form.latitude}
              onChange={set("latitude")}
              required
              placeholder="39.7817"
              type="text"
              inputMode="decimal"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="h-lng">Longitude *</Label>
            <Input
              id="h-lng"
              value={form.longitude}
              onChange={set("longitude")}
              required
              placeholder="-89.6501"
              type="text"
              inputMode="decimal"
            />
          </div>
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="h-phone">Phone</Label>
          <Input
            id="h-phone"
            value={form.phone}
            onChange={set("phone")}
            placeholder="+1 (555) 000-0000"
            type="tel"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="h-email">Email</Label>
          <Input
            id="h-email"
            value={form.email}
            onChange={set("email")}
            placeholder="contact@hospital.com"
            type="email"
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="h-desc">Description</Label>
        <Textarea
          id="h-desc"
          value={form.description}
          onChange={set("description")}
          rows={3}
          placeholder="Brief description of your hospital and specialties..."
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-teal-700 hover:bg-teal-800 text-white h-11"
        data-ocid="hospital_form.submit_button"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        {existing ? "Update Hospital" : "Register Hospital"}
      </Button>
    </form>
  );
}
