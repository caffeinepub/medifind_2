import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import type { SearchResult } from "./backend.d";
import Navbar from "./components/Navbar";
import SOSButton from "./components/SOSButton";
import HomePage from "./pages/HomePage";
import HospitalPortal from "./pages/HospitalPortal";
import SearchResults from "./pages/SearchResults";

export type Page = "home" | "results" | "portal";

export interface AppState {
  page: Page;
  searchQuery: string;
  searchResults: SearchResult[];
  userLocation: { lat: number; lng: number } | null;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    page: "home",
    searchQuery: "",
    searchResults: [],
    userLocation: null,
  });

  const navigate = (page: Page) => setAppState((s) => ({ ...s, page }));

  const goToResults = (
    query: string,
    results: SearchResult[],
    location: { lat: number; lng: number } | null,
  ) => {
    setAppState({
      page: "results",
      searchQuery: query,
      searchResults: results,
      userLocation: location,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar currentPage={appState.page} navigate={navigate} />
      <main className="flex-1">
        {appState.page === "home" && <HomePage goToResults={goToResults} />}
        {appState.page === "results" && (
          <SearchResults
            query={appState.searchQuery}
            results={appState.searchResults}
            userLocation={appState.userLocation}
            onNewSearch={goToResults}
            goHome={() => navigate("home")}
          />
        )}
        {appState.page === "portal" && <HospitalPortal />}
      </main>
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            className="underline hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
      <SOSButton />
      <Toaster />
    </div>
  );
}
