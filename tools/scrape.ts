import axios from "axios";
import { JSDOM } from "jsdom";
import { parse as parseURL } from "url";
import ProgressBar from "progress";
import * as fs from "fs";
import * as path from "path";
import _ from "lodash";

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

      if (Number(number) < 1) {
        return undefined;
      }

      return {
        src,
        filename,
        pokemon,
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

  imagesObjects.forEach(async (image) => {
    try {
      const response = await axios.get(image.src, { responseType: "stream" });
      bar.tick();

      response.data.pipe(
        fs.createWriteStream(
          path.resolve(__dirname, "../images", image.filename)
        )
      );
    } catch (e) {
      console.error(`Could not download ${image.pokemon} from ${image.src}`);
      console.error(e);
    }
  });
})();
