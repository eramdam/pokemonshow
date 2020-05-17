#!/usr/bin/env node
import pokeMap from "../pokemon.json";
import terminalImage from "terminal-image";
import path from "path";

type pokemonName = keyof typeof pokeMap;

function getPokemonFromInput(name: string) {
  if (Number.isInteger(Number(name)) && Number(name) > 0) {
    const finalNumber = Number(name).toString();
    return pokeMap[finalNumber as pokemonName];
  } else {
    return pokeMap[name as pokemonName];
  }
}

(async () => {
  const [, , name] = process.argv;
  const pokemon = getPokemonFromInput(name);

  if (!pokemon) {
    return;
  }

  console.log(pokemon.size);

  console.log(
    await terminalImage.file(
      path.resolve(__dirname, "../images", pokemon.filename),
      {
        width: 40,
        height: 40,
      }
    )
  );
})();
