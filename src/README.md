## Sources folder

In this folder remains most of the code of the app.

You will find some folders at two places in the app: the root of `src` folder and the `src/packages` folder.

This is because of our development process:
1. first create a component / hook / helper for your local need
2. if you need it somewhere else, adapt it to match the two cases
3. if you need it at a third point, refactor it to be clean and reusable: so more generic.

The two first steps are done in local folders (`src`), and the third one is the moment we move it into the specific package.