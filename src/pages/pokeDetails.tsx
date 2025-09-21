import { ActionIcon, Badge, Button, Card, Divider, Group, Image, Stack, Text, Title, Flex } from "@mantine/core";
import { useCatchPokemonMutation, useGetPokemonDetailsQuery, useReleasePokemonMutation } from "../store/pokemon";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGetPokemonQuery } from "../store/globalPokemon";
import { Md1kPlus, MdArrowLeft, MdMinimize } from "react-icons/md";
import type { Pokemon } from "../interfaces/pokemon";

const PokeDetails = () => {
  const { pokeId } = useParams();
  const navigate = useNavigate();

  const [catchPokemon,] = useCatchPokemonMutation();
  const [releasePokemon,] = useReleasePokemonMutation();
  //const [shouldFetch, setShouldFetch] = useState(false);
  const { data: myPokemon, isLoading } = useGetPokemonDetailsQuery(
    { id: pokeId },
    { skip: !pokeId, refetchOnMountOrArgChange: true }
  );

  const shouldFetchGlobal = !myPokemon && !!pokeId && !isLoading;

  const { data: pokemon = null, isLoading: isLoadingPokemon } = useGetPokemonQuery(
    { id: pokeId },
    { skip: !shouldFetchGlobal }
  );

  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  useEffect(() => {
    if (myPokemon) setSelectedPokemon(myPokemon);
    else if (pokemon) setSelectedPokemon(pokemon);
  }, [myPokemon, pokemon]);

  if (!selectedPokemon || isLoading || isLoadingPokemon) return <Text ta="center">Loading...</Text>;

  const handleCatch = async () => {
    try {
      await catchPokemon({ id: selectedPokemon.id, pokemon: selectedPokemon });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRelease = async () => {
    try {
      await releasePokemon(selectedPokemon.id);
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Stack align="center" p="md" w="100%">
      {/* Header */}
      <Group w="100%" maw={860} mb="md" justify="apart">
        <ActionIcon variant="light" onClick={() => navigate(-1)} aria-label="Back">
          <MdArrowLeft size={24} />
        </ActionIcon>
        <Title order={3}>Details - {selectedPokemon.name}</Title>
        <div style={{ width: 40 }} />
      </Group>

      {/* Card */}
      <Card withBorder radius="lg" shadow="sm" p="lg" w="100%" maw={860}>
        <Stack gap="md">
          {/* Top: Image + Info */}
          <Group align="flex-start" gap="lg" wrap="wrap">
            {/* Image */}
            <Image
              src={
                selectedPokemon.sprite_front_default ||
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemon.id}.png`
              }
              alt={selectedPokemon.name}
              width={250}
              height={250}
              fit="contain"
              radius="md"
              style={{ imageRendering: "pixelated" }}
            />

            {/* Details */}
            <Stack gap="sm" style={{ flex: 1, minWidth: 0 }}>
              <Title order={2} tt="capitalize">{selectedPokemon.name}</Title>
              <Flex gap="md" wrap="wrap">
                <Text c="dimmed">Height: {selectedPokemon.height}</Text>
                <Text c="dimmed">Weight: {selectedPokemon.weight}</Text>
              </Flex>

              <Divider my="sm" />

              {/* Abilities */}
              <Stack gap="xs">
                <Text fw={600}>Abilities (Not hidden)</Text>
                <Flex gap="sm" wrap="wrap">
                  {selectedPokemon.abilities?.map((a) => <Badge size="lg" key={a} color="blue" variant="light">{a}</Badge>)}
                </Flex>
              </Stack>
            </Stack>
          </Group>

          {/* Bottom: Actions */}
          <Flex gap="md" wrap="wrap" justify="center" mt="md">
            <Button
              disabled={!!myPokemon}
              leftSection={<Md1kPlus />}
              onClick={() => handleCatch()}
            >
              Catch
            </Button>
            <Button
              disabled={!myPokemon}
              variant="light"
              color="red"
              leftSection={<MdMinimize />}
              onClick={() => handleRelease()}
            >
              Release
            </Button>
          </Flex>
        </Stack>
      </Card>
    </Stack>
  );
};

export default PokeDetails;
