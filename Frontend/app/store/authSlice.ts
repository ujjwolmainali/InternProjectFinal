import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  email: string;
  profile?: string;
  fname?: string;
  lname?: string;
  bio?: string;
  address?: string;
  phone?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggedOut: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isLoggedOut: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.isLoading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    logout(state) {
      state.user = null;
      state.isLoading = false;
      state.isLoggedOut = true;
    },
  },
});

export const { setUser, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
