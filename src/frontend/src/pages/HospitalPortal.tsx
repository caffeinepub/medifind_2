import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Bed,
  Building2,
  Cpu,
  Droplet,
  Edit2,
  FlaskConical,
  HeartHandshake,
  Hospital,
  Info,
  Loader2,
  LogIn,
  LogOut,
  Package,
  Pill,
  Plus,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import type { Hospital as HospitalType } from "../backend.d";
import BloodBankManager from "../components/BloodBankManager";
import HospitalForm from "../components/HospitalForm";
import InventoryManager from "../components/InventoryManager";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetAllHospitals, useGetHospitalDetails } from "../hooks/useQueries";

const INVENTORY_TABS = [
  {
    value: "pharmaceutical",
    label: "Pharmaceutical Inventory",
    category: "Pharmaceutical Inventory",
    icon: Pill,
    ocid: "portal.pharmaceutical.tab",
  },
  {
    value: "organ-tissue",
    label: "Organ & Tissue Bank",
    category: "Organ & Tissue Bank",
    icon: HeartHandshake,
    ocid: "portal.organ-tissue.tab",
  },
  {
    value: "medical-supplies",
    label: "Medical Supplies & Consumables",
    category: "Medical Supplies & Consumables",
    icon: Package,
    ocid: "portal.medical-supplies.tab",
  },
  {
    value: "equipment",
    label: "Equipment Inventory",
    category: "Equipment Inventory",
    icon: Cpu,
    ocid: "portal.equipment.tab",
  },
  {
    value: "lab-diagnostic",
    label: "Lab & Diagnostic Supplies",
    category: "Lab & Diagnostic Supplies",
    icon: FlaskConical,
    ocid: "portal.lab-diagnostic.tab",
  },
  {
    value: "dietary",
    label: "Dietary & Nutrition Inventory",
    category: "Dietary & Nutrition Inventory",
    icon: UtensilsCrossed,
    ocid: "portal.dietary.tab",
  },
  {
    value: "linen",
    label: "Linen & Housekeeping",
    category: "Linen & Housekeeping",
    icon: Bed,
    ocid: "portal.linen.tab",
  },
] as const;

