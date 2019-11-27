## Webextension

This folder contains the source code of the Misakey Webextension.

* Dev mode: `TARGET_BROWSER=firefox make start-plugin`.
If `TARGET_BROWSER` is omitted, it will build for firefox by default
* Production mode:
     - `yarn build_plugin` --> it builds folders for both chrome and firefox
     - `yarn build_plugin_firefox`
     - `yarn build_plugin_chrome`
     - `make build_plugin` --> directly generate the zips in `build_plugin`
     - `make zip-plugin-source-code` --> generate a zip of the source_code for reviewers in `build_plugin/source_code.zip`

### Main parts:

#### Background script (/src/background-script/index.js)

The main purpose of this script is to block unwanted requests before they are launched in the client browser. 
It is based on the `@cliqz/adblocker` library 

#### Content script (/src/content-script/index.js)

The main purpose of this script is to hide cookies banners and other annoying content on the current page of the browser. 
It is also based on the `@cliqz/adblocker library`.

#### Popup

This folder stands for what is displayed in the extension popup in the browser. 
This is the react app of `app-frontend`, also used in Misakey webapp (pages roses). So, in the plugin folder, we only have the `env.js` file, as the rest of the source code is in the root folder of the project.

#### Manifest

The file `manifest.json` indicates to the browser where to find each resources to execute. 
It also handle permissions of the web extension and other configuration keys.
It has to be at the root of the final folder (dist).


### Architecture 

As we want to use the main React project in the popup, we need to use separate build generation scripts. 
Indeed, the React app has been generated with Create-React-App and is managed with React Scripts, which doesn't allow much custom config, and doesn't handle several entrypoint (Here we want to bundle background.js and content-script.js too).

So we have a `webpack.config.js` which handle Background script, Content script and `manifest.json`.

In the folder `popup/`, we find files which will help to generate the build output of app-front React app (with `react-scripts build`) : 
      - `env.js` which is different than for the classic webapp : it has a additional key `PLUGIN = true`
      - `index.html`: it is a copy of `index.html` of the webapp but without the analytics inline script (non supported in webextension).


#### Production build 

As `react-scripts` don't enable to easily configure output build directory, we generate the production folder dist for the extension with a Dockerfile :

- First, from src folder in `plugin/` it build the bundles for background.js and content-script.js and put them in a `/build/prod` folder
- Then it generate the output `build` for `app-front` in a `/tmp` folder with specific ENV values: 
      - `INLINE_RUNTIME_CHUNK = false` because by default, Create React App embeds a small runtime script into index.html during the production build to reduce the number of HTTP requests and it is not possible in webextension due to [CSP](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_Security_Policy).
- Finally, we generate zip folder for each browser, rename it and expose it when docker image is running
- We run it with docker and use docker cp to get the final folder (See Makefile on root of this project)
  - `make build-plugin`

#### Development build

* For the development environment, we follow the same logic than for the production build, but as we want hot-reload in both generation (plugin and popup), we use a `docker-compose` and two distinct `Dockerfile.dev`.

- The first one, for the plugin scripts is very simple : it share volumes with the host machine on source files and output dir (as we want to put it in the browser debugging extension menu) and it simply launch a `webpack --watch`

- The second use `react-app-rewired start` for building popup with watch mode

* To launch the dev environement, use `make start-plugin` in the root directory.
    *  Default env is `development` for watch mode, to custom it use `PLUGIN_ENV=<production, development, preproduction>`
    *  Default browser is `firefox`, to custom it use `TARGET_BROWSER=<chrome, firefox>`

The command `make start-plugin` create the folder `build_plugin/<env>/<browser>` which is the location of the volume shared. 
By creating it before launching the generation, it is owned by the current_user and allows to manipulate it without sudo (Docker create volume with root owner by default).
Then it launch the `docker-compose` command with `docker-compose.plugin.yml`.


#### Tests on browser

##### Chrome

- Go to Menu -> More tools -> Extensions
- Enable `Developer mode`
- Upload the generated folder (`chrome` or `firefox`) with `Load unpackaged extension`
- The extension should be loaded 

##### Firefox

- Go to `about:debugging` in the url
- Upload the generated folder (`chrome` or `firefox`) with `Load temporary module`
- The extension should be loaded 
- Enable `debugging of extensions`