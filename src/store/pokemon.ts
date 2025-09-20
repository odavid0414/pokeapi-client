import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const BASE_URL = import.meta.env.VITE_LOCAL_BACKEND_URL;

export type SortDir = "asc" | "desc";
export type SortBy = "name" | "caughtAt";

export type MyCaughtPokemon = {
  id: number;
  name: string;
  sprite_front_default?: string | null;
  caughtAt: string; // ISO
  height_dm?: number | null;
  weight_hg?: number | null;
};

export type Paged<T> = { items: T[]; total: number };

export const pokemonApi = createApi({
  reducerPath: "pokemonApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include", // keep if you ever add cookies; harmless otherwise
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["MyPokemons", "PokemonDetails"],
  endpoints: (build) => ({
    getMyPokemons: build.query<Paged<MyCaughtPokemon>, {
      page: number;
      pageSize: number;
      search?: string;
      sortBy: SortBy;
      sortDir: SortDir;
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
    }),

    catchPokemon: build.mutation<{ caught: true; pokemonId: number }, number>({
      query: (id) => ({ url: `/pokemon/${id}`, method: "PUT" }),
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

    getPokemonDetails: build.query<
      { id: number; name: string; height_dm: number; weight_hg: number; sprite_front_default?: string | null; abilities: { ability: string; is_hidden: boolean }[]; types: string[] },
      number
    >({
      query: (id) => ({ url: `/pokemons/${id}` }),
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
