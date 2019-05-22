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

const argv = require('argv');
const util = require('util');

const exec = util.promisify(require('child_process').exec);


/** The list of valid threshold values */
const validThresholds = [ 'low', 'moderate', 'high', 'critical' ];

const IGNORE_DEV_DEP = 'ignore-dev-dependencies';
/**
 * CLI Arguments
 */
const options = [
  {
    name: 'threshold',
    short: 't',
    type: 'string',
    description: 'The threshold at which the audit should fail the build (low, moderate, high, critical)',
    example: "'npm-audit-ci-wrapper --threshold=high' or 'npm-audit-ci-wrapper -t high'"
  },
  {
    name: IGNORE_DEV_DEP,
    short: 'p',
    type: 'boolean',
    description: 'Tells the tool to ignore dev dependencies and only fail the build on runtime dependencies which exceed the threshold',
    example: "'npm-audit-ci-wrapper -p' or 'npm-audit-ci-wrapper --ignore-dev-dependencies'"
  },
  {
    name: 'json',
    short: 'j',
    type: 'boolean',
    description: 'Do not fail, just output the filtered JSON data which matches the specified threshold/scope (useful in combination with `npm-audit-html`)',
    example: "'npm-audit-ci-wrapper --threshold=high -p --json' or 'npm-audit-ci-wrapper -j'"
  },
  {
    name: 'registry',
    short: 'r',
    type: 'string',
    description: 'Set an alternate NPM registry server. Useful when your default npm regsitry (i.e. npm config set registry) does not support the npm audit command.',
    example: "'npm-audit-ci-wrapper --registry=https://registry.npmjs.org/'"
  },
  {
    name: 'whitelist',
    short: 'w',
    type: 'list,string',
    description: 'Whitelist the given dependency at the specified version or all versions (Can be specified multiple times).',
    example: "'npm-audit-ci-wrapper -w https-proxy-agent' or 'npm-audit-ci-wrapper -w https-proxy-agent:*' or 'npm-audit-ci-wrapper --whitelist=https-proxy-agent:1.0.0'"
  }
];

/**
 * Check the installed version of NPM to see if it is new enough to support NPM Audit
 * @returns {boolean} True if NPM version >= 6.x, otherwise False
 */
async function check_npm_version() {
  const { stdout } = await exec('npm --version');
  const [major] = stdout.trim().split(".")[0];
  let majorInt = parseInt(major);
  return (majorInt >= 6);
}

/**
 * Parse CLI arguments and extract configuration for application
 * @param {string[]} cli_args
 */
function parse_args(cli_args) {
  let args = argv.option( options ).run(cli_args);

  // Check to see if this script should ignore dev dependencies
  let ignoreDev = (args.options.hasOwnProperty(IGNORE_DEV_DEP) && args.options[IGNORE_DEV_DEP]);

  // Define which threshold this script should cause a non-zero exit status
  let threshold = validThresholds.indexOf('critical');

  if (args.options.hasOwnProperty('threshold')) {
    threshold = validThresholds.indexOf(args.options.threshold.toLocaleLowerCase()); // Set the threshold
  }

  let json_output = (args.options.hasOwnProperty('json') && args.options.json);
  let registry = null;
  if (args.options.hasOwnProperty('registry')) {
    registry = args.options.registry;
  }

  let whitelist = [];
  if (args.options.hasOwnProperty('whitelist') && Array.isArray(args.options.whitelist) ) {
    whitelist = args.options.whitelist;
  }

  return { threshold, ignoreDev, json_output, registry, whitelist }
}

module.exports = {
  'parse_args': parse_args,
  'validThresholds': validThresholds,
  'check_npm_version': check_npm_version
};
