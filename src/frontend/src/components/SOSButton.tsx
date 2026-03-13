import { useState } from "react";
import SOSModal from "./SOSModal";

export default function SOSButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        data-ocid="sos.open_modal_button"
        onClick={() => setOpen(true)}
        aria-label="Emergency SOS"
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-red-600 text-white font-bold text-sm shadow-2xl flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-red-400 opacity-75 animate-ping" />
        <span className="relative z-10 font-black tracking-wider">SOS</span>
      </button>
      <SOSModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
