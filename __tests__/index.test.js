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
      popup: true,
      contentScript: false,
    };
    inquirer.prompt.mockResolvedValue(this.promptAnswers);
    this.extPath = `${this.promptAnswers.name}/extension`;

    this.basicFiles = [
      'package.json',
      'extension/manifest.json',
      'extension/_locales/en/messages.json'
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

    await cli()
    const msgPath = path.resolve(this.promptAnswers.name, 'extension/_locales/en/messages.json');
    assert.fileContent(msgPath, 'noPopup');
  });

  it('allow no popup', async () => {
    const args = { popup: false };
    Object.assign(this.promptAnswers, args);

    await cli()
    assert.noFile(`${this.extPath}/popup/index.html`);
    assert.noFileContent(`${this.extPath}/manifest.json`, 'default_popup');
  });

  it('can set background', async () => {
    const args = { background: true };
    Object.assign(this.promptAnswers, args);

    await cli();

    assert.file(`${this.extPath}/background/index.js`);
    assert.fileContent(`${this.extPath}/manifest.json`, 'background');
  });

  // it('can set permissions in manifest', done => {
  //   run({
  //     permissions: ['alarms', 'activeTab']
  //   }, () => {
  //     assert.fileContent([
  //         ['extension/manifest.json', 'permissions'],
  //         ['extension/manifest.json', 'alarms'],
  //         ['extension/manifest.json', 'activeTab']
  //     ]);
  //     done();
  //   });
  // });

  it('can set content script', async () => {
    const args = { contentScript: true };
    Object.assign(this.promptAnswers, args);

    await cli();
    assert.fileContent(`${this.extPath}/manifest.json`, 'content_scripts');
    assert.fileContent(`${this.extPath}/manifest.json`, '<all_urls>');
    assert.file(`${this.extPath}/content_scripts/index.js`);
  });

  // it('can set match pattern for content script', done => {
  //   run({
  //     contentScript: true,
  //     contentScriptMatch: '*://*.mozilla.org/*'
  //   }, () => {
  //     assert.fileContent('extension/manifest.json', 'content_scripts');
  //     assert.fileContent('extension/manifest.json', '*://*.mozilla.org/*');
  //     assert.file('extension/content_scripts/index.js');
  //     done();
  //   });
  // });
});
