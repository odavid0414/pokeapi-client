import { createApi as createPublicApi, fetchBaseQuery as publicBase } from "@reduxjs/toolkit/query/react";
import type { Pokemon } from "../interfaces/pokemon";


export type PokeTypeList = { results: { name: string; url: string }[] };
export type PokeByType = { pokemon: { pokemon: { name: string; url: string } }[] };


export const pokeApi = createPublicApi({
    reducerPath: "pokeApi",
    baseQuery: publicBase({ baseUrl: import.meta.env.VITE_POKEAPI_URL }),
    endpoints: (build) => ({
        getPokemons: build.query({
            query: ({ limit, offset }) =>
            ({
                url: "/pokemon",
                params: { limit, offset },
                method: "GET",
            }),
            transformResponse: (res: any): { count: number, items: Pokemon[] } => {
                return {
                    count: res.count,
                    items: res.results.map((p: any) => ({
                        id: extractIdFromUrl(p.url),
                        name: p.name,
                        sprite_front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${extractIdFromUrl(p.url)}.png`,
                    })),
                };
            }
        }),
        getTypes: build.query<PokeTypeList, void>({ query: () => "/type" }),
        getByType: build.query<PokeByType, string>({ query: (type) => `/type/${type}` }),
        getPokemon: build.query({
            query: ({ id }) => ({
                url: `/pokemon/${id}`,
                method: "GET",
            }),
            transformResponse: (res: any) => ({
                id: res.id,
                name: res.name,
                sprite_front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${res.id}.png`,
                height: res.height,
                weight: res.weight,
                abilities: res.abilities
                    .filter((a: any) => !a.is_hidden)          // csak nem hidden
                    .map((a: any) => a.ability.name),
            })
        }),
    }),
});


export const { useGetPokemonsQuery, useGetTypesQuery, useGetByTypeQuery, useGetPokemonQuery } = pokeApi;

function extractIdFromUrl(url: any) {
    const m = url.match(/\/(\d+)\/?$/);
    return m ? Number(m[1]) : null;
}
