#!/usr/bin/env node
import pokemonJson from "../pokemon.json";
import path from "path";
import termImg from "term-img";
import execa from "execa";
import Fuse from "fuse.js";
const meow = require("meow");

const fuse = new Fuse(Object.values(pokemonJson), {
  keys: ["name", "filename"],
  isCaseSensitive: false,
  shouldSort: true,
});

const cli = meow(
  `
	Usage
	  $ pokemonshow <nameOrNumber>

	Options
		--xterm, -x  Show xterm instead of image in iTerm
    --say, -s Announces the name of the Pokémon
    --list Lists all the available Pokémon

  Examples
    $ pokemonshow
    $ pokemonshow pikachu
    $ pokemonshow 025 -x
    $ pokemonshow 42 -s
    `,
  {
    flags: {
      xterm: {
        type: "boolean",
        alias: "x",
      },
      say: {
        type: "boolean",
        alias: "s",
      },
      list: {
        type: "boolean",
      },
    },
  }
);

type PokemonKey = keyof typeof pokemonJson;
type ValueOf<T> = T[keyof T];
type Pokemon = ValueOf<typeof pokemonJson>;

function getPokemonFromInput(nameOrNumber?: string): Pokemon | undefined {
  if (!nameOrNumber) {
    const names = Object.keys(pokemonJson).filter(
      (i) => !Number.isInteger(Number(i))
    );
    const randomName = names[Math.floor(Math.random() * names.length)];

    return pokemonJson[randomName as PokemonKey];
  }

  // Is the input a number? If so then let's use it.
  if (Number.isInteger(Number(nameOrNumber)) && Number(nameOrNumber) > 0) {
    return pokemonJson[nameOrNumber as PokemonKey];
  } else {
    // Try finding the given pokemon using its "alias"
    const pokemonUsingKey =
      pokemonJson[nameOrNumber.toLowerCase() as PokemonKey];

    if (pokemonUsingKey) {
      return pokemonUsingKey;
    }

    // Otherwise, use fuzzy search to find a match.
    const fuzzyResults = fuse.search(nameOrNumber);
    if (!fuzzyResults || fuzzyResults.length < 1) {
      return undefined;
    }

    return fuzzyResults[0].item;
  }
}

async function displayImage(
  pokemon: Pokemon,
  useFallback: boolean,
  showName: boolean
) {
  if (showName) {
    console.log(`It's ${pokemon.name}!\n`);
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
  if (cli.flags.list) {
    Object.entries(pokemonJson)
      .filter(([key]) => {
        if (Number.isInteger(Number(key))) {
          return false;
        }

        return true;
      })
      .forEach(([, value]) => {
        const numberMatch = value.filename.match(/^([0-9]{3})/);
        console.log({
          name: value.name,
          number: numberMatch ? numberMatch[0] : "",
          filename: value.filename,
        });
      });
    return;
  }

  const name = cli.input[0];
  const pokemon = getPokemonFromInput(name);

  if (!pokemon) {
    return;
  }

  displayImage(pokemon, !!cli.flags.xterm, !!cli.flags.say);
})();
