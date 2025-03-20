import { createWithEqualityFn as create } from "zustand/traditional";

type LayoutState = {
  isGraphListVisibile: boolean;
  setIsGraphListVisible(isGraphListVisibile: boolean): void;
};

export const useLayoutStore = create<LayoutState>()((set) => ({
  isGraphListVisibile: true,
  setIsGraphListVisible(isGraphListVisibile) {
    set({ isGraphListVisibile });
  },
}));
