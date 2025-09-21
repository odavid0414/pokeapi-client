import { useEffect, useMemo, useState } from "react";
import { ActionIcon, Box, Group, Loader, Text, TextInput, Tooltip, Button, Select, Switch, Image } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import { MdRefresh, MdSearch, MdOpenInNew } from "react-icons/md";
import { useNavigate } from "react-router-dom";

import { useGetTypesQuery, useGetByTypeQuery, useGetPokemonsQuery } from "../store/globalPokemon";
import type { Pokemon } from "../interfaces/pokemon";
import { useGetMyPokemonsQuery } from "../store/pokemon";

export default function CaughtPokemonsTable() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebouncedValue(search, 300);
    const [sort, setSort] = useState<DataTableSortStatus<Pokemon>>({
        columnAccessor: "caughtAt",
        direction: "desc",
    });
    const [isMyList, setIsMyList] = useState(true);

    const [selectedType, setSelectedType] = useState<string | null>(null);
    const { data: typeList } = useGetTypesQuery();
    const { data: pokemonsByType } = useGetByTypeQuery(selectedType ?? "", {
        skip: !selectedType,
    });
    const { data: allPokemons = { items: [], count: 0 } } = useGetPokemonsQuery({ limit: pageSize, offset: (page - 1) * pageSize }, {
        skip: isMyList,
        refetchOnMountOrArgChange: true
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
        sortBy: sort.columnAccessor as "name",
        sortDir: sort.direction,
    });

    const navigate = useNavigate();

    const items = useMemo(() => (isMyList ? data?.items : allPokemons?.items) as Pokemon[], isMyList ? [data] : [allPokemons.items]);
    const total = useMemo(() => isMyList ? data?.total : allPokemons?.count, isMyList ? [data] : [allPokemons.count]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, pageSize, sort.columnAccessor, sort.direction, selectedType]);

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
                <Switch defaultChecked size="xl"
                    onLabel="Show my list" offLabel="Show Global list" onChange={(e) => setIsMyList(e.currentTarget.checked)} color="green" />
            </Group>

            {selectedType && pokemonsByType ? (
                <Box my="sm">
                    <Text size="sm" c="dimmed">Pokemons of type {selectedType} (from public API):</Text>
                    <Group gap="xs" wrap="wrap" mt={4}>
                        {pokemonsByType.pokemon.map((_, index: number) => {
                            return (
                                <Group key={index} gap="xs">
                                    <Button size="compact-sm" variant="default" onClick={() => navigate(`/pokemon/${name}`)}>
                                        View
                                    </Button>
                                </Group>
                            );
                        })}
                    </Group>
                </Box>
            ) : null}

            <DataTable
                highlightOnHover={true}
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
                    setSort(s as DataTableSortStatus<Pokemon>);
                    setPage(1);
                }}
                noRecordsText={isError ? "Error loading data" : "You haven't caught any pokemons yet."}
                columns={[
                    {
                        accessor: "sprite_front_default",
                        title: "",
                        width: 75,
                        render: (p) => (
                            <Image
                                src={
                                    p.sprite_front_default ?? ""
                                }
                                alt={p.name}
                            />
                        ),
                    },
                    {
                        accessor: "name",
                        title: "Name",
                        sortable: true,
                        render: (p) => <Text ml="md" fz={"xl"}>{p.name}</Text>
                    },
                    {
                        accessor: "actions",
                        title: "",
                        textAlign: "right",
                        render: (p) => (
                            <Group justify="flex-end" gap="xs" wrap="nowrap">
                                <Tooltip label="Open details">
                                    <ActionIcon
                                        variant="subtle"
                                        size="lg"
                                        aria-label="Details"
                                        onClick={() => navigate(`/pokeDetails/${p.id}`)}
                                    >
                                        <MdOpenInNew />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                        ),
                    },
                ]}
            />
        </Box>
    );
}
