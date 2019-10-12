'use strict';

const path = require('path');
const fsp = require('fs').promises;
const { promisify } = require('util');
const chalk = require('chalk');
const inquirer = require('inquirer');
const _ = require('lodash');
const figlet = require('figlet');
const { permissionChoices } = require('./manifestOptions');

const QUESTIONS = [{
  name: "name",
  message: "How would you like to name your web extension",
},
{
  name: "description",
  message: "Give a description for your web extension",
},
{
  name: "popup",
  message: "Would you like to use a popup?",
  type: "confirm",
  default: true,
},
{
  name: "contentScript",
  message: "Would you like to use a content script?",
  type: "confirm",
  default: false,
},
{
  type: "input",
  name: "contentScriptMatch",
  message: "Define a match pattern for your content script?",
  when: response => {
    return response.contentScript;
  },
},
{
  name: "background",
  message: "Would you like to use a background script?",
  type: "confirm",
  default: false,
},
{
  type: "checkbox",
  name: "permissions",
  message: "Would you like to set permissions?",
  choices: permissionChoices,
}];

const copyTpl = async (file, projectPath, opts) => {
  const filePath = path.resolve(__dirname, 'templates', file);
  const content = await fsp.readFile(filePath);
  const tmpl = _.template(content)(opts);
  return fsp.writeFile(path.resolve(projectPath, file), tmpl)
}

const extendJSON = async (filepath, content) => {
  await fsp.readFile(filepath, "utf-8").then(async (data) => {
    const originalContent = JSON.parse(data);
    const newContent = Object.assign({}, originalContent, content);
    const jsonStr = JSON.stringify(newContent, null, 2) + "\n";
    await fsp.writeFile(filepath, jsonStr);
  });
}

const add = async (extPath, name, file, manifestArgs) => {
  await fsp.mkdir(path.resolve(extPath, name));
  await fsp.writeFile(path.resolve(extPath, `${name}/${file}`), '');
  await extendJSON(path.resolve(extPath, 'manifest.json'), manifestArgs);
};

const copyFolder = async (src, dest) => {
  const srcPath = path.resolve(__dirname, 'templates', src);
  await fsp.mkdir(dest);
  await fsp.readdir(srcPath).then(dir => {
    dir.forEach(async (element) => {
      const stat = await fsp.lstat(path.resolve(srcPath, element));
      if (stat.isFile()) {
        await fsp.copyFile(path.resolve(srcPath, element), path.resolve(dest, element));
      } else {
        copyFolder(path.resolve(srcPath, element), path.resolve(dest, element));
      }
    });
  })
};

const cli = async () => {
  const asyncFiglet = promisify(figlet);
  const header = await asyncFiglet('create-web-ext', 'Doom');
  console.log(header);
  return inquirer.prompt(QUESTIONS).then(async ({
    name,
    description,
    popup,
    contentScript,
    contentScriptMatch,
    input,
    background,
    permissions
  }) => {
    const projectPath = path.resolve(process.cwd(), name);
    await fsp.rmdir(projectPath, { recursive: true });
    await fsp.mkdir(projectPath);
    await copyTpl('package.json', projectPath, { name })

    const extPath = path.resolve(projectPath, 'extension');
    await fsp.mkdir(extPath);
    await copyTpl('manifest.json', extPath);

    const localesPath = path.resolve(extPath, '_locales/en');
    await fsp.mkdir(localesPath, { recursive: true });
    await copyTpl(
      '_locales/en/messages.json',
      extPath,
      { name, description }
    );

    await copyFolder('images', `${extPath}/images`);

    if (popup) {
      await add(extPath, 'popup', 'index.html', {
        browser_action: {
          browser_style: true,
          default_popup: 'popup/index.html'
        }
      });
    }
    if (background) {
      await add(extPath, 'background', 'index.js', {
        background: {
          scripts: 'background/index.js'
        }
      });
    }
    if (contentScript) {
      const match = contentScriptMatch || '<all_urls>';
      await add(extPath, 'content_scripts', 'index.js', {
        content_scripts: [
          {
            matches: [match],
            js: 'content_scripts/index.js'
          }
        ]
      });
    }
    if (permissions && (permissions.length > 0)) {
      await extendJSON(path.resolve(extPath, 'manifest.json'), {
        permissions: permissions
      });
    }

    const postMsg = `
      Congratulations! Your new WebExtension has been created at:
      ${chalk.bold(chalk.green(projectPath))}
    `;

    console.log(postMsg);
  });
};

module.exports = cli;
