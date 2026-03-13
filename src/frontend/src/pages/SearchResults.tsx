import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft, Loader2, Search } from "lucide-react";
import { useCallback, useState } from "react";
import type { Hospital, SearchResult } from "../backend.d";
import HospitalCard from "../components/HospitalCard";
import HospitalDetailModal from "../components/HospitalDetailModal";
import { useActor } from "../hooks/useActor";

interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  userLocation: { lat: number; lng: number } | null;
  onNewSearch: (
    query: string,
    results: SearchResult[],
    location: { lat: number; lng: number } | null,
  ) => void;
  goHome: () => void;
}

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

export default function SearchResults({
  query,
  results,
  userLocation,
  onNewSearch,
  goHome,
}: SearchResultsProps) {
  const [searchInput, setSearchInput] = useState(query);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(
    null,
  );
  const { actor } = useActor();

  const sortedResults = userLocation
    ? [...results].sort((a, b) => {
        const dA = haversineDistance(
          userLocation.lat,
          userLocation.lng,
          a.hospital.latitude,
          a.hospital.longitude,
        );
        const dB = haversineDistance(
          userLocation.lat,
          userLocation.lng,
          b.hospital.latitude,
          b.hospital.longitude,
        );
        return dA - dB;
      })
    : results;

  const performSearch = useCallback(
    async (q: string) => {
      if (!q.trim() || !actor) return;
      setIsSearching(true);
      const locationPromise = new Promise<{ lat: number; lng: number } | null>(
        (resolve) => {
          if (!navigator.geolocation) {
            resolve(null);
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (pos) =>
              resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve(userLocation),
            { timeout: 5000 },
          );
        },
      );
      const [location, res] = await Promise.all([
        locationPromise,
        actor.searchHospitals(q).catch(() => [] as SearchResult[]),
      ]);
      setIsSearching(false);
      onNewSearch(q, res, location);
    },
    [actor, onNewSearch, userLocation],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchInput);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border sticky top-16 z-30 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goHome}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search again..."
                  className="pl-9 h-10"
                  data-ocid="search.search_input"
                />
              </div>
              <Button
                type="submit"
                disabled={isSearching}
                className="bg-teal-700 hover:bg-teal-800 text-white h-10"
                data-ocid="search.submit_button"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="font-display text-2xl md:text-3xl text-foreground">
            Results for{" "}
            <span className="text-teal-700">&ldquo;{query}&rdquo;</span>
          </h2>
          {userLocation ? (
            <p className="text-sm text-muted-foreground mt-1">
              Sorted by distance from your current location &middot;{" "}
              {sortedResults.length} hospital
              {sortedResults.length !== 1 ? "s" : ""} found
            </p>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-600 text-sm mt-1">
              <AlertCircle className="w-4 h-4" />
              Location unavailable &mdash; results not sorted by distance
            </div>
          )}
        </div>

        {isSearching && (
          <div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            data-ocid="results.loading_state"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-border p-6 space-y-3"
              >
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            ))}
          </div>
        )}

        {!isSearching && sortedResults.length === 0 && (
          <div
            className="text-center py-20 text-muted-foreground"
            data-ocid="results.empty_state"
          >
            <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-teal-400" />
            </div>
            <h3 className="font-display text-xl text-foreground mb-2">
              No hospitals found
            </h3>
            <p className="text-sm">
              No nearby hospitals have &ldquo;{query}&rdquo; in their inventory
              or treatment list.
            </p>
            <p className="text-sm mt-1">
              Try a different search term or check back later.
            </p>
          </div>
        )}

        {!isSearching && sortedResults.length > 0 && (
          <div
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
            data-ocid="results.list"
          >
            {sortedResults.map((result, idx) => (
              <HospitalCard
                key={result.hospital.id.toString()}
                result={result}
                userLocation={userLocation}
                index={idx + 1}
                onViewDetails={() => setSelectedHospital(result.hospital)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedHospital && (
        <HospitalDetailModal
          hospital={selectedHospital}
          userLocation={userLocation}
          onClose={() => setSelectedHospital(null)}
        />
      )}
    </div>
  );
}
