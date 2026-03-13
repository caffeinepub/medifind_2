# MediFind

## Current State
The Hospital Portal finds only the first hospital owned by the logged-in principal (`allHospitals.find(...)`) and shows a single-hospital management UI. The backend already supports multiple hospitals per principal with no restriction.

## Requested Changes (Diff)

### Add
- A "My Hospitals" list view showing all hospitals owned by the current principal
- A "Register New Hospital" button that always appears so users can add additional hospitals
- Per-hospital selection: clicking a hospital from the list opens its management dashboard (inventory & treatments tabs)
- A back/breadcrumb control to return from a selected hospital to the hospitals list

### Modify
- `HospitalPortal.tsx`: Replace single-hospital logic (`myHospital = allHospitals.find(...)`) with a list of all hospitals owned by principal. Track `selectedHospitalId` state for drill-down. Show the list when none is selected, show the dashboard when one is selected.

### Remove
- The assumption that one account = one hospital

## Implementation Plan
1. In `HospitalPortal.tsx`, compute `myHospitals` (array) instead of `myHospital` (single).
2. Add `selectedHospitalId: bigint | null` state.
3. When `selectedHospitalId` is null, show the hospitals list with a "Register New Hospital" button and a card per hospital.
4. When `selectedHospitalId` is set, show the existing dashboard for that hospital with a back button.
5. The register form (no existing hospital) and edit form still work as before, scoped to the selected hospital.
