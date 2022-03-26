import _ from "lodash";
import fs from "fs";
import path from "path";
const pokesprite = require("pokesprite-images");
import pokespriteData from "../node_modules/pokesprite-images/data/pokemon.json";
import * as GM from "gm";
import ProgressBar from "progress";

const gm = GM.subClass({ imageMagick: true });

function trimAndSaveImage(src: string, dest: string) {
  return new Promise<void>((resolve, reject) => {
    gm(src)
      .trim()
      .write(dest, (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
  });
}

(async () => {
  const spritesDir = path.resolve(
    pokesprite.baseDir,
    pokesprite.pokemonDirs[1]
  );

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
              (k) => k !== "$"
            );

            return [n, ...formKeys.map((k) => `${n} ${k}`)];
          })
          .value(),
        sprites: _(pkmn["gen-8"].forms)
          .keys()
          .flatMap((key) => {
            if (key === "$") {
              return [
                path.resolve(spritesDir, "regular", `${pkmn.slug.eng}.png`),
                path.resolve(spritesDir, "shiny", `${pkmn.slug.eng}.png`),
              ];
            }

            return [
              path.resolve(
                spritesDir,
                "regular",
                `${pkmn.slug.eng}-${key}.png`
              ),
              path.resolve(spritesDir, "shiny", `${pkmn.slug.eng}-${key}.png`),
            ];
          })
          .filter((sprite) => fs.existsSync(sprite))
          .value(),
      };
    })
    .value();

  const bar = new ProgressBar(
    "Images trimmed [:bar] (:current/:total) :percent :etas",
    {
      complete: "=",
      incomplete: " ",
      width: 80,
      total: _(pkmnFormatted)
        .flatMap((p) => p.sprites)
        .size(),
    }
  );

  for (const pkmn of pkmnFormatted) {
    const spritesPromises = pkmn.sprites.map((sprite) =>
      trimAndSaveImage(
        sprite,
        path.resolve(
          __dirname,
          "..",
          "images",
          ...sprite.replace(spritesDir, "").split("/")
        )
      )
    );

    pkmn.sprites.forEach((_, index) => {
      pkmn.sprites[index] = path
        .resolve(
          __dirname,
          "..",
          "images",
          ...pkmn.sprites[index].replace(spritesDir, "").split("/")
        )
        .replace(path.resolve(__dirname, ".."), "");
    });

    await Promise.all(spritesPromises);
    bar.tick(spritesPromises.length);
  }

  fs.writeFileSync(
    path.resolve(__dirname, "..", "pokemon.json"),
    JSON.stringify(pkmnFormatted),
    { encoding: "utf-8" }
  );
})();
