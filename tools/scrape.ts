import axios from "axios";
import { JSDOM } from "jsdom";
import { parse as parseURL } from "url";
import ProgressBar from "progress";
import * as fs from "fs";
import * as path from "path";
import _ from "lodash";
import slug from "slug";
import sharp from "sharp";

const pokemonListUrl = `http://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_National_Pok%C3%A9dex_number`;

const imagesSelector = `#mw-content-text table tr th a img`;

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
      const pokemon = element.getAttribute("alt");
      const filename = `${number}-${pokemon}${form ? `-${form}` : ""}.png`;

      if (Number(number) < 1 || !pokemon) {
        return undefined;
      }

      return {
        src,
        number,
        filename,
        pokemon,
        size: {},
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

      const imagePath = path.resolve(__dirname, "../images", image.filename);

      const metadata = await sharp(response.data).metadata();
      image.size = {
        width: metadata.width || 0,
        height: metadata.height || 0,
      };

      bar.tick();
      return await sharp(response.data).toFile(imagePath);
    } catch (e) {
      console.error(`Could not download ${image.pokemon} from ${image.src}`);
      console.error(e);
    }
  });

  await Promise.all(promises);

  const pokeMapByname = _(imagesObjects)
    .keyBy((image) => {
      return slug(image.pokemon.replace(/([^a-z])/gi, "-$1")).toLowerCase();
    })
    .mapValues((image) => ({
      filename: image.filename,
      size: image.size,
    }))
    .value();
  const pokeMapByNumber = _(imagesObjects)
    .keyBy((image) => {
      return Number(image.number);
    })
    .mapValues((image) => ({
      filename: image.filename,
      size: image.size,
    }))
    .value();

  const pokeMap = { ...pokeMapByNumber, ...pokeMapByname };
  await fs.promises.writeFile(
    path.resolve(__dirname, "..", "pokemon.json"),
    JSON.stringify(pokeMap)
  );
})();
