#!/usr/bin/env node
import pokemonJson from "../pokemon.json";
import path from "path";
import termImg from "term-img";
import execa from "execa";
import Fuse from "fuse.js";
import _ from "lodash";
import meow from "meow";

const fuse = new Fuse(Object.values(pokemonJson), {
  keys: [
    "prettyNames.eng",
    "prettyNames.chs",
    "prettyNames.jpn",
    "prettyNames.jpr_ro",
    "sprites",
  ],
  isCaseSensitive: false,
  shouldSort: true,
});

const cli = meow(
  `
	Usage
	  $ pokemonshow <nameOrNumber>

	Options
		--xterm, -x  Outputs xterm instead of image in iTerm2.app
    --say Announces the name of the Pokémon
    --shiny Chooses the shiny sprite of the Pokémon (if available)
    --female Chooses the female sprite of the Pokémon (if available)
    --form Chooses a specific form of the Pokémon (if available)
    --gen8 Chooses the gen8 sprite of the Pokémon (if available)
    --list Lists all the available Pokémon
    --verbose, -v Outputs logs about the chosen Pokémon

  Examples
    $ pokemonshow
    $ pokemonshow rotom
    $ pokemonshow pikachu --form="gmax"
    $ pokemonshow porygon --shiny
    $ pokemonshow raichu --gen8 -x
    `,
  {
    autoHelp: true,
    flags: {
      xterm: {
        type: "boolean",
        alias: "x",
      },
      say: {
        type: "boolean",
      },
      list: {
        type: "boolean",
      },
      shiny: {
        type: "boolean",
        default: false,
      },
      form: {
        type: "string",
        default: "$",
      },
      female: {
        type: "boolean",
        default: false,
      },
      gen8: {
        type: "boolean",
        default: false,
      },
      verbose: {
        type: "boolean",
        alias: "v",
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

function chooseSprite(pokemon: Pokemon, flags: typeof cli.flags): string {
  const sorted = _(pokemon.sprites)
    .orderBy(
      [
        (sprite) => {
          return sprite.form.includes(flags.form.toLowerCase());
        },
        (sprite) => {
          return flags.female === sprite.female;
        },
        (sprite) => {
          return flags.gen8 === sprite.is_gen_8;
        },
        (sprite) => {
          return flags.shiny === sprite.shiny;
        },
      ],
      ["desc", "desc", "desc", "desc", "desc"]
    )
    .value();

  if (flags.verbose) {
    console.log(sorted, flags);
  }
  return sorted[0].sprite;
}

async function displayImage(pokemon: Pokemon, flags: typeof cli.flags) {
  if (flags.say) {
    console.log(`It's ${pokemon.prettyNames.eng}!`);
  }
  const chosenSprite = chooseSprite(pokemon, flags);
  const fallback = async () => {
    const { stdout } = await execa("cat", [
      path.resolve(
        __dirname,
        "..",
        ...chosenSprite
          .replace(".png", "")
          .replace("images/", "xterms/")
          .split("/")
      ),
    ]);
    console.log(stdout);
  };

  if (flags.xterm) {
    return fallback();
  }

  termImg(path.resolve(__dirname, "..", ...chosenSprite.split("/")), {
    fallback,
  });
}

(async () => {
  if (cli.flags.list) {
    pokemonJson.forEach((pkmn) => {
      console.log(pkmn);
    });
    return;
  }

  const name = cli.input[0];
  if (!name) {
    return;
  }
  const pokemon = getPokemonFromInput(name);

  if (!pokemon) {
    return;
  }

  if (cli.flags.verbose) {
    console.log(pokemon);
  }

  displayImage(pokemon, cli.flags);
})();
