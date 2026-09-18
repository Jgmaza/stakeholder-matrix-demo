/**
 * Redux Slice: Filters
 * Manages filter state for actors
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ActorCategory } from "@/domain/entities/Actor";

interface FiltersState {
  searchQuery: string;
  selectedOrganization: string | null;
  selectedCategory: ActorCategory | null;
  selectedDistrito: string | null;
  selectedDepartamento: string | null;
  selectedMunicipio: string | null;
}

const initialState: FiltersState = {
  searchQuery: "",
  selectedOrganization: null,
  selectedCategory: null,
  selectedDistrito: null,
  selectedDepartamento: null,
  selectedMunicipio: null,
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedOrganization: (state, action: PayloadAction<string | null>) => {
      state.selectedOrganization = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<ActorCategory | null>) => {
      state.selectedCategory = action.payload;
    },
    setSelectedDistrito: (state, action: PayloadAction<string | null>) => {
      state.selectedDistrito = action.payload;
    },
    setSelectedDepartamento: (state, action: PayloadAction<string | null>) => {
      state.selectedDepartamento = action.payload;
    },
    setSelectedMunicipio: (state, action: PayloadAction<string | null>) => {
      state.selectedMunicipio = action.payload;
    },
    clearFilters: (state) => {
      state.searchQuery = "";
      state.selectedOrganization = null;
      state.selectedCategory = null;
      state.selectedDistrito = null;
      state.selectedDepartamento = null;
      state.selectedMunicipio = null;
    },
  },
});

export const {
  setSearchQuery,
  setSelectedOrganization,
  setSelectedCategory,
  setSelectedDistrito,
  setSelectedDepartamento,
  setSelectedMunicipio,
  clearFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
