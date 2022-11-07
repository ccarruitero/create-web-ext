# create-web-ext

[![Build Status](https://github.com/ccarruitero/create-web-ext/actions/workflows/master.yml/badge.svg?branch=master)](https://github.com/ccarruitero/create-web-ext/actions?query=branch:master)
[![Coverage Status](https://coveralls.io/repos/github/ccarruitero/create-web-ext/badge.svg?branch=master)](https://coveralls.io/github/ccarruitero/create-web-ext?branch=master)
[![Dependency Status](https://david-dm.org/ccarruitero/create-web-ext.svg)](https://david-dm.org/ccarruitero/create-web-ext)

Command line utility to build cross-browser [Web Extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

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
web extension, so you can pass any `web-ext` accepted parameter to customize any
script. Take a look to [`web-ext` command reference](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/web-ext_command_reference)
