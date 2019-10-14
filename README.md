# create-web-ext

[![Build Status](https://travis-ci.org/ccarruitero/create-web-ext.svg?branch=master)](https://travis-ci.org/ccarruitero/create-web-ext)
[![Coverage Status](https://coveralls.io/repos/github/ccarruitero/create-web-ext/badge.svg?branch=master)](https://coveralls.io/github/ccarruitero/create-web-ext?branch=master)
[![Dependency Status](https://david-dm.org/ccarruitero/create-web-ext.svg)](https://david-dm.org/ccarruitero/create-web-ext)

Command line utility to build cross-browser [Web Extensions](mdn link)

## Install
```
npm i @ccarruitero/create-web-ext
```

## Usage
```
npx create-web-ext
```

### scripts
We use [`web-ext`](https://github.com/mozilla/web-ext) for build, run and start
scripts, so you can pass any `web-ext` accepted parameter to customize any
script. Take a look to [`web-ext` command reference](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/web-ext_command_reference)
