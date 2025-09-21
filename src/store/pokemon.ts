import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Pokemon } from "../interfaces/pokemon";
const BASE_URL = import.meta.env.VITE_LOCAL_BACKEND_URL;

export type Paged<T> = { items: T[]; total: number };

export const pokemonApi = createApi({
  reducerPath: "pokemonApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["MyPokemons", "PokemonDetails"],
  endpoints: (build) => ({
    getMyPokemons: build.query<Paged<Pokemon>, {
      page: number;
      pageSize: number;
      search?: string;
      sortBy: string;
      sortDir: "asc" | "desc";
    }>({
      query: (q) => ({
        url: "/pokemon",
        params: q,
      }),
      providesTags: (res) =>
        res?.items
          ? [
            { type: "MyPokemons" as const, id: "LIST" },
            ...res.items.map((p) => ({ type: "MyPokemons" as const, id: p.id })),
          ]
          : [{ type: "MyPokemons" as const, id: "LIST" }],
      keepUnusedDataFor: 60,
      transformResponse: (res: any): Paged<Pokemon> => {
        return {
          items: res.map((p:any) => ({
            id: p.pokemon.id,
            name: p.pokemon.name,
            sprite_front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.pokemon.id}.png`
          })),
          total: res.length,
        };
      },
    }),

    catchPokemon: build.mutation({
      query: ({ id, pokemon }) => ({ url: `/pokemon/${id}`, method: "PUT", body: pokemon }),
      invalidatesTags: (_res, _err, id) => [
        { type: "MyPokemons", id: "LIST" },
        { type: "MyPokemons", id },
      ],
    }),

    releasePokemon: build.mutation<{ released: true; pokemonId: number }, number>({
      query: (id) => ({ url: `/pokemon/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "MyPokemons", id: "LIST" },
        { type: "MyPokemons", id },
      ],
    }),

    getPokemonDetails: build.query({
      query: ({ id }) => ({ url: `/pokemon/${id}` }),
      providesTags: (_res, _err, id) => [{ type: "PokemonDetails", id }],
      keepUnusedDataFor: 120,
    }),
  }),
});

export const {
  useGetMyPokemonsQuery,
  useCatchPokemonMutation,
  useReleasePokemonMutation,
  useGetPokemonDetailsQuery,
} = pokemonApi;
