import axios from "axios";
import { JSDOM } from "jsdom";
import { parse as parseURL } from "url";
import ProgressBar from "progress";
import * as fs from "fs";
import * as path from "path";
import _ from "lodash";
import slug from "slug";
import * as GM from "gm";

const gm = GM.subClass({ imageMagick: true });

const pokemonListUrl = `http://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_National_Pok%C3%A9dex_number`;

const imagesSelector = `#mw-content-text table tr th a img`;

function trimAndSaveImage(image: string) {
  return new Promise((resolve, reject) => {
    gm(image)
      .trim()
      .write(image, (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
  });
}

(async () => {
  const response = await (await axios.get(pokemonListUrl)).data;
  const { document } = new JSDOM(response).window;
  const pokemonImages = [
    ...document.querySelectorAll<HTMLImageElement>(imagesSelector),
  ];

  const imagesObjects = _(pokemonImages)
    .map((element) => {
      const src = `https:` + element.getAttribute("src");
      const file = parseURL(src).pathname?.split("/").pop() || "";
      const number = file.match(/^[0-9]*/)![0];
      const form = file.replace(number, "").replace("MS.png", "");
      const basePokemon = element.getAttribute("alt");
      const filename = `${number}-${basePokemon}${form ? `-${form}` : ""}.png`;
      const pokemon = `${basePokemon}${form ? `-${form}` : ""}`;

      if (Number(number) < 1 || !basePokemon) {
        return undefined;
      }

      return {
        src,
        number,
        filename,
        localName: pokemon,
        actualName: basePokemon,
      };
    })
    .compact()
    .value();

  const bar = new ProgressBar(
    "Image files downloaded [:bar] (:current/:total) :percent :etas",
    {
      complete: "=",
      incomplete: " ",
      width: 80,
      total: imagesObjects.length,
    }
  );

  const promises = imagesObjects.map(async (image) => {
    try {
      const response = await axios.get(image.src, {
        responseType: "arraybuffer",
      });
      bar.tick();

      const imagePath = path.resolve(__dirname, "../images", image.filename);
      fs.writeFileSync(imagePath, response.data);

      await trimAndSaveImage(imagePath);
    } catch (e) {
      console.error(`Could not download ${image.localName} from ${image.src}`);
      console.error(e);
    }
  });

  await Promise.all(promises);

  const pokeMapByName = _(imagesObjects)
    .keyBy((image) => {
      return slug(image.localName.replace(/([^a-z])/gi, "-$1"))
        .replace("-XY", "")
        .toLowerCase();
    })
    .mapValues((image) => ({
      filename: image.filename,
      name: image.actualName,
    }))
    .value();
  const pokeMapByNumber = _(imagesObjects)
    .filter((image) => {
      // We try to extract the suffix in the filename.
      // Some filenames have a suffix indicating an alternative form of a given Pokémon
      // Examples:
      // 052-Meowth.png => "Regular" Meowth
      // 052-Meowth-A.png => Alolan Meowth
      // 052-Meowth-G.png => Galarian Meowth
      const suffixMatch = image.filename.match(/-([A-Z]+).png$/);

      // If we don't have any suffix, we're all good.
      if (!suffixMatch) {
        return true;
      }

      // If the suffix is "XY", we're all good too.
      if (suffixMatch[1] === "XY") {
        return true;
      }

      // Otherwise, we can exclude.
      return false;
    })
    .keyBy((image) => {
      return Number(image.number);
    })
    .mapValues((image) => ({
      filename: image.filename,
      name: image.actualName,
    }))
    .value();

  const pokeMap = { ...pokeMapByNumber, ...pokeMapByName };
  await fs.promises.writeFile(
    path.resolve(__dirname, "..", "pokemon.json"),
    JSON.stringify(pokeMap)
  );
})();
