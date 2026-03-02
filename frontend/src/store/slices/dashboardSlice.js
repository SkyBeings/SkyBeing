import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchDashboard = createAsyncThunk(
    'dashboard/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/admin/dashboard');
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to load dashboard');
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState: {
        data: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearDashboard: (state) => {
            state.data = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
