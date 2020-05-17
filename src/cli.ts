#!/usr/bin/env node
import pokemonJson from "../pokemon.json";
import path from "path";
import termImg from "term-img";
import execa from "execa";

const meow = require("meow");

const cli = meow(
  `
	Usage
	  $ pokemonshow <nameOrNumber>

	Options
		--xterm, -x  Show xterm instead of image in iTerm
		--say-name, -s

	Examples
		$ pokemonshow pikachu
		$ pokemonshow 025 -x
`,
  {
    flags: {
      xterm: {
        type: "boolean",
        alias: "x",
      },
    },
  }
);

type PokemonKey = keyof typeof pokemonJson;
type ValueOf<T> = T[keyof T];
type Pokemon = ValueOf<typeof pokemonJson>;

function getPokemonFromInput(nameOrNumber?: string) {
  if (!nameOrNumber) {
    const names = Object.keys(pokemonJson).filter(
      (i) => !Number.isInteger(Number(i))
    );
    const randomName = names[Math.floor(Math.random() * names.length)];

    return pokemonJson[randomName as PokemonKey];
  }

  if (Number.isInteger(Number(nameOrNumber)) && Number(nameOrNumber) > 0) {
    const finalNumber = Number(nameOrNumber).toString();
    return pokemonJson[finalNumber as PokemonKey];
  } else {
    return pokemonJson[nameOrNumber as PokemonKey];
  }
}

async function displayImage(
  pokemon: Pokemon,
  useFallback: boolean,
  showName: boolean
) {
  if (showName) {
    console.log(`It's ${pokemon.name}!`);
  }
  const fallback = async () => {
    const { stdout } = await execa("cat", [
      path.resolve(
        __dirname,
        "../xterms",
        pokemon.filename.replace(".png", "")
      ),
    ]);
    console.log(stdout);
  };

  if (useFallback) {
    return fallback();
  }

  termImg(path.resolve(__dirname, "../images", pokemon.filename), {
    fallback,
  });
}

(async () => {
  const name = cli.input[0];
  const pokemon = getPokemonFromInput(name);

  if (!pokemon) {
    return;
  }

  displayImage(pokemon, !!cli.flags.xterm, !!cli.flags.s);
})();
