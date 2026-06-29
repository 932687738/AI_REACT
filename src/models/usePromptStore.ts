import { create } from 'zustand';

interface PromptStoreState {
  marketplaceOpen: boolean;
  selectedCategory: string | null;
  searchKeyword: string;
  setMarketplaceOpen: (open: boolean) => void;
  setSelectedCategory: (category: string | null) => void;
  setSearchKeyword: (keyword: string) => void;
}

export const usePromptStore = create<PromptStoreState>()((set) => ({
  marketplaceOpen: false,
  selectedCategory: null,
  searchKeyword: '',
  setMarketplaceOpen: (open) => set({ marketplaceOpen: open }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
}));
