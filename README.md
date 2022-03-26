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
  Shows a (random) Pokémon in your terminal!

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
     --list-forms Lists all Pokémon with special forms
     --verbose, -v Outputs logs about the chosen Pokémon

   Examples
     $ pokemonshow
     $ pokemonshow rotom
     $ pokemonshow pikachu --form="gmax"
     $ pokemonshow porygon --shiny
     $ pokemonshow raichu --gen8 -x
```

# Background

All the data is based on the [pokesprite](https://github.com/msikma/pokesprite) project. You might want to look at [this page](https://msikma.github.io/pokesprite/overview/dex-gen8.html) to see the full list of Pokémon available.

# Limitations

- The small images are only displayed on iTerm2 >= 3.x (using [term-img](https://github.com/sindresorhus/term-img)). All other terminals will default to the xterm files.

# Notice

Please notice I don't own Pokémon or anything related to it. Pokémon is property of [The Pokémon Company](https://en.wikipedia.org/wiki/The_Pok%C3%A9mon_Company).

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
