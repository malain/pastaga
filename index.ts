#!/usr/bin/env node
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//
//    Copyright (c) Alain Metge
//
import Pastaga from "./Pastaga";
import { Options } from "./Options";

const updateNotifier = require('update-notifier');
const pkg = require('../package.json');

updateNotifier({ pkg }).notify({ defer: false });

console.log(`Pastaga ${pkg.version}`);
console.log("Use Pastaga help for more info");

const options = new Options();
const main = new Pastaga();
main.run(options);