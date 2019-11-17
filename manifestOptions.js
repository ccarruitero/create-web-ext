const availablePermissions = [
  'activeTab',
  'alarms',
  'bookmarks',
  'browsingData',
  'contextMenus',
  'contextualIdentities',
  'cookies',
  'downloads',
  'downloads.open',
  'history',
  'identity',
  'idle',
  'management',
  'nativeMessaging',
  'notifications',
  'sessions',
  'storage',
  'tabs',
  'topSites',
  'webNavigation',
  'webRequest',
  'webRequestBlocking'
];

const actionChoices = [
  'browser',
  'page',
  'sidebar'
];

function getChoices(list) {
  return list.map(item => {
    return {
      value: item,
      name: item,
      checked: false
    };
  });
}

const questions = [{
  name: 'name',
  message: 'How would you like to name your web extension',
},
{
  name: 'description',
  message: 'Give a description for your web extension',
},
{
  name: 'action',
  message: 'Would you like to use an action?',
  type: 'confirm',
  default: true,
},
{
  name: 'actionType',
  message: 'What kind of action would you like to use?',
  type: 'list',
  choices: actionChoices,
  default: actionChoices[0],
  when: response => {
    return response.action;
  },
},
{
  name: 'contentScript',
  message: 'Would you like to use a content script?',
  type: 'confirm',
  default: false,
},
{
  type: 'input',
  name: 'contentScriptMatch',
  message: 'Define a match pattern for your content script?',
  when: response => {
    return response.contentScript;
  },
},
{
  name: 'background',
  message: 'Would you like to use a background script?',
  type: 'confirm',
  default: false,
},
{
  name: 'devtools',
  message: 'Would you like to use a devtool page?',
  type: 'confirm',
  default: false,
},
{
  name: 'options',
  message: 'Would you like to use an options page?',
  type: 'confirm',
  default: false
},
{
  type: 'checkbox',
  name: 'permissions',
  message: 'Would you like to set permissions?',
  choices: getChoices(availablePermissions),
}];


module.exports = {
  questions
};
