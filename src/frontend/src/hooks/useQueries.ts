import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Address } from "../backend.d";
import { useActor } from "./useActor";

export function useSearchHospitals(keyword: string, enabled = false) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["searchHospitals", keyword],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchHospitals(keyword);
    },
    enabled: !!actor && !isFetching && enabled && keyword.length > 0,
  });
}

export function useGetAllHospitals() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allHospitals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllHospitals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetHospitalDetails(hospitalId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["hospitalDetails", hospitalId?.toString()],
    queryFn: async () => {
      if (!actor || hospitalId === null) return null;
      return actor.getHospitalDetails(hospitalId);
    },
    enabled: !!actor && !isFetching && hospitalId !== null,
  });
}

export function useCallerUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerUserRole"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateHospital() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      address: Address;
      latitude: number;
      longitude: number;
      phone: string;
      email: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createHospital(
        data.name,
        data.address,
        data.latitude,
        data.longitude,
        data.phone,
        data.email,
        data.description,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allHospitals"] }),
  });
}

export function useUpdateHospital() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      hospitalId: bigint;
      name: string;
      address: Address;
      latitude: number;
      longitude: number;
      phone: string;
      email: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateHospital(
        data.hospitalId,
        data.name,
        data.address,
        data.latitude,
        data.longitude,
        data.phone,
        data.email,
        data.description,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allHospitals"] }),
  });
}

export function useAddInventoryItem(hospitalId: bigint) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      category: string;
      available: boolean;
      quantity: bigint;
      unit: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addInventoryItem(
        hospitalId,
        data.name,
        data.category,
        data.available,
        data.quantity,
        data.unit,
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["hospitalDetails", hospitalId.toString()],
      }),
  });
}

export function useUpdateInventoryItem(hospitalId: bigint) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      itemId: bigint;
      name: string;
      category: string;
      available: boolean;
      quantity: bigint;
      unit: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateInventoryItem(
        data.itemId,
        data.name,
        data.category,
        data.available,
        data.quantity,
        data.unit,
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["hospitalDetails", hospitalId.toString()],
      }),
  });
}

export function useRemoveInventoryItem(hospitalId: bigint) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeInventoryItem(itemId);
    },
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["hospitalDetails", hospitalId.toString()],
      }),
  });
}

export function useAddTreatment(hospitalId: bigint) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      conditionName: string;
      treatmentName: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addTreatment(
        hospitalId,
        data.conditionName,
        data.treatmentName,
        data.description,
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["hospitalDetails", hospitalId.toString()],
      }),
  });
}

export function useUpdateTreatment(hospitalId: bigint) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      treatmentId: bigint;
      conditionName: string;
      treatmentName: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateTreatment(
        data.treatmentId,
        data.conditionName,
        data.treatmentName,
        data.description,
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["hospitalDetails", hospitalId.toString()],
      }),
  });
}

export function useRemoveTreatment(hospitalId: bigint) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (treatmentId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeTreatment(treatmentId);
    },
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["hospitalDetails", hospitalId.toString()],
      }),
  });
}
