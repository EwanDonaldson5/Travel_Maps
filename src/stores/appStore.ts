import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  isOnline: boolean
  isDbReady: boolean
  isPremium: boolean
  userEmail: string | null
  subscriptionId: string | null
  pendingSync: number
  setOnline: (online: boolean) => void
  setDbReady: (ready: boolean) => void
  setPremium: (premium: boolean) => void
  setUserEmail: (email: string | null) => void
  setSubscriptionId: (id: string | null) => void
  incrementPendingSync: () => void
  decrementPendingSync: () => void
  resetPendingSync: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isOnline: navigator.onLine,
      isDbReady: false,
      isPremium: false,
      userEmail: null,
      subscriptionId: null,
      pendingSync: 0,
      setOnline: (online) => set({ isOnline: online }),
      setDbReady: (ready) => set({ isDbReady: ready }),
      setPremium: (premium) => set({ isPremium: premium }),
      setUserEmail: (email) => set({ userEmail: email }),
      setSubscriptionId: (id) => set({ subscriptionId: id }),
      incrementPendingSync: () => set((state) => ({ pendingSync: state.pendingSync + 1 })),
      decrementPendingSync: () => set((state) => ({ pendingSync: Math.max(0, state.pendingSync - 1) })),
      resetPendingSync: () => set({ pendingSync: 0 }),
    }),
    {
      name: 'livingstone-app',
      partialize: (state) => ({
        isPremium: state.isPremium,
        userEmail: state.userEmail,
        subscriptionId: state.subscriptionId,
      }),
    }
  )
)
