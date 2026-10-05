import { createSlice } from '@reduxjs/toolkit'
const userSlice =  createSlice({
    name : "user",
    initialState : {},
    reducers : {
        setUserDetails : (state , action) => {
            return action.payload
        },
        clearUserDetails : (state , action) => {
            return {}
        }
    }
})

export const {setUserDetails , clearUserDetails} = userSlice.actions
export default userSlice.reducer