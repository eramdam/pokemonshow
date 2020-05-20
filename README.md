# pokemonshow

Shows a (random) Pokémon in your terminal!

# Demo

![](demo.gif)

# Usage

```
	Usage
	  $ pokemonshow <nameOrNumber>

	Options
		--xterm, -x  Show xterm instead of image in iTerm
		--say, -s

	Examples
    $ pokemonshow
		$ pokemonshow pikachu
		$ pokemonshow 025 -x
		$ pokemonshow 025 -s
```

# Limitations

- The small images are only displayed on iTerm2 >= 3.x (using [term-img](https://github.com/sindresorhus/term-img)). All other terminals will default to the xterm files

# Changelog

## 1.1.0

- Images are cropped of their transparent pixels for smaller sizes
- Alternate forms of Pokémon (Alola, Galar, etc) actually work and can be used
- Rename `--say-name` to `--say`

## 1.0.2

Initial release :tada:
