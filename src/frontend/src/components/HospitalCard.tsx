import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Package, Phone, Stethoscope } from "lucide-react";
import type { SearchResult } from "../backend.d";

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface HospitalCardProps {
  result: SearchResult;
  userLocation: { lat: number; lng: number } | null;
  index: number;
  onViewDetails: () => void;
}

export default function HospitalCard({
  result,
  userLocation,
  index,
  onViewDetails,
}: HospitalCardProps) {
  const { hospital, matchingItems, matchingTreatments } = result;
  const distance = userLocation
    ? haversineDistance(
        userLocation.lat,
        userLocation.lng,
        hospital.latitude,
        hospital.longitude,
      )
    : null;

  const ocidIndex = index <= 3 ? index : 3;

  return (
    <div
      className="bg-white rounded-2xl border border-border shadow-xs hover:shadow-teal transition-shadow p-6 flex flex-col gap-4"
      data-ocid={`results.item.${ocidIndex}`}
    >
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display text-lg text-foreground leading-tight">
            {hospital.name}
          </h3>
          {distance !== null && (
            <span className="shrink-0 text-xs font-semibold bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full">
              {distance < 1
                ? `${(distance * 1000).toFixed(0)}m`
                : `${distance.toFixed(1)} km`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">
            {hospital.address.street}, {hospital.address.city},{" "}
            {hospital.address.state}
          </span>
        </div>
        {hospital.phone && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
            <Phone className="w-3.5 h-3.5" />
            <span>{hospital.phone}</span>
          </div>
        )}
      </div>

      {/* Matching inventory */}
      {matchingItems.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 uppercase tracking-wide mb-2">
            <Package className="w-3.5 h-3.5" />
            Available Items
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchingItems.slice(0, 4).map((item) => (
              <Badge
                key={item.id.toString()}
                variant="secondary"
                className={`text-xs ${
                  item.available
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-gray-50 text-gray-500 border-gray-200"
                }`}
              >
                {item.name}
                {item.available ? "" : " (unavail.)"}
              </Badge>
            ))}
            {matchingItems.length > 4 && (
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground"
              >
                +{matchingItems.length - 4} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Matching treatments */}
      {matchingTreatments.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 uppercase tracking-wide mb-2">
            <Stethoscope className="w-3.5 h-3.5" />
            Treatments
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchingTreatments.slice(0, 3).map((t) => (
              <Badge
                key={t.id.toString()}
                variant="outline"
                className="text-xs border-teal-200 text-teal-700"
              >
                {t.treatmentName}
              </Badge>
            ))}
            {matchingTreatments.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground"
              >
                +{matchingTreatments.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="mt-auto pt-2">
        <Button
          onClick={onViewDetails}
          className="w-full bg-teal-700 hover:bg-teal-800 text-white gap-2"
          data-ocid={`hospital.directions_button.${ocidIndex}`}
        >
          <Navigation className="w-4 h-4" />
          View & Get Directions
        </Button>
      </div>
    </div>
  );
}
