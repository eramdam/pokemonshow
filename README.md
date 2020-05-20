# pokemonshow

Shows a (random) Pokémon in your terminal!

# Installation

```
npm i -g pokemonshow
```

# Demo

![](https://raw.githubusercontent.com/eramdam/pokemonshow/master/demo.gif)

# Usage

```
	Usage
	  $ pokemonshow <nameOrNumber>

	Options
		--xterm, -x  Show xterm instead of image in iTerm
		--say, -s Announces the name of the Pokémon

	Examples
    $ pokemonshow
		$ pokemonshow pikachu
		$ pokemonshow 025 -x
		$ pokemonshow 025 -s
```

# Limitations

- The small images are only displayed on iTerm2 >= 3.x (using [term-img](https://github.com/sindresorhus/term-img)). All other terminals will default to the xterm files

# Contributing

You will need:

- NodeJS 12.x or newer
- npm

If you need to update the images and xterm files, you will need:

- ImageMagick
- [img2xterm](https://github.com/rossy/img2xterm) (this needs to be compiled from source)

Then run

```
npm run scrape && npm run make-xterm
```

# Changelog

## 1.1.1

- Makes sure the number maps to the "vanilla" form of a given Pokémon

## 1.1.0

- Images are cropped of their transparent pixels for smaller sizes
- Alternate forms of Pokémon (Alola, Galar, etc) actually work and can be used
- Rename `--say-name` to `--say`

## 1.0.2

Initial release :tada:
