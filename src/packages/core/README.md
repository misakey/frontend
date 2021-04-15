## Misakey core package

This package is not supposed to be used by the community.

It's an internal package making the construction of `@misakey/sdk` possible.

### Yarn linking

If you want to `yarn link` this package to use it in your local dev (like to develop the SDK), you will need to build it as a local build (this will make babel aliasing that are required to do that)

1. Run a `yarn local-build`
2. Go on `build` folder
3. Run `yarn link`
4. In your project, run `yarn link @misakey/core`

### Publishing on NPM

To publish on NPM, we need to use a build for NPM (different from build for local linking). 

1. Be sure to have bump version in `package.json`
2. Run `yarn build`
3. Run `yarn release`
