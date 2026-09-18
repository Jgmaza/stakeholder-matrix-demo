/**
 * Presentation Store: Redux Toolkit Store
 * State management for UI concerns
 */

import { configureStore } from "@reduxjs/toolkit";
import filtersReducer from "./slices/filtersSlice";
import matrixReducer from "./slices/matrixSlice";

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
    matrix: matrixReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
