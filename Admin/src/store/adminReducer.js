import { createSlice } from "@reduxjs/toolkit";

const adminSlice = createSlice({
    name : "admin",
    initialState : {},
    reducers : {
        setAdminDetails : (state , action) => {
            return action.payload || {};
        },
        clearAdminDetails : () => {
            return {};
        }
    }
})

export const { setAdminDetails, clearAdminDetails } = adminSlice.actions

export default adminSlice.reducer