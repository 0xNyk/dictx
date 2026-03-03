import { useEffect } from "react";
import { useProEntitlementStore } from "@/stores/proEntitlementStore";

export const useProEntitlement = () => {
  const initialize = useProEntitlementStore((state) => state.initialize);
  const store = useProEntitlementStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return store;
};
