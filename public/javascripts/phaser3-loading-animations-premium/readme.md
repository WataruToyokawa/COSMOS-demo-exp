# Phaser 3 Loading Animations
> Fast & customizable loading animations written in TypeScript

## Prerequisites

You'll need [Node.js](https://nodejs.org/en/), [npm](https://www.npmjs.com/), and [Parcel](https://parceljs.org/) installed.

It is highly recommended to use [Node Version Manager](https://github.com/nvm-sh/nvm) (nvm) to install Node.js and npm.

For Windows users there is [Node Version Manager for Windows](https://github.com/coreybutler/nvm-windows).

Install Node.js and `npm` with `nvm`:

```bash
nvm install node

nvm use node
```

Replace 'node' with 'latest' for `nvm-windows`.

Then install Parcel:

```bash
npm install -g parcel-bundler
```

## Getting Started

Go into the project folder and install dependencies:

```bash
npm install
```

Start development server to see the demo scene:

```
npm run start
```

## Using Loading Animations

You'll find loading animations for each tier that you purchased in `src/spinners` with a folder for each tier: `basic`, `plus`, or `premium`.

You can just take those files plus any dependencies and copy them into your project.

The only dependencies should be `bezier-easing` if the loading animation you want uses it. Just check if it is imported at the top of the class. If so then run `npm install bezier-easing` in your project.

Then some multi-color animations may depend on a single-color version from a lower tier. Copy both to your project.

Once in your project, you can just import the files where you need them and use it like the example Scenes demonstrate.

## Transpiling to JavaScript

We have 2 NPM scripts that you can use to transpile the TypeScript code into ES5 or ES6 JavaScript.

For ES6:

```bash
npm run to-es6
```

This will create a new folder named `es6` with the loading animations code transpiled to JavaScript by `tsc`--the TypeScript compiler.

For ES5:

```bash
npm run to-es5
```

This will create a new folder named `es5` with the loading animations code transpiled to JavaScript by `tsc`.

You can find both scripts in `package.json` and adjust them or make new ones based on them if you need another JavaScript target! You can find more `--target` options here: https://www.typescriptlang.org/docs/handbook/compiler-options.html
