import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./auth";
import { useDispatch } from "react-redux";

const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(authApi.middleware)

});

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export default store;