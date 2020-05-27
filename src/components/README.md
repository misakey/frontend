## Components folder

We store local components in this folder. We define local components as components that are not crafted to be shared and reused.
When we upgrade them enough to be reused, we move them into the [UI Package](/src/packages/ui).

We have four types of components:
* `App`: the root component of the app. It's called by the main `index.js` file.
* `dumb`: all reusable presentational components
* `screens`: all the screens of the app. The screens components can have sub-components for subscreens. Then they compose smart or dumb components
* `smart`: all the intermediary components that hold their own logic

