#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Main_1 = require("./Main");
const Options_1 = require("./Options");
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
updateNotifier({ pkg }).notify({ defer: false });
console.log(`Apotek ${pkg.version}`);
const options = new Options_1.Options();
const main = new Main_1.Main();
main.run(options);
//# sourceMappingURL=index.js.map