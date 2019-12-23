/* eslint-disable no-console, no-shadow */
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const R = require('ramda');
const validator = require('validator');

const packagePath = process.cwd();
const srcPath = path.join(packagePath, './src');

function isExist(path) {
  return _.isString(path) && fs.existsSync(path);
}

function createHelper(helperName, importPath) {
  const fileContent = `// generated with 'scripts/generate-helpers.js' 
import ${helperName} from '${importPath}';

export default ${helperName};
  `;

  const path = `${srcPath}/.generated/${helperName}`;
  if (!isExist(path)) {
    fs.mkdir(path, {}, (err) => {
      if (err) { throw err; }

      fs.writeFile(`${srcPath}/.generated/${helperName}/index.js`, fileContent, (err) => {
        if (err) { throw err; }
      });

      const append = `export { default as ${helperName} } from './${helperName}';
`;

      fs.appendFile(`${srcPath}/index.js`, append, (err) => { if (err) { throw err; } });
    });
  }
}

async function mapLib(lib, basePath) {
  Object.keys(lib).forEach((helperName) => {
    if (_.isString(helperName) && !isExist(`${srcPath}/${helperName}`)) {
      createHelper(helperName, `${basePath}/${helperName}`);
    }
  });
}

async function run() {
  try {
    await fs.promises.mkdir(`${srcPath}/.generated`, { recursive: true });
    await mapLib(_, 'lodash');
    await mapLib(R, 'ramda/src');
    await mapLib(validator, 'validator/lib');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
