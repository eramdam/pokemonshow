import test from "ava";
import { execa } from "execa";
import _ from "lodash";

async function runCli(...args) {
  return execa("./src/cli.js", _.flatten([...args, "-x"]));
}

async function outputMacro(t, input, snapshot = true) {
  const { stdout } = await runCli(input);
  t.snapshot(stdout);
}

test("outputs a random pokémon without throwing", async (t) => {
  const { stderr } = await runCli();
  t.falsy(stderr);
});

test("outputs Pikachu", outputMacro, ["pikachu"]);
test("outputs shiny Pikachu", outputMacro, ["pikachu", "--shiny"]);
test("outputs female Pikachu", outputMacro, ["pikachu", "--female"]);
test("outputs shiny female Pikachu", outputMacro, [
  "pikachu",
  "--female",
  "--shiny",
]);
test("outputs gen8 shiny female Venusaur", outputMacro, [
  "Venusaur",
  "--female",
  "--shiny",
  "--gen8",
]);
test("output verbose info", outputMacro, ["squirtle", "--verbose"]);

test("announce Pokémon name", async (t) => {
  const { stdout } = await runCli("pikachu", "--say");
  t.true(stdout.includes(`It's Pikachu!`));
});
