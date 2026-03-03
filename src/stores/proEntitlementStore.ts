import { create } from "zustand";
import {
  activateProEntitlement,
  clearProEntitlement,
  getProEntitlement,
  refreshProEntitlement,
  type ProEntitlement,
} from "@/utils/proEntitlement";

interface ProEntitlementStore {
  entitlement: ProEntitlement | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  activate: (checkoutId: string, email: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  clear: () => Promise<void>;
}

export const useProEntitlementStore = create<ProEntitlementStore>(
  (set, get) => ({
    entitlement: null,
    isLoading: true,
    isSubmitting: false,
    error: null,

    initialize: async () => {
      if (!get().isLoading) {
        return;
      }
      try {
        let entitlement = await getProEntitlement();
        if (entitlement.checkout_id && entitlement.email) {
          try {
            entitlement = await refreshProEntitlement();
          } catch (_error) {
            // Keep last known state if background verification fails.
          }
        }
        set({ entitlement, error: null });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : String(error) });
      } finally {
        set({ isLoading: false });
      }
    },

    activate: async (checkoutId: string, email: string) => {
      set({ isSubmitting: true, error: null });
      try {
        const entitlement = await activateProEntitlement(checkoutId, email);
        set({ entitlement });
        return true;
      } catch (error) {
        set({ error: error instanceof Error ? error.message : String(error) });
        return false;
      } finally {
        set({ isSubmitting: false });
      }
    },

    refresh: async () => {
      set({ isSubmitting: true, error: null });
      try {
        const entitlement = await refreshProEntitlement();
        set({ entitlement });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : String(error) });
      } finally {
        set({ isSubmitting: false });
      }
    },

    clear: async () => {
      set({ isSubmitting: true, error: null });
      try {
        const entitlement = await clearProEntitlement();
        set({ entitlement });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : String(error) });
      } finally {
        set({ isSubmitting: false });
      }
    },
  }),
);
