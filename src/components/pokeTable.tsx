// This file only contains the DataTable component. Backend API slices remain separate.

import { useEffect, useMemo, useState } from "react";
import { ActionIcon, Box, Group, Loader, Text, TextInput, Tooltip, Button, Chip, Select } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import { MdRefresh, MdSearch, MdDelete, MdOpenInNew } from "react-icons/md";
import { useNavigate } from "react-router-dom";

// --- Types ---
export type MyCaughtPokemon = {
  id: number;
  name: string;
  sprite_front_default?: string | null;
  caughtAt: string;
  height_dm?: number | null;
  weight_hg?: number | null;
};

// RTK Query hooks from store slices
import {
  useGetMyPokemonsQuery,
  useReleasePokemonMutation,
  useCatchPokemonMutation,
} from "../store/pokemon";
import { useGetTypesQuery, useGetByTypeQuery } from "../store/globalPokemon";

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso ?? "";
  }
}

function extractIdFromUrl(url: string): number | null {
  const m = url.match(/\/(\d+)\/?$/);
  return m ? Number(m[1]) : null;
}

export default function CaughtPokemonsTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [sort, setSort] = useState<DataTableSortStatus<MyCaughtPokemon>>({
    columnAccessor: "caughtAt",
    direction: "desc",
  });

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { data: typeList } = useGetTypesQuery();
  const { data: pokemonsByType } = useGetByTypeQuery(selectedType ?? "", {
    skip: !selectedType,
  });

  const {
    data = { items: [], total: 0 },
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetMyPokemonsQuery({
    page,
    pageSize,
    search: debouncedSearch || undefined,
    sortBy: sort.columnAccessor as "name" | "caughtAt",
    sortDir: sort.direction,
  });

  const [releasePokemon, releaseState] = useReleasePokemonMutation();
  const [catchPokemon, catchState] = useCatchPokemonMutation();
  const navigate = useNavigate();

  const items = useMemo(() => (data?.items ?? []) as MyCaughtPokemon[], [data]);
  const total = useMemo(() => data?.total ?? 0, [data]);
  const caughtIdSet = useMemo(() => new Set(items.map((p) => p.id)), [items]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, pageSize, sort.columnAccessor, sort.direction, selectedType]);

  async function handleRelease(p: MyCaughtPokemon) {
    try {
      await releasePokemon(p.id).unwrap();
      if (items.length === 1 && page > 1) setPage((prev) => prev - 1);
      else refetch();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCatch(id: number) {
    try {
      await catchPokemon(id).unwrap();
      refetch();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Box w={"100%"} p="md">
      <Group justify="space-between" align="center" mb="sm">
        <Group wrap="nowrap">
          <TextInput
            leftSection={<MdSearch size={16} />}
            placeholder="Search your caught pokemons by name..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            w={280}
          />
          <Select
            placeholder="Filter by type"
            data={(typeList?.results ?? []).map((t: any) => ({ value: t.name, label: t.name }))}
            value={selectedType}
            onChange={setSelectedType}
            clearable
            w={180}
          />
          <Tooltip label="Refresh">
            <ActionIcon variant="default" aria-label="Refresh" onClick={() => refetch()}>
              {isFetching ? <Loader size="xs" /> : <MdRefresh size={16} />}
            </ActionIcon>
          </Tooltip>
        </Group>
        <Chip checked readOnly color="green">
          Only my caught
        </Chip>
      </Group>

      {selectedType && pokemonsByType ? (
        <Box my="sm">
          <Text size="sm" c="dimmed">Pokemons of type {selectedType} (from public API):</Text>
          <Group gap="xs" wrap="wrap" mt={4}>
            {pokemonsByType.pokemon.map((wrap: any) => {
              const { name, url } = wrap.pokemon;
              const id = extractIdFromUrl(url) ?? 0;
              const isCaught = caughtIdSet.has(id);
              return (
                <Group key={name} gap="xs">
                  <Button size="compact-sm" variant="default" onClick={() => navigate(`/pokemon/${name}`)}>
                    View
                  </Button>
                  {isCaught ? (
                    <Button
                      size="compact-sm"
                      variant="outline"
                      color="green"
                      loading={releaseState.isLoading}
                      onClick={() => handleRelease({ id, name, caughtAt: "", sprite_front_default: null })}
                    >
                      Caught – Release
                    </Button>
                  ) : (
                    <Button
                      size="compact-sm"
                      variant="light"
                      loading={catchState.isLoading}
                      onClick={() => handleCatch(id)}
                    >
                      Catch {name}
                    </Button>
                  )}
                </Group>
              );
            })}
          </Group>
        </Box>
      ) : null}

      <DataTable
        withTableBorder
        withColumnBorders
        highlightOnHover
        fetching={isLoading || isFetching}
        records={items}
        totalRecords={total}
        page={page}
        onPageChange={setPage}
        recordsPerPage={pageSize}
        onRecordsPerPageChange={setPageSize}
        recordsPerPageOptions={[5, 10, 20, 50]}
        sortStatus={sort}
        onSortStatusChange={(s) => {
          setSort(s as DataTableSortStatus<MyCaughtPokemon>);
          setPage(1);
        }}
        noRecordsText={isError ? "Error loading data" : "You haven't caught any pokemons yet."}
        columns={[
          {
            accessor: "sprite_front_default",
            title: "",
            width: 64,
            render: (p) => (
              <img
                src={
                  p.sprite_front_default ||
                  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`
                }
                alt={p.name}
                width={48}
                height={48}
                style={{ imageRendering: "pixelated" }}
              />
            ),
          },
          { accessor: "name", title: "Name", sortable: true },
          {
            accessor: "caughtAt",
            title: "Caught",
            width: 190,
            sortable: true,
            render: (p) => <Text size="sm">{formatDate(p.caughtAt)}</Text>,
          },
          {
            accessor: "size",
            title: "Size",
            width: 160,
            render: (p) => {
              const h = p.height_dm != null ? (p.height_dm as number) / 10 : undefined;
              const w = p.weight_hg != null ? (p.weight_hg as number) / 10 : undefined;
              return (
                <Text size="sm" c="dimmed">
                  {h != null ? `${h.toFixed(1)} m` : "-"} • {w != null ? `${w.toFixed(1)} kg` : "-"}
                </Text>
              );
            },
          },
          {
            accessor: "actions",
            title: "",
            textAlign: "right",
            width: 160,
            render: (p) => (
              <Group justify="flex-end" gap="xs" wrap="nowrap">
                <Tooltip label="Open details">
                  <ActionIcon
                    variant="subtle"
                    size="lg"
                    aria-label="Details"
                    onClick={() => navigate(`/pokemon/${p.id}`)}
                  >
                    <MdOpenInNew />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Release">
                  <Button
                    variant="light"
                    color="red"
                    leftSection={<MdDelete />}
                    size="compact-sm"
                    loading={releaseState.isLoading}
                    onClick={() => handleRelease(p)}
                  >
                    Release
                  </Button>
                </Tooltip>
              </Group>
            ),
          },
        ]}
      />
    </Box>
  );
}
