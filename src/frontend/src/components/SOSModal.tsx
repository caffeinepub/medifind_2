import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  MapPin,
  Phone,
  Send,
  X,
} from "lucide-react";
import { useState } from "react";
import type { Hospital } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface SOSModalProps {
  open: boolean;
  onClose: () => void;
}

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function SOSModal({ open, onClose }: SOSModalProps) {
  const { actor } = useActor();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [sendStatus, setSendStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [nearestHospital, setNearestHospital] = useState<{
    name: string;
    phone: string;
    distance: number;
  } | null>(null);

  const getLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      () => {
        setLocationError(
          "Location access denied. Please share your address manually.",
        );
        setLocationLoading(false);
      },
    );
  };

  const sendHelp = async () => {
    setSendStatus("sending");
    try {
      const hospitals: Hospital[] = actor ? await actor.getAllHospitals() : [];
      let nearest: Hospital | null = null;
      let minDist = Number.POSITIVE_INFINITY;

      for (const h of hospitals) {
        const dist = location
          ? calcDistance(location.lat, location.lng, h.latitude, h.longitude)
          : 0;
        if (dist < minDist) {
          minDist = dist;
          nearest = h;
        }
      }

      if (nearest) {
        setNearestHospital({
          name: nearest.name,
          phone: nearest.phone,
          distance: Math.round(minDist * 10) / 10,
        });
      }

      setSendStatus("sent");
    } catch {
      setSendStatus("error");
    }
  };

  const handleClose = () => {
    setReason("");
    setSendStatus("idle");
    setNearestHospital(null);
    setLocation(null);
    setLocationError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        data-ocid="sos.dialog"
        className="max-w-md border-0 p-0 overflow-hidden"
      >
        {/* Red header bar */}
        <div className="bg-red-600 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white text-xl font-bold">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20">
                <AlertTriangle className="w-5 h-5 text-white" />
              </span>
              Emergency Help
            </DialogTitle>
          </DialogHeader>
          <p className="text-red-100 text-sm mt-1 ml-13">
            Stay calm. Help is available.
          </p>
        </div>

        <div className="px-6 py-5 space-y-5 bg-background">
          {sendStatus === "sent" ? (
            // Success state
            <div data-ocid="sos.success_state" className="space-y-4">
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <div>
                  <p className="font-bold text-foreground text-lg">
                    Alert Sent!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The nearest hospital has been identified.
                  </p>
                </div>
              </div>
              {nearestHospital && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-semibold text-green-800">
                    🏥 {nearestHospital.name}
                  </p>
                  {location && (
                    <p className="text-xs text-green-700">
                      {nearestHospital.distance} km from your location
                    </p>
                  )}
                  {nearestHospital.phone && (
                    <a
                      href={`tel:${nearestHospital.phone}`}
                      data-ocid="sos.call_button"
                      className="block"
                    >
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl mt-2">
                        <Phone className="w-4 h-4 mr-2" />
                        Call {nearestHospital.name}
                      </Button>
                    </a>
                  )}
                </div>
              )}
              {reason && (
                <div className="bg-muted rounded-lg px-4 py-3">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                    Emergency reason
                  </p>
                  <p className="text-sm text-foreground">{reason}</p>
                </div>
              )}
              <Button
                data-ocid="sos.close_button"
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={handleClose}
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
          ) : (
            <>
              {/* Call 911 */}
              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                  <Phone className="w-4 h-4 text-red-500" />
                  Call Emergency Services
                </h3>
                <a href="tel:911" data-ocid="sos.call_button">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg h-14 rounded-xl shadow-md">
                    <Phone className="w-5 h-5 mr-2" />
                    Call 911
                  </Button>
                </a>
                <p className="text-xs text-muted-foreground text-center">
                  or your local emergency number
                </p>
              </section>

              <div className="border-t border-border" />

              {/* Emergency reason */}
              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Describe the Emergency
                </h3>
                <Textarea
                  data-ocid="sos.textarea"
                  placeholder="e.g. Chest pain, difficulty breathing, road accident, severe bleeding..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="resize-none min-h-[90px] text-sm border-red-200 focus-visible:ring-red-400"
                />
              </section>

              <div className="border-t border-border" />

              {/* Share Location */}
              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  Your Location (optional)
                </h3>
                {location ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-xs font-mono text-green-800">
                      {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Location captured. Used to find the nearest hospital.
                    </p>
                  </div>
                ) : (
                  <>
                    <Button
                      data-ocid="sos.location_button"
                      variant="outline"
                      className="w-full border-red-200 text-red-700 hover:bg-red-50 font-semibold"
                      onClick={getLocation}
                      disabled={locationLoading}
                    >
                      {locationLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Getting location...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Get My GPS Location
                        </span>
                      )}
                    </Button>
                    {locationError && (
                      <p
                        data-ocid="sos.error_state"
                        className="text-xs text-red-600 mt-1"
                      >
                        {locationError}
                      </p>
                    )}
                  </>
                )}
              </section>

              <div className="border-t border-border" />

              {/* Send Help */}
              <Button
                data-ocid="sos.primary_button"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-base h-14 rounded-xl shadow-lg"
                onClick={sendHelp}
                disabled={sendStatus === "sending"}
              >
                {sendStatus === "sending" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Finding nearest hospital...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Send Immediate Help
                  </span>
                )}
              </Button>

              {sendStatus === "error" && (
                <p
                  data-ocid="sos.error_state"
                  className="text-xs text-red-600 text-center"
                >
                  Could not find hospitals. Please call 911 directly.
                </p>
              )}

              <Button
                data-ocid="sos.close_button"
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={handleClose}
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
