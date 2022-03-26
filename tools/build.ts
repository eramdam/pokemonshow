import execa from "execa";
import fs from "fs";
import * as GM from "gm";
import _ from "lodash";
import path from "path";
import pokespriteData from "pokesprite-images/data/pokemon.json";
import ProgressBar from "progress";
import { hasProperty } from "../src/helpers";
const pokesprite = require("pokesprite-images");

const gm = GM.subClass({ imageMagick: true });

function trimAndSaveImage(src: string, dest: string) {
  return new Promise<string>((resolve, reject) => {
    const foldername = path.dirname(
      path.resolve(__dirname, "..", "images", ...dest.split("/"))
    );

    if (!fs.existsSync(foldername)) {
      fs.mkdirSync(foldername, { recursive: true });
    }

    gm(src)
      .trim()
      .write(path.resolve(foldername, path.basename(dest)), (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(path.resolve(foldername, path.basename(dest)));
      });
  });
}

async function generateXterm(src: string, dest: string) {
  const foldername = path.dirname(dest);

  if (!fs.existsSync(foldername)) {
    fs.mkdirSync(foldername, { recursive: true });
  }

  await execa("img2xterm", [src, dest.replace(".png", "")]);
}

const gen7Sprites = path.resolve(pokesprite.baseDir, pokesprite.pokemonDirs[0]);
const gen8Sprites = path.resolve(pokesprite.baseDir, pokesprite.pokemonDirs[1]);

(async () => {
  const pkmnFormatted = _(pokespriteData)
    .values()
    .sortBy((i) => Number(i.idx))
    .map((pkmn) => {
      return {
        number: Number(pkmn.idx),
        names: _([pkmn.name.eng, pkmn.slug.eng])
          .map((n) => n.toLowerCase())
          .uniq()
          .flatMap((n) => {
            const formKeys = Object.keys(pkmn["gen-8"].forms).filter(
              (k) => k !== "$" && k !== "gmax"
            );

            return [n, ...formKeys.map((k) => `${n} ${k}`)];
          })
          .value(),
        sprites: _(pkmn["gen-8"].forms)
          .toPairs()
          .map((pair) => {
            const [key, value] = pair;
            const suffix = (key !== "$" && `-${key}`) || "";

            const makeSprites = (dir: string) => {
              const filename = `${pkmn.slug.eng}${suffix}.png`;
              const hasFemaleSprite = hasProperty(value, "has_female");
              const regularBaseDir = path.resolve(dir, "regular");
              const shinyBaseDir = path.resolve(dir, "shiny");

              const maleRegular = path.resolve(regularBaseDir, filename);
              const femaleRegular = path.resolve(
                regularBaseDir,
                "female",
                filename
              );

              const maleShiny = path.resolve(shinyBaseDir, filename);
              const femaleShiny = path.resolve(
                shinyBaseDir,
                "female",
                filename
              );

              if (!fs.existsSync(maleRegular) || !fs.existsSync(maleShiny)) {
                return [];
              }

              return _.compact([
                {
                  is_gen_8: true,
                  form: key,
                  shiny: false,
                  female: false,
                  sprite: maleRegular,
                },
                hasFemaleSprite && {
                  is_gen_8: true,
                  form: key,
                  shiny: false,
                  female: true,
                  sprite: femaleRegular,
                },
                {
                  is_gen_8: true,
                  form: key,
                  shiny: true,
                  female: false,
                  sprite: maleShiny,
                },
                hasFemaleSprite && {
                  is_gen_8: true,
                  form: key,
                  shiny: true,
                  sprite: femaleShiny,
                },
              ]);
            };

            const baseSprites = makeSprites(gen8Sprites);

            const hasOldGen7Sprites =
              !_.isEmpty(pkmn["gen-7"]) &&
              // @ts-expect-error
              pkmn["gen-7"].forms[key] &&
              !value.is_prev_gen_icon;

            if (hasOldGen7Sprites) {
              return [
                ...baseSprites,
                ...makeSprites(gen7Sprites).map((s) => {
                  return { ...s, is_gen_8: false };
                }),
              ];
            }

            return baseSprites;
          })
          .flatten()
          .compact()
          .value(),
      };
    })
    .value();

  const numberOfSprites = pkmnFormatted.flatMap((p) => p.sprites).length;

  const bar = new ProgressBar(
    "Processing images [:bar] (:current/:total) :percent :etas",
    {
      complete: "=",
      incomplete: " ",
      width: 80,
      total: numberOfSprites,
    }
  );

  for (const chunk of _.chunk(pkmnFormatted, 20)) {
    const promises = chunk.flatMap((pkmn) => {
      return pkmn.sprites.map((_sprite, index) => {
        const spriteObject = pkmn.sprites[index];
        const destPath = spriteObject.sprite.replace(pokesprite.baseDir, "");

        return trimAndSaveImage(spriteObject.sprite, destPath).then(
          (finalSprite) => {
            spriteObject.sprite = finalSprite.replace(
              path.resolve(__dirname, ".."),
              ""
            );

            return generateXterm(
              finalSprite,
              path
                .resolve(__dirname, "..", "xterms", ...destPath.split("/"))
                .replace(".png", "")
            ).then(() => {
              bar.tick();
            });
          }
        );
      });
    });

    await Promise.all(promises);
  }

  fs.writeFileSync(
    path.resolve(__dirname, "..", "pokemon.json"),
    JSON.stringify(pkmnFormatted),
    { encoding: "utf-8" }
  );
})();
