import { Button } from "@/components/ui/button";
import { Hospital, Search } from "lucide-react";
import type { Page } from "../App";

interface NavbarProps {
  currentPage: Page;
  navigate: (page: Page) => void;
}

export default function Navbar({ currentPage, navigate }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border shadow-xs">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="flex items-center gap-2.5 group"
          aria-label="MediFind and Care home"
        >
          <img
            src="/assets/generated/medifind-logo-transparent.dim_512x512.png"
            alt="MediFind and Care logo"
            className="w-9 h-9 rounded-xl object-contain"
          />
          <span className="font-display text-xl text-teal-700 tracking-tight">
            MediFind{" "}
            <span className="text-teal-500 font-normal text-base">& Care</span>
          </span>
        </button>

        <nav className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("home")}
            className="gap-2 text-sm"
            data-ocid="nav.search_link"
          >
            <Search className="w-4 h-4" />
            Find Care
          </Button>
          <Button
            variant={currentPage === "portal" ? "default" : "outline"}
            size="sm"
            onClick={() => navigate("portal")}
            className={`gap-2 text-sm ${
              currentPage === "portal"
                ? "bg-teal-700 hover:bg-teal-800 text-white border-transparent"
                : "border-teal-700 text-teal-700 hover:bg-teal-50"
            }`}
            data-ocid="nav.portal_link"
          >
            <Hospital className="w-4 h-4" />
            Hospital Portal
          </Button>
        </nav>
      </div>
    </header>
  );
}
