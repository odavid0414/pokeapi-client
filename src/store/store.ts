import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./auth";
import { useDispatch } from "react-redux";
import { pokeApi } from "./globalPokemon";
import { pokemonApi } from "./pokemon";

const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [pokeApi.reducerPath]: pokeApi.reducer,
    [pokemonApi.reducerPath]: pokemonApi.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(authApi.middleware)
    .concat(pokeApi.middleware)
    .concat(pokemonApi.middleware),
});

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export default store;