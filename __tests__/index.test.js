const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const withTmpDir = require('./helpers/tmp-dir');
const runner = require('./helpers/cmd-runner');
const execDirPath = path.join(__dirname, '..', 'bin');

jest.mock('inquirer');

const assertFiles = (files, target) => {
  files.forEach(async (file) => {
    const stat = await fs.stat(path.resolve(target, file));
    expect(stat.isFile()).toBeTruthy();
  });
};

describe('main', () => {
  beforeEach(() => {
    inquirer.prompt.mockClear();
    const promptAnswers = {
      name: 'myExtension',
      description: 'some description',
      popup: true,
      contentScript: false,
    };
    inquirer.prompt.mockResolvedValue(promptAnswers);
  });

  it('creates files', () => withTmpDir(
    async (tmpPath) => {
      const target = path.join(tmpPath, 'target');
      const cmd = runner([`${execDirPath}/create-web-ext`, `${target}`]);

      assertFiles([
        'package.json',
        'extension/manifest.json',
        'extension/_locales/en/messages.json'
      ], target);
    }
  ));

  // it('set name in locales', done => {
  //   run({
  //     name: 'noPopup'
  //   }, () => {
  //     assert.fileContent('extension/_locales/en/messages.json', 'noPopup');
  //     done();
  //   });
  // });

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
