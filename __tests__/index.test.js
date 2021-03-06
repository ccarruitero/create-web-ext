const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const inquirer = require('inquirer');
const cli = require('../index');
const assert = require('yeoman-assert');

jest.mock('inquirer');

describe('main', () => {
  beforeEach(() => {
    this.promptAnswers = {
      name: 'myExtension',
      description: 'some description',
      action: true,
      actionType: 'popup',
      contentScript: false,
    };
    inquirer.prompt.mockResolvedValue(this.promptAnswers);
    this.extPath = `${this.promptAnswers.name}/extension`;

    this.basicFiles = [
      'README.md',
      'package.json',
      'extension/manifest.json',
      'extension/_locales/en/messages.json',
      'extension/icons/icon-64.png',
      'extension/icons/LICENSE'
    ];
  });

  afterEach(async () => {
    await fsp.rmdir(this.promptAnswers.name, { recursive: true });
  });

  it('creates files', async () => {
    await cli();

    const files = this.basicFiles.map(file => `${this.promptAnswers.name}/${file}`);
    assert.file(files);
  });

  it('override existing folder', async () => {
    await fsp.mkdir(this.promptAnswers.name);
    await cli();

    const files = this.basicFiles.map(file => `${this.promptAnswers.name}/${file}`);
    assert.file(files);
  });

  it('set name in locales', async () => {
    const args = { name: 'noPopup' };
    Object.assign(this.promptAnswers, args);

    await cli();
    const msgPath = path.resolve(this.promptAnswers.name, 'extension/_locales/en/messages.json');
    assert.fileContent(msgPath, 'noPopup');
  });

  it('allow no action', async () => {
    const args = { action: false };
    Object.assign(this.promptAnswers, args);

    await cli();
    assert.noFile(`${this.extPath}/popup/index.html`);
    assert.noFileContent(`${this.extPath}/manifest.json`, 'default_popup');
  });

  it('allow page_action', async () => {
    const args = { actionType: 'page' };
    Object.assign(this.promptAnswers, args);

    await cli();
    assert.file(`${this.extPath}/page/index.html`);
    assert.fileContent(`${this.extPath}/manifest.json`, 'default_popup');
    assert.fileContent(`${this.extPath}/manifest.json`, 'page_action');
  });

  it('allow sidebar_action', async () => {
    const args = { actionType: 'sidebar' };
    Object.assign(this.promptAnswers, args);

    await cli();
    assert.file(`${this.extPath}/sidebar/index.html`);
    assert.fileContent(`${this.extPath}/manifest.json`, 'default_panel');
    assert.fileContent(`${this.extPath}/manifest.json`, 'default_title');
    assert.fileContent(`${this.extPath}/manifest.json`, 'default_icon');
    assert.fileContent(`${this.extPath}/manifest.json`, 'sidebar_action');
  });

  it('can set background', async () => {
    const args = { background: true };
    Object.assign(this.promptAnswers, args);

    await cli();

    assert.file(`${this.extPath}/background/index.js`);
    assert.fileContent(`${this.extPath}/manifest.json`, 'background');
  });

  it('can set permissions in manifest', async () => {
    const args = { permissions: ['alarms', 'activeTab'] };
    Object.assign(this.promptAnswers, args);
    const manifest = `${this.extPath}/manifest.json`;

    await cli();
    assert.fileContent([
      [manifest, 'permissions'],
      [manifest, 'alarms'],
      [manifest, 'activeTab']
    ]);
  });

  it('can set content script', async () => {
    const args = { contentScript: true };
    Object.assign(this.promptAnswers, args);

    await cli();
    assert.fileContent(`${this.extPath}/manifest.json`, 'content_scripts');
    assert.fileContent(`${this.extPath}/manifest.json`, '<all_urls>');
    assert.file(`${this.extPath}/content_scripts/index.js`);
  });

  it('allow use an options page', async () => {
    const args = {
      options: true
    };
    Object.assign(this.promptAnswers, args);
    await cli();
    assert.fileContent(`${this.extPath}/manifest.json`, 'options_ui');
    assert.file(`${this.extPath}/options/index.js`);
    assert.file(`${this.extPath}/options/page.html`);
  });

  it('can set match pattern for content script', async () => {
    const args = {
      contentScript: true,
      contentScriptMatch: '*://*.mozilla.org/*'
    };
    Object.assign(this.promptAnswers, args);
    await cli();
    assert.fileContent(`${this.extPath}/manifest.json`, 'content_scripts');
    assert.fileContent(`${this.extPath}/manifest.json`, '*://*.mozilla.org/*');
    assert.file(`${this.extPath}/content_scripts/index.js`);
  });

  it('allow devtools', async () => {
    const args = {
      devtools: true
    };
    Object.assign(this.promptAnswers, args);
    await cli();
    assert.fileContent(`${this.extPath}/manifest.json`, 'devtools_page');
    assert.file([
      `${this.extPath}/devtools/page.html`,
      `${this.extPath}/devtools/devtools.js`,
      `${this.extPath}/devtools/panel/panel.html`
    ]);
    assert.fileContent(`${this.extPath}/devtools/devtools.js`, this.promptAnswers.name);
  });
});
