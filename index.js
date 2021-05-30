'use strict';

const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const { promisify } = require('util');
const chalk = require('chalk');
const inquirer = require('inquirer');
const _ = require('lodash');
const figlet = require('figlet');
const { questions } = require('./manifestOptions');

const copyTpl = async (file, projectPath, opts) => {
  const filePath = path.resolve(__dirname, 'templates', file);
  const content = await fsp.readFile(filePath);
  const tmpl = _.template(content)(opts);
  return fsp.writeFile(path.resolve(projectPath, file), tmpl);
};

const extendJSON = async (filepath, content) => {
  await fsp.readFile(filepath, 'utf-8').then(async (data) => {
    const originalContent = JSON.parse(data);
    const newContent = Object.assign({}, originalContent, content);
    const jsonStr = JSON.stringify(newContent, null, 2) + '\n';
    await fsp.writeFile(filepath, jsonStr);
  });
};

const add = async (extPath, name, file, manifestArgs) => {
  const src = path.resolve(extPath, name);
  if (!fs.existsSync(src)) {
    await fsp.mkdir(src);
  }
  await fsp.writeFile(path.resolve(extPath, `${name}/${file}`), '');
  await extendJSON(path.resolve(extPath, 'manifest.json'), manifestArgs);
};

const copyFolder = async (src, dest) => {
  const srcPath = path.resolve(__dirname, 'templates', src);
  if (!fs.existsSync(dest)) {
    await fsp.mkdir(dest);
  }
  await fsp.readdir(srcPath).then(dir => {
    dir.forEach(async (element) => {
      const stat = await fsp.lstat(path.resolve(srcPath, element));
      if (stat.isFile()) {
        await fsp.copyFile(path.resolve(srcPath, element), path.resolve(dest, element));
      } else {
        copyFolder(path.resolve(srcPath, element), path.resolve(dest, element));
      }
    });
  });
};

const composeAction = (actionType, actionContent) => ({
  [`${actionType}_action`]: actionContent
});

const getActionManifest = (actionType, name) => {
  switch(actionType) {
  case 'sidebar':
    return composeAction(actionType, {
      default_panel: `${actionType}/index.html`,
      default_title: name,
      default_icon: 'icons/icon-64.png'
    });
  default:
    return composeAction(actionType, {
      browser_style: true,
      default_popup: `${actionType}/index.html`
    });
  }
};

const buildExt = async ({
  name,
  description,
  action,
  actionType,
  contentScript,
  contentScriptMatch,
  background,
  devtools,
  options,
  permissions
}) => {
  const projectPath = path.resolve(process.cwd(), name);
  await fsp.rm(projectPath, { recursive: true, force: true });
  await fsp.mkdir(projectPath);
  await copyTpl('package.json', projectPath, { name });
  await copyTpl('README.md', projectPath, { name, description });

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

  await copyFolder('icons', `${extPath}/icons`);

  if (action && actionType) {
    await add(extPath, actionType, 'index.html', getActionManifest(actionType, name));
  }
  if (background) {
    await add(extPath, 'background', 'index.js', {
      background: {
        scripts: ['background/index.js']
      }
    });
  }
  if (contentScript) {
    const match = contentScriptMatch || '<all_urls>';
    await add(extPath, 'content_scripts', 'index.js', {
      content_scripts: [
        {
          matches: [match],
          js: ['content_scripts/index.js']
        }
      ]
    });
  }
  if (devtools) {
    await copyFolder('devtools', `${extPath}/devtools`);
    await add(extPath, 'devtools/panel', 'panel.html', {
      devtools_page: 'devtools/page.html'
    });
    await copyTpl('devtools/devtools.js', extPath, { name });
  }
  if (options) {
    await copyFolder('options', `${extPath}/options`);
    await add(extPath, 'options', 'index.js', {
      options_ui: {
        page: 'options/page.html',
        browser_style: true,
        chrome_style: true
      }
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
};

const cli = async () => {
  const asyncFiglet = promisify(figlet);
  const header = await asyncFiglet('create-web-ext', 'Doom');
  console.log(header);
  return inquirer.prompt(questions).then(answers => buildExt(answers));
};

module.exports = cli;
module.exports.questions = questions;
module.exports.buildExt = buildExt;
