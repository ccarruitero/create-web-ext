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
    this.promptAnswers =  Object.assign(this.promptAnswers, args);

    await cli()
    const msgPath = path.resolve(this.promptAnswers.name, 'extension/_locales/en/messages.json');
    assert.fileContent(msgPath, 'noPopup');
  });

  // it('allow no popup', done => {
  //   run({
  //     popup: false
  //   }, () => {
  //     assert.noFile('extension/popup/index.html');
  //     assert.noFileContent('extension/manifest.json', 'default_popup');
  //     done();
  //   });
  // });

  // it('can set background', done => {
  //   run({
  //     background: true
  //   }, () => {
  //     assert.file('extension/background/index.js');
  //     assert.fileContent('extension/manifest.json', 'background');
  //     done();
  //   });
  // });

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

  // it('can set content script', done => {
  //   run({
  //     contentScript: true
  //   }, () => {
  //     assert.fileContent('extension/manifest.json', 'content_scripts');
  //     assert.fileContent('extension/manifest.json', '<all_urls>');
  //     assert.file('extension/content_scripts/index.js');
  //     done();
  //   });
  // });

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
