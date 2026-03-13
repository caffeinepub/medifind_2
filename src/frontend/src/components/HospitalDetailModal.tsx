import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ExternalLink,
  Mail,
  MapPin,
  Navigation,
  Package,
  Phone,
  Stethoscope,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Hospital } from "../backend.d";
import { useGetHospitalDetails } from "../hooks/useQueries";

declare const L: any;

interface RouteStep {
  instruction: string;
  distance: string;
}

interface HospitalDetailModalProps {
  hospital: Hospital;
  userLocation: { lat: number; lng: number } | null;
  onClose: () => void;
}

export default function HospitalDetailModal({
  hospital,
  userLocation,
  onClose,
}: HospitalDetailModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);
  const [routeLoading, setRouteLoading] = useState(false);

  const { data: details, isLoading } = useGetHospitalDetails(hospital.id);

  useEffect(() => {
    if (!mapRef.current || typeof L === "undefined") return;
    if (mapInstance.current) return;

    const map = L.map(mapRef.current, { zoomControl: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    mapInstance.current = map;

    const hospitalIcon = L.divIcon({
      html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#0d6e6e;border:3px solid white;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      className: "",
    });
    const hospitalMarker = L.marker([hospital.latitude, hospital.longitude], {
      icon: hospitalIcon,
    }).addTo(map);
    hospitalMarker.bindPopup(
      `<b>${hospital.name}</b><br/>${hospital.address.street}, ${hospital.address.city}`,
    );

    if (userLocation) {
      const userIcon = L.divIcon({
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#0ea5e9;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: "",
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("Your location");
      map.fitBounds(
        [
          [userLocation.lat, userLocation.lng],
          [hospital.latitude, hospital.longitude],
        ],
        { padding: [40, 40] },
      );

      setRouteLoading(true);
      fetch(
        `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${hospital.longitude},${hospital.latitude}?overview=full&geometries=geojson&steps=true`,
      )
        .then((r) => r.json())
        .then((data) => {
          if (data.routes?.[0]) {
            const coords: [number, number][] =
              data.routes[0].geometry.coordinates.map(
                (c: [number, number]) => [c[1], c[0]] as [number, number],
              );
            L.polyline(coords, {
              color: "#0d6e6e",
              weight: 5,
              opacity: 0.8,
            }).addTo(map);
            const steps: RouteStep[] = [];
            for (const leg of data.routes[0].legs) {
              for (const step of leg.steps) {
                if (step.maneuver?.instruction || step.name) {
                  steps.push({
                    instruction:
                      step.maneuver?.instruction || `Continue on ${step.name}`,
                    distance:
                      step.distance >= 1000
                        ? `${(step.distance / 1000).toFixed(1)} km`
                        : `${Math.round(step.distance)} m`,
                  });
                }
              }
            }
            setRouteSteps(steps.slice(0, 10));
          }
        })
        .catch(() => {})
        .finally(() => setRouteLoading(false));
    } else {
      map.setView([hospital.latitude, hospital.longitude], 14);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [hospital, userLocation]);

  const googleMapsUrl = userLocation
    ? `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${hospital.latitude},${hospital.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-display text-xl text-foreground">
              {hospital.name}
            </h2>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              {hospital.address.street}, {hospital.address.city},{" "}
              {hospital.address.state}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
            data-ocid="hospital.close_button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div
              ref={mapRef}
              className="w-full h-72 rounded-xl overflow-hidden border border-border"
              style={{ zIndex: 1 }}
            />
            <div className="flex gap-3 mt-3">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  variant="outline"
                  className="w-full gap-2 border-teal-200 text-teal-700 hover:bg-teal-50"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Google Maps
                </Button>
              </a>
            </div>
          </div>

          {userLocation && (
            <div>
              <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-teal-700" />
                Directions
              </h3>
              {routeLoading && (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              )}
              {!routeLoading && routeSteps.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Directions unavailable. Use Google Maps for navigation.
                </p>
              )}
              {!routeLoading && routeSteps.length > 0 && (
                <ol className="space-y-2">
                  {routeSteps.map((step, i) => (
                    <li
                      key={`${step.instruction.slice(0, 20)}-${step.distance}`}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span className="shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <span>{step.instruction}</span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          ({step.distance})
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {hospital.phone && (
              <a
                href={`tel:${hospital.phone}`}
                className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors"
              >
                <Phone className="w-5 h-5 text-teal-700" />
                <span className="text-sm font-medium text-teal-800">
                  {hospital.phone}
                </span>
              </a>
            )}
            {hospital.email && (
              <a
                href={`mailto:${hospital.email}`}
                className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors"
              >
                <Mail className="w-5 h-5 text-teal-700" />
                <span className="text-sm font-medium text-teal-800 truncate">
                  {hospital.email}
                </span>
              </a>
            )}
          </div>

          {hospital.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {hospital.description}
            </p>
          )}

          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          {details && (
            <>
              {details.inventory.length > 0 && (
                <div>
                  <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-teal-700" />
                    Available Inventory
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {details.inventory.map((item) => (
                      <div
                        key={item.id.toString()}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="text-sm font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.category}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={`text-xs ${item.available ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                          >
                            {item.available ? "Available" : "Unavailable"}
                          </Badge>
                          {item.available && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {item.quantity.toString()} {item.unit}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {details.treatments.length > 0 && (
                <div>
                  <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-teal-700" />
                    Treatment Methods
                  </h3>
                  <div className="space-y-3">
                    {details.treatments.map((t) => (
                      <div
                        key={t.id.toString()}
                        className="p-4 bg-teal-50 rounded-xl border border-teal-100"
                      >
                        <div className="text-sm font-semibold text-teal-800">
                          {t.treatmentName}
                        </div>
                        <div className="text-xs text-teal-600 mb-1.5">
                          For: {t.conditionName}
                        </div>
                        {t.description && (
                          <p className="text-sm text-teal-700/80">
                            {t.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