export default function HospitalPortal() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = !!identity;
  const principal = identity?.getPrincipal().toString();

  const [editMode, setEditMode] = useState(false);
  const [registerMode, setRegisterMode] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<bigint | null>(
    null,
  );

  const { data: allHospitals, isLoading: loadingHospitals } =
    useGetAllHospitals();

  const myHospitals: HospitalType[] =
    allHospitals?.filter((h) => h.owner.toString() === principal) ?? [];

  const selectedHospital =
    myHospitals.find((h) => h.id === selectedHospitalId) ?? null;

  const { data: hospitalDetails, isLoading: loadingDetails } =
    useGetHospitalDetails(selectedHospitalId);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl medical-gradient flex items-center justify-center mx-auto mb-6">
            <Hospital className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display text-3xl text-foreground mb-3">
            Hospital Portal
          </h2>
          <p className="text-muted-foreground mb-8">
            Sign in to manage your hospital's profile, inventory, and treatment
            listings.
          </p>
          <Button
            size="lg"
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white h-12 text-base"
            data-ocid="portal.login_button"
          >
            {loginStatus === "logging-in" ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <LogIn className="w-5 h-5 mr-2" />
            )}
            Sign In
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Uses Internet Identity — decentralized, secure, no password
            required.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Portal header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-foreground">
            Hospital Portal
          </h2>
          <p className="text-sm text-muted-foreground mt-1 font-mono truncate max-w-xs">
            {principal?.slice(0, 20)}...
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => clear()}
          className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>

      {/* Loading */}
      {loadingHospitals && (
        <div className="space-y-4" data-ocid="portal.loading_state">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {/* HOSPITAL LIST VIEW */}
      {!loadingHospitals && selectedHospitalId === null && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-display text-xl text-foreground">
              My Hospitals
            </h3>
            {!registerMode && (
              <Button
                onClick={() => setRegisterMode(true)}
                className="bg-teal-700 hover:bg-teal-800 text-white gap-2"
                data-ocid="portal.register_new_button"
              >
                <Plus className="w-4 h-4" /> Register New Hospital
              </Button>
            )}
          </div>

          {/* Registration form */}
          {registerMode && (
            <div className="bg-white rounded-2xl border border-border p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl">Register New Hospital</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRegisterMode(false)}
                  data-ocid="portal.register.cancel_button"
                >
                  Cancel
                </Button>
              </div>
              <HospitalForm onSuccess={() => setRegisterMode(false)} />
            </div>
          )}

          {/* Hospital list */}
          {myHospitals.length > 0 ? (
            <div className="grid gap-4">
              {myHospitals.map((hospital, index) => (
                <div
                  key={hospital.id.toString()}
                  className="bg-white rounded-2xl border border-border p-5 shadow-xs flex items-center justify-between gap-4"
                  data-ocid={`portal.hospital_card.${index + 1}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-teal-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {hospital.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {hospital.address.street}, {hospital.address.city},{" "}
                        {hospital.address.state}
                      </p>
                      {hospital.phone && (
                        <p className="text-sm text-muted-foreground">
                          📞 {hospital.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedHospitalId(hospital.id);
                      setEditMode(false);
                    }}
                    className="gap-2 border-teal-200 text-teal-700 hover:bg-teal-50 shrink-0"
                    data-ocid={`portal.hospital_manage_button.${index + 1}`}
                  >
                    Manage
                  </Button>
                </div>
              ))}
            </div>
          ) : !registerMode ? (
            <div
              className="text-center py-16 border-2 border-dashed border-teal-200 rounded-2xl bg-teal-50/50"
              data-ocid="portal.empty_state"
            >
              <Hospital className="w-12 h-12 text-teal-400 mx-auto mb-4" />
              <h3 className="font-display text-xl text-foreground mb-2">
                No Hospital Registered
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Register your hospital to appear in patient searches.
              </p>
              <Button
                onClick={() => setRegisterMode(true)}
                className="bg-teal-700 hover:bg-teal-800 text-white"
                data-ocid="portal.register_button"
              >
                Register Your Hospital
              </Button>
            </div>
          ) : null}
        </div>
      )}

      {/* HOSPITAL DETAIL VIEW */}
      {!loadingHospitals && selectedHospitalId !== null && selectedHospital && (
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedHospitalId(null);
              setEditMode(false);
            }}
            className="gap-2 text-teal-700 hover:bg-teal-50 -ml-2"
            data-ocid="portal.back_button"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Hospitals
          </Button>

          {editMode && (
            <div className="bg-white rounded-2xl border border-border p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl">Edit Hospital Profile</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMode(false)}
                  data-ocid="portal.edit.cancel_button"
                >
                  Cancel
                </Button>
              </div>
              <HospitalForm
                existing={selectedHospital}
                onSuccess={() => setEditMode(false)}
              />
            </div>
          )}

          {!editMode && (
            <div className="bg-white rounded-2xl border border-border p-6 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-xl text-foreground">
                    {selectedHospital.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedHospital.address.street},{" "}
                    {selectedHospital.address.city},{" "}
                    {selectedHospital.address.state}{" "}
                    {selectedHospital.address.zip},{" "}
                    {selectedHospital.address.country}
                  </p>
                  {selectedHospital.phone && (
                    <p className="text-sm text-muted-foreground">
                      📞 {selectedHospital.phone}
                    </p>
                  )}
                  {selectedHospital.email && (
                    <p className="text-sm text-muted-foreground">
                      ✉️ {selectedHospital.email}
                    </p>
                  )}
                  {selectedHospital.description && (
                    <p className="text-sm text-foreground mt-3 leading-relaxed">
                      {selectedHospital.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  className="gap-2 border-teal-200 text-teal-700 hover:bg-teal-50 shrink-0 ml-4"
                  data-ocid="portal.edit_button"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </Button>
              </div>
              <div className="mt-4 flex gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  Lat: {selectedHospital.latitude.toFixed(4)}, Lng:{" "}
                  {selectedHospital.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          )}

          {!editMode &&
            (loadingDetails ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : hospitalDetails ? (
              <Tabs defaultValue="pharmaceutical" className="w-full">
                <div className="overflow-x-auto pb-1">
                  <TabsList className="flex flex-nowrap w-max min-w-full h-auto p-1 gap-1">
                    {INVENTORY_TABS.map((tab) => {
                      const Icon = tab.icon;
                      const count = hospitalDetails.inventory.filter(
                        (i) =>
                          i.category.toLowerCase() ===
                          tab.category.toLowerCase(),
                      ).length;
                      return (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="gap-1.5 flex-row py-2 px-3 whitespace-nowrap text-sm"
                          data-ocid={tab.ocid}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{tab.label}</span>
                          <span className="text-xs opacity-60">({count})</span>
                        </TabsTrigger>
                      );
                    })}
                    <TabsTrigger
                      value="bloodbank"
                      className="gap-1.5 flex-row py-2 px-3 whitespace-nowrap text-sm"
                      data-ocid="portal.bloodbank.tab"
                    >
                      <Droplet className="w-4 h-4 shrink-0" />
                      <span>Blood Bank</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {INVENTORY_TABS.map((tab) => (
                  <TabsContent key={tab.value} value={tab.value}>
                    <div className="bg-white rounded-2xl border border-border p-6 shadow-xs">
                      <InventoryManager
                        hospitalId={selectedHospital.id}
                        items={hospitalDetails.inventory}
                        categoryFilter={tab.category}
                        defaultCategory={tab.category}
                      />
                    </div>
                  </TabsContent>
                ))}

                <TabsContent value="bloodbank">
                  <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-xs">
                    <div className="flex items-center gap-2 mb-4">
                      <Droplet className="w-5 h-5 text-red-500" />
                      <h3 className="font-display text-lg text-foreground">
                        Blood Bank
                      </h3>
                    </div>
                    <BloodBankManager
                      hospitalId={selectedHospital.id}
                      items={hospitalDetails.inventory}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            ) : null)}
        </div>
      )}
    </div>
  );
}
