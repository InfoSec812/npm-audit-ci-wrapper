#!/usr/bin/env node

/**
 * Copyright [2018] [Joseph B. Phillips]
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { exec, spawn } = require('child_process');
const { parse_audit_results } = require('../lib/parser');
const { parse_args, validThresholds, check_npm_version } = require('../lib/parse_args');

const { threshold, ignoreDev, json_output, registry, whitelist } = parse_args(process.argv);

if (!check_npm_version()) {
  console.error('NPM Version does not support npm audit. Install a version >= 6.0.0');
  process.exit(1);
}

if (threshold === -1) {
  console.error(`Invalid threshold provided. Threshold must be one of the following: ${validThresholds.join(', ')}`);
  process.exit(1);
}

// Build the npm audit command
var command = 'npm';
var command_args = ['audit', '--json'];
if ( registry !== null ) {
  command_args.push('--registry=' + registry);
}

var stdout = '';
var stderr = '';

const audit_proc = spawn(command, command_args, { stdio: ['ignore', 'pipe', 'pipe'], detached: false });

audit_proc.stdout.on('data', (data) => {
  var holder = stdout;
  stdout = holder.concat(data);
});

audit_proc.stderr.on('data', (data) => {
  var holder = stderr;
  stderr = holder.concat(data);
});

audit_proc.on('close', (exit_code) => {
  const { exitCode, cliOutput } = parse_audit_results(stderr, stdout, threshold, ignoreDev, json_output, whitelist);
  console.log(cliOutput);
  process.exit(exitCode);
});

//
// Execute and capture the output for processing
// exec(command, {maxBuffer: 5000 * 1024}, (err, stdout, stderr) => {
//   const { exitCode, cli_output } = parse_audit_results(err, stdout, threshold, ignoreDev, json_output, whitelist);
//   console.log(cli_output);
//   process.exit(exitCode);
// });

