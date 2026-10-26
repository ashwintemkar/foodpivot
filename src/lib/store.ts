"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ConciergeResult } from "./concierge";
import { dishes, payableTotal } from "./data";
import {
  defaultFilters,
  defaultPreferences,
  formatOrderStamp,
  nextOrderId,
  seedOrders,
  type CartLine,
  type ChatMessage,
  type PlacedOrder,
  type SessionFilters,
  type UserPreferences,
} from "./memory";

type DemoState = {
  cart: CartLine[];
  favorites: string[];
  prompt: string;
  coupon: boolean;
  orderPlaced: boolean;
  lastPlacedOrderId: string | null;
  preferences: UserPreferences;
  orders: PlacedOrder[];
  filters: SessionFilters;
  messages: ChatMessage[];
  lastResult: ConciergeResult | null;
  add: (dishId: string) => void;
  remove: (dishId: string) => void;
  setQuantity: (dishId: string, quantity: number) => void;
  toggleFavorite: (dishId: string) => void;
  setPrompt: (prompt: string) => void;
  applyCoupon: () => void;
  clearCart: () => void;
  replaceCart: (lines: CartLine[]) => void;
  setFilters: (patch: Partial<SessionFilters>) => void;
  setPreferences: (patch: Partial<UserPreferences>) => void;
  pushMessages: (messages: ChatMessage[]) => void;
  setLastResult: (result: ConciergeResult | null) => void;
  placeOrder: (prompt?: string) => PlacedOrder | null;
  hydrateFromServer: (input: { preferences?: UserPreferences; orders?: PlacedOrder[] }) => void;
  resetMemory: () => void;
};

const initialMessages = (): ChatMessage[] => [
  {
    id: "greet",
    role: "assistant",
    text: "Hey Kiran. Dinner usual spend is about ₹315. Last biryani was Dum Chicken Biryani from Monsoon Table. What are you in the mood for?",
  },
];

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      cart: [],
      favorites: ["dish-2", "dish-7"],
      prompt: "",
      coupon: false,
      orderPlaced: false,
      lastPlacedOrderId: null,
      preferences: defaultPreferences,
      orders: seedOrders,
      filters: defaultFilters(),
      messages: initialMessages(),
      lastResult: null,
      add: (dishId) =>
        set((state) => {
          const found = state.cart.find((line) => line.dishId === dishId);
          return {
            cart: found
              ? state.cart.map((line) => (line.dishId === dishId ? { ...line, quantity: line.quantity + 1 } : line))
              : [...state.cart, { dishId, quantity: 1 }],
          };
        }),
      remove: (dishId) => set((state) => ({ cart: state.cart.filter((line) => line.dishId !== dishId) })),
      setQuantity: (dishId, quantity) =>
        set((state) => ({
          cart:
            quantity < 1
              ? state.cart.filter((line) => line.dishId !== dishId)
              : state.cart.map((line) => (line.dishId === dishId ? { ...line, quantity } : line)),
        })),
      toggleFavorite: (dishId) =>
        set((state) => ({
          favorites: state.favorites.includes(dishId)
            ? state.favorites.filter((id) => id !== dishId)
            : [...state.favorites, dishId],
        })),
      setPrompt: (prompt) => set({ prompt }),
      applyCoupon: () => set({ coupon: true }),
      clearCart: () => set({ cart: [] }),
      replaceCart: (lines) => set({ cart: lines, orderPlaced: false }),
      setFilters: (patch) => set((state) => ({ filters: { ...state.filters, ...patch } })),
      setPreferences: (patch) =>
        set((state) => {
          const preferences = { ...state.preferences, ...patch };
          return {
            preferences,
            filters: {
              ...state.filters,
              budgetPaise: patch.comfortBudgetPaise ?? state.filters.budgetPaise,
              diet: patch.diet ?? state.filters.diet,
              people: patch.people ?? state.filters.people,
              delivery: patch.deliveryPriority ?? state.filters.delivery,
            },
          };
        }),
      pushMessages: (messages) =>
        set((state) => ({ messages: [...state.messages, ...messages].slice(-16) })),
      setLastResult: (result) => set({ lastResult: result }),
      placeOrder: (prompt) => {
        const { cart, coupon, orders } = get();
        if (!cart.length) return null;
        const lines = cart
          .map((line) => ({ ...line, dish: dishes.find((dish) => dish.id === line.dishId) }))
          .filter((line): line is CartLine & { dish: NonNullable<(typeof dishes)[number]> } => Boolean(line.dish));
        if (!lines.length) return null;
        const itemSubtotal = lines.reduce((sum, line) => sum + line.dish.price * line.quantity, 0);
        const first = lines[0].dish;
        const order: PlacedOrder = {
          id: nextOrderId(orders),
          restaurant: first.restaurant,
          restaurantId: first.restaurantId,
          dishIds: lines.flatMap((line) => Array.from({ length: line.quantity }, () => line.dishId)),
          items: lines.map((line) => (line.quantity > 1 ? `${line.quantity}× ${line.dish.name}` : line.dish.name)),
          itemSubtotal,
          total: payableTotal(itemSubtotal, coupon),
          status: "Preparing",
          date: formatOrderStamp(),
          createdAt: Date.now(),
          prompt,
        };
        set({
          orders: [order, ...orders],
          cart: [],
          coupon: false,
          orderPlaced: true,
          lastPlacedOrderId: order.id,
        });
        return order;
      },
      hydrateFromServer: (input) =>
        set((state) => ({
          preferences: input.preferences ?? state.preferences,
          orders: input.orders ?? state.orders,
          filters: input.preferences
            ? {
                ...state.filters,
                budgetPaise: input.preferences.comfortBudgetPaise,
                diet: input.preferences.diet,
                people: input.preferences.people,
                delivery: input.preferences.deliveryPriority,
              }
            : state.filters,
        })),
      resetMemory: () =>
        set({
          cart: [],
          favorites: ["dish-2", "dish-7"],
          prompt: "",
          coupon: false,
          orderPlaced: false,
          lastPlacedOrderId: null,
          preferences: defaultPreferences,
          orders: seedOrders,
          filters: defaultFilters(),
          messages: initialMessages(),
          lastResult: null,
        }),
    }),
    {
      name: "foodpilot-memory",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      migrate: (persisted) => persisted as DemoState,
      partialize: (state) => ({
        cart: state.cart,
        favorites: state.favorites,
        prompt: state.prompt,
        coupon: state.coupon,
        lastPlacedOrderId: state.lastPlacedOrderId,
        preferences: state.preferences,
        orders: state.orders,
        filters: state.filters,
        messages: state.messages,
        lastResult: state.lastResult,
      }),
    },
  ),
);
