#!/usr/bin/env node
import pokemonJson from "../pokemon.json";
import path from "path";
import termImg from "term-img";
import execa from "execa";
import Fuse from "fuse.js";
import _ from "lodash";
const meow = require("meow");

const fuse = new Fuse(Object.values(pokemonJson), {
  keys: ["names", "sprites"],
  isCaseSensitive: false,
  shouldSort: true,
});

const cli = meow(
  `
	Usage
	  $ pokemonshow <nameOrNumber>

	Options
		--xterm, -x  Outputs xterm instead of image in iTerm2.app
    --say, -s Announces the name of the Pokémon
    --shiny, -sh Chooses the shiny version of the Pokémon (if available)
    --form, -f Choose a specific form of the Pokémon (if available)
    --list Lists all the available Pokémon

  Examples
    $ pokemonshow
    $ pokemonshow pikachu
    $ pokemonshow 025 -x -sh
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
      shiny: {
        type: "boolean",
        alias: "sh",
      },
      form: {
        type: "boolean",
        form: "sh",
      },
    },
  }
);

type Pokemon = typeof pokemonJson[number];

function getPokemonFromInput(nameOrNumber?: string): Pokemon | undefined {
  if (!nameOrNumber) {
    return _.sample(pokemonJson);
  }

  const maybeNumber = Number(nameOrNumber);
  if (
    maybeNumber > 0 &&
    Number.isInteger(maybeNumber) &&
    Number.isFinite(maybeNumber)
  ) {
    return pokemonJson.find((p) => p.number === maybeNumber);
  } else {
    const fuzzyResults = fuse.search(nameOrNumber);
    if (!fuzzyResults || fuzzyResults.length < 1) {
      return undefined;
    }

    return fuzzyResults[0].item;
  }
}

async function displayImage(
  pokemon: Pokemon,
  useFallback = false,
  showName = false
) {
  if (showName) {
    console.log(`It's ${pokemon.prettyNames.eng}!`);
  }
  const fallback = async () => {
    const { stdout } = await execa("cat", [
      path.resolve(
        __dirname,
        "..",
        ...pokemon.sprites[0].sprite
          .replace(".png", "")
          .replace("images/", "xterms/")
          .split("/")
      ),
    ]);
    console.log(stdout);
  };

  if (useFallback) {
    return fallback();
  }

  termImg(
    path.resolve(__dirname, "..", ...pokemon.sprites[0].sprite.split("/")),
    {
      fallback,
    }
  );
}

(async () => {
  if (cli.flags.list) {
    pokemonJson.forEach((pkmn) => {
      console.log(pkmn);
    });
    return;
  }

  const name = cli.input[0];
  const pokemon = getPokemonFromInput(name);
  console.log({ pokemon });

  if (!pokemon) {
    return;
  }

  displayImage(pokemon, !!cli.flags.xterm, !!cli.flags.say);
})();
