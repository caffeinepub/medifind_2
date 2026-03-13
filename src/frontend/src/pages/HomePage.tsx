import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Loader2,
  MapPin,
  Navigation,
  Pill,
  Search,
  Stethoscope,
} from "lucide-react";
import { useCallback, useState } from "react";
import type { SearchResult } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface HomePageProps {
  goToResults: (
    query: string,
    results: SearchResult[],
    location: { lat: number; lng: number } | null,
  ) => void;
}

const SAMPLE_SEARCHES = [
  "Paracetamol",
  "Dialysis",
  "ICU Bed",
  "MRI Scan",
  "Insulin",
  "Chemotherapy",
];

const FEATURES = [
  {
    id: "search",
    icon: <Search className="w-6 h-6" />,
    title: "Search What You Need",
    desc: "Enter a medicine name, condition, or treatment. Our system scans real-time hospital inventories.",
  },
  {
    id: "locate",
    icon: <MapPin className="w-6 h-6" />,
    title: "Find the Nearest Hospital",
    desc: "Results are automatically sorted by distance from your current location with live availability.",
  },
  {
    id: "navigate",
    icon: <Navigation className="w-6 h-6" />,
    title: "Get There Fast",
    desc: "View the exact route on a live map with step-by-step directions to the hospital.",
  },
];

export default function HomePage({ goToResults }: HomePageProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [locationError, setLocationError] = useState("");
  const { actor } = useActor();

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || !actor) return;
      setIsSearching(true);
      setLocationError("");

      const locationPromise = new Promise<{ lat: number; lng: number } | null>(
        (resolve) => {
          if (!navigator.geolocation) {
            resolve(null);
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (pos) =>
              resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => {
              setLocationError(
                "Location access denied. Results won't be sorted by distance.",
              );
              resolve(null);
            },
            { timeout: 5000 },
          );
        },
      );

      const [location, results] = await Promise.all([
        locationPromise,
        actor.searchHospitals(searchQuery).catch(() => [] as SearchResult[]),
      ]);

      setIsSearching(false);
      goToResults(searchQuery, results, location);
    },
    [actor, goToResults],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="flex flex-col">
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <img
          src="/assets/generated/medifind-hero.dim_1600x900.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/80 via-teal-800/70 to-teal-900/90" />

        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white/90 text-sm px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live hospital availability
          </div>

          <h1 className="font-display text-5xl md:text-7xl text-white leading-tight mb-6">
            Find Medical Care
            <br />
            <span className="text-teal-200">Near You, Fast</span>
          </h1>

          <p className="text-teal-100/80 text-lg md:text-xl mb-12 max-w-xl mx-auto">
            Search for medicines, treatments, or conditions. We&apos;ll show you
            the nearest hospitals with availability and the fastest route.
          </p>

          <form onSubmit={handleSubmit} className="relative">
            <div className="glass-card rounded-2xl p-2 shadow-teal-lg flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search medicine, treatment, or condition..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-12 h-14 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  data-ocid="search.search_input"
                />
              </div>
              <Button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="h-14 px-8 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-base font-semibold shrink-0"
                data-ocid="search.submit_button"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Navigation className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </form>

          {locationError && (
            <div className="flex items-center gap-2 text-amber-300 text-sm mt-4 justify-center">
              <AlertCircle className="w-4 h-4" />
              {locationError}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {SAMPLE_SEARCHES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setQuery(s);
                  performSearch(s);
                }}
                className="text-sm bg-white/10 hover:bg-white/20 text-white/80 px-4 py-1.5 rounded-full border border-white/15 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl text-center text-foreground mb-4">
            How MediFind Works
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-lg mx-auto">
            From search to bedside in three simple steps
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.id}
                className="text-center p-8 rounded-2xl bg-teal-50 hover:bg-teal-100/60 transition-colors"
              >
                <div className="w-14 h-14 rounded-xl medical-gradient flex items-center justify-center text-white mx-auto mb-5">
                  {f.icon}
                </div>
                <h3 className="font-display text-xl mb-3">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 medical-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <Stethoscope className="w-10 h-10 mx-auto mb-4 text-teal-200" />
          <h2 className="font-display text-3xl md:text-4xl mb-4">
            Are You a Hospital?
          </h2>
          <p className="text-teal-100/80 mb-8 max-w-md mx-auto">
            Register your facility, manage your inventory, and list available
            treatments so patients can find you.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-teal-800 hover:bg-teal-50 font-semibold"
            >
              <Pill className="w-4 h-4 mr-2" />
              Register Your Hospital
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
