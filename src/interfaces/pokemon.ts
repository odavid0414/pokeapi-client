export interface Pokemon {
    id: number;
    name: string;
    sprite_front_default?: string | null;
    height?: number | null;
    weight?: number | null;
    abilities?: string[];
}