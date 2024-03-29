# Changelog

## 4.0.0

- Drops support of Node 18 since it reached its end of life.
- Upgrade dependencies

## 3.0.1

- Add support for listing forms of a specific pokemon by name
- Upgrade dependencies

## 3.0.0

- Require Node 18 or above
- Upgrade dependencies
- Make the script into ESM

## 2.1.0

- Upgrade to `pokesprite` 2.7.0

## 2.0.1

- Fix random feature

## 2.0.0

- Complete rewrite using the data from [pokesprite](https://github.com/msikma/pokesprite) instead of scraping Bulbapedia
- Supports shinies, female variants, regional forms and mega/gigantamax forms

## 1.2.0

- Some Pokémon couldn't be matched using their name. This should be fixed.
- Now uses a fuzzy search as a fallback

## 1.1.2

- Makes sure the number maps to the "vanilla" form of a given Pokémon

## 1.1.0

- Images are cropped of their transparent pixels for smaller sizes
- Alternate forms of Pokémon (Alola, Galar, etc) actually work and can be used
- Rename `--say-name` to `--say`

## 1.0.2

Initial release :tada:
