/**
 * Redux Slice: Matrix
 * Manages matrix configuration and UI state
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_MATRIX_CONFIG, MatrixConfig } from "@/domain/value-objects/MatrixMapping";

interface MatrixState {
  config: MatrixConfig;
  selectedActorId: string | null;
  isConfigDialogOpen: boolean;
}

const initialState: MatrixState = {
  config: DEFAULT_MATRIX_CONFIG,
  selectedActorId: null,
  isConfigDialogOpen: false,
};

const matrixSlice = createSlice({
  name: "matrix",
  initialState,
  reducers: {
    updateMatrixConfig: (state, action: PayloadAction<Partial<MatrixConfig>>) => {
      state.config = { ...state.config, ...action.payload };
    },
    setSelectedActorId: (state, action: PayloadAction<string | null>) => {
      state.selectedActorId = action.payload;
    },
    toggleConfigDialog: (state) => {
      state.isConfigDialogOpen = !state.isConfigDialogOpen;
    },
    setConfigDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isConfigDialogOpen = action.payload;
    },
  },
});

export const {
  updateMatrixConfig,
  setSelectedActorId,
  toggleConfigDialog,
  setConfigDialogOpen,
} = matrixSlice.actions;

export default matrixSlice.reducer;
