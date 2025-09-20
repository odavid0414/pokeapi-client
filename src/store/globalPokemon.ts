import { createApi as createPublicApi, fetchBaseQuery as publicBase } from "@reduxjs/toolkit/query/react";


export type PokeTypeList = { results: { name: string; url: string }[] };
export type PokeByType = { pokemon: { pokemon: { name: string; url: string } }[] };


export const pokeApi = createPublicApi({
    reducerPath: "pokeApi",
    baseQuery: publicBase({ baseUrl: import.meta.env.VITE_POKEAPI_URL }),
    endpoints: (build) => ({
        getTypes: build.query<PokeTypeList, void>({ query: () => "/type" }),
        getByType: build.query<PokeByType, string>({ query: (type) => `/type/${type}` }),
        getPokemon: build.query<any, number | string>({ query: (idOrName) => `/pokemon/${idOrName}` }),
    }),
});


export const { useGetTypesQuery, useGetByTypeQuery, useGetPokemonQuery } = pokeApi;