'use strict';

const path = require('path');
const fsp = require('fs').promises;
const chalk = require('chalk');
const inquirer = require('inquirer');
const _ = require('lodash');
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
  const content = await fsp.readFile(path.resolve('templates', file));
  const tmpl = _.template(content)(opts);
  return fsp.writeFile(path.resolve(projectPath, file), tmpl)
}

const cli = () => {
  return inquirer.prompt(QUESTIONS).then(async ({
    name,
    description,
    popup,
    contentScript,
    input,
    background,
    permissions
  }) => {
    const projectPath = path.resolve(process.cwd(), name);
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
  });
};

module.exports = cli;
