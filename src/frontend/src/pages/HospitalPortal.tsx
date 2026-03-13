import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Edit2,
  Hospital,
  Info,
  Loader2,
  LogIn,
  LogOut,
  Package,
  Stethoscope,
} from "lucide-react";
import { useState } from "react";
import type { Hospital as HospitalType } from "../backend.d";
import HospitalForm from "../components/HospitalForm";
import InventoryManager from "../components/InventoryManager";
import TreatmentManager from "../components/TreatmentManager";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetAllHospitals } from "../hooks/useQueries";
import { useGetHospitalDetails } from "../hooks/useQueries";

export default function HospitalPortal() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = !!identity;
  const principal = identity?.getPrincipal().toString();

  const [editMode, setEditMode] = useState(false);

  const { data: allHospitals, isLoading: loadingHospitals } =
    useGetAllHospitals();

  // Find hospital owned by this principal
  const myHospital: HospitalType | null =
    allHospitals?.find((h) => h.owner.toString() === principal) ?? null;

  const { data: hospitalDetails, isLoading: loadingDetails } =
    useGetHospitalDetails(myHospital?.id ?? null);

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

      {/* Loading hospital */}
      {loadingHospitals && (
        <div className="space-y-4" data-ocid="portal.loading_state">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {/* No hospital registered yet */}
      {!loadingHospitals && !myHospital && !editMode && (
        <div className="text-center py-16 border-2 border-dashed border-teal-200 rounded-2xl bg-teal-50/50">
          <Hospital className="w-12 h-12 text-teal-400 mx-auto mb-4" />
          <h3 className="font-display text-xl text-foreground mb-2">
            No Hospital Registered
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Register your hospital to appear in patient searches.
          </p>
          <Button
            onClick={() => setEditMode(true)}
            className="bg-teal-700 hover:bg-teal-800 text-white"
            data-ocid="portal.register_button"
          >
            Register Your Hospital
          </Button>
        </div>
      )}

      {/* Registration / Edit form */}
      {(!loadingHospitals && !myHospital && editMode) ||
      (myHospital && editMode) ? (
        <div className="bg-white rounded-2xl border border-border p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl">
              {myHospital ? "Edit Hospital Profile" : "Register Your Hospital"}
            </h3>
            {myHospital && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
            )}
          </div>
          <HospitalForm
            existing={myHospital ?? undefined}
            onSuccess={() => setEditMode(false)}
          />
        </div>
      ) : null}

      {/* Hospital dashboard */}
      {myHospital && !editMode && (
        <div className="space-y-6">
          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl text-foreground">
                  {myHospital.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {myHospital.address.street}, {myHospital.address.city},{" "}
                  {myHospital.address.state} {myHospital.address.zip},{" "}
                  {myHospital.address.country}
                </p>
                {myHospital.phone && (
                  <p className="text-sm text-muted-foreground">
                    📞 {myHospital.phone}
                  </p>
                )}
                {myHospital.email && (
                  <p className="text-sm text-muted-foreground">
                    ✉️ {myHospital.email}
                  </p>
                )}
                {myHospital.description && (
                  <p className="text-sm text-foreground mt-3 leading-relaxed">
                    {myHospital.description}
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
                Lat: {myHospital.latitude.toFixed(4)}, Lng:{" "}
                {myHospital.longitude.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Inventory & Treatments tabs */}
          {loadingDetails ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : hospitalDetails ? (
            <Tabs defaultValue="inventory" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger
                  value="inventory"
                  className="flex-1 gap-2"
                  data-ocid="portal.inventory.tab"
                >
                  <Package className="w-4 h-4" />
                  Inventory ({hospitalDetails.inventory.length})
                </TabsTrigger>
                <TabsTrigger
                  value="treatments"
                  className="flex-1 gap-2"
                  data-ocid="portal.treatments.tab"
                >
                  <Stethoscope className="w-4 h-4" />
                  Treatments ({hospitalDetails.treatments.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="inventory">
                <div className="bg-white rounded-2xl border border-border p-6 shadow-xs">
                  <InventoryManager
                    hospitalId={myHospital.id}
                    items={hospitalDetails.inventory}
                  />
                </div>
              </TabsContent>
              <TabsContent value="treatments">
                <div className="bg-white rounded-2xl border border-border p-6 shadow-xs">
                  <TreatmentManager
                    hospitalId={myHospital.id}
                    treatments={hospitalDetails.treatments}
                  />
                </div>
              </TabsContent>
            </Tabs>
          ) : null}
        </div>
      )}
    </div>
  );
}
