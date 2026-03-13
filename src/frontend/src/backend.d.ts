import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface InventoryItem {
    id: bigint;
    name: string;
    unit: string;
    available: boolean;
    hospitalId: bigint;
    quantity: bigint;
    category: string;
}
export interface SearchResult {
    hospital: Hospital;
    matchingTreatments: Array<Treatment>;
    matchingItems: Array<InventoryItem>;
}
export interface Treatment {
    id: bigint;
    description: string;
    conditionName: string;
    hospitalId: bigint;
    treatmentName: string;
}
export interface Hospital {
    id: bigint;
    latitude: number;
    owner: Principal;
    name: string;
    description: string;
    email: string;
    longitude: number;
    address: Address;
    phone: string;
}
export interface UserProfile {
    name: string;
}
export interface Address {
    zip: string;
    street: string;
    country: string;
    city: string;
    state: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addInventoryItem(hospitalId: bigint, name: string, category: string, available: boolean, quantity: bigint, unit: string): Promise<bigint>;
    addTreatment(hospitalId: bigint, conditionName: string, treatmentName: string, description: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createHospital(name: string, address: Address, latitude: number, longitude: number, phone: string, email: string, description: string): Promise<bigint>;
    getAllHospitals(): Promise<Array<Hospital>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHospitalDetails(hospitalId: bigint): Promise<{
        hospital: Hospital;
        inventory: Array<InventoryItem>;
        treatments: Array<Treatment>;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeInventoryItem(itemId: bigint): Promise<void>;
    removeTreatment(treatmentId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchHospitals(keyword: string): Promise<Array<SearchResult>>;
    updateHospital(hospitalId: bigint, name: string, address: Address, latitude: number, longitude: number, phone: string, email: string, description: string): Promise<void>;
    updateInventoryItem(itemId: bigint, name: string, category: string, available: boolean, quantity: bigint, unit: string): Promise<void>;
    updateTreatment(treatmentId: bigint, conditionName: string, treatmentName: string, description: string): Promise<void>;
}
