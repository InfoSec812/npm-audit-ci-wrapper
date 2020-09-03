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

const util = require('util');
const Table = require("cli-table")
const { validThresholds } = require('./parse_args');

const NPM_REGISTRY_COMMUNICATION_ERROR = 12;
const VULNERABLE_DEPENDENCIES_FOUND_ERROR = 1;
const NO_VULNERABILITIES_FOUND = 0;
/**
 * Parse the output of `npm audit --json` and filter according to `threshold` and `ignoreDev`
 * @param {string} err Any errors encountered by the parent call to `exec`
 * @param {string} data The output from `npm audit --json` parsed as JSON
 * @param {number} threshold The severity threshold to filter on
 * @param {boolean} ignoreDev Boolean which determines if dev dependencies should be considered
 * @returns {object} A tuple of the exitCode and cliOutput
 */
function parse_audit_results(err, data, threshold, ignoreDev, jsonOutput = false, whitelist = []) {
  let exitCode = NO_VULNERABILITIES_FOUND;
  let cliOutput = "";
  if (data.hasOwnProperty('error')) {
    // When there is an error communicating with the NPM registry audit service, short-circuit and tell the user the error.
    cliOutput = `${data['error']['code']}: ${data['error']['summary']}`;
    exitCode = NPM_REGISTRY_COMMUNICATION_ERROR;
    return { exitCode, cliOutput };
  }
  if (err === null) {
    if (jsonOutput) {
      data['advisories'] = {};
      data['actions'] = [];
      data['muted'] = [];
      cliOutput = JSON.stringify(data, null, 2);
      cliOutput += '\n';
    } else {
      cliOutput += 'No vulnerabilities found.\n';
    }
  } else {
    const advisories = Object.entries(data.advisories);

    let moduleInfo = {};
    if (data.hasOwnProperty('actions')) {
      moduleInfo = process_actions(data.actions);
    }

    const flaggedDependencies = filter_advisories(advisories, ignoreDev, threshold, moduleInfo, whitelist);

    // If `-j` or `--json` passed, return the json data with the appropriate filters applied
    if (jsonOutput) {
      var retVal = JSON.parse(JSON.stringify(data));
      retVal.advisories = {};
      retVal.advisories = flaggedDependencies;
      cliOutput = JSON.stringify(retVal, null, 2);
      cliOutput += '\n';
    } else if (flaggedDependencies.length > 0) {
      // If any vulnerabilities exceed the threshold and are not filtered, print the details and fail the build.

      cliOutput += ignoreDev ? (
        "The following production vulnerabilities "
      ) : (
        "The following vulnerabilities "
      );

      cliOutput += "are ";
      cliOutput += validThresholds[threshold];
      cliOutput += " severity or higher:\n"

      exitCode = VULNERABLE_DEPENDENCIES_FOUND_ERROR;

      const flagTable = new Table({
        head: ["module", "severity", "overview"]
      });

      flaggedDependencies.forEach((advisory) => {                      // Print out dependencies which exceed the threshold
        const libraryName = advisory[1].module_name;
        const libraryVersion = advisory[1].findings[0].version;
        const advisoryOverview = `https://www.npmjs.com/advisories/${advisory[0]}`;
        const severity = advisory[1].severity;
        flagTable.push([
          `${libraryName}@${libraryVersion}`,
          severity,
          advisoryOverview
        ])
      });

      cliOutput += flagTable.toString();
      cliOutput += "\n";
    }
  }
  return { exitCode, cliOutput };
}

/**
 * Given an array of advisory objects, filter the list based on threshold and allowance of dev dependencies
 * @param {Object[]} advisories An array of Advisory objects returned from NPM Audit
 * @param {boolean} ignoreDev Should dev dependencies be ignored?
 * @param {number} threshold The severity threshold above which a vulnerability will not be ignored
 * @param {Object} moduleInfo A Key/Value Map of module name to dev/prod status
 * @param {string[]} whitelist A (possibly empty) list of modules/versions which should be ignored
 * @returns An array (possibly empty) of advisory objects
 */
function filter_advisories(advisories, ignoreDev, threshold, moduleInfo = {}, whitelist = []) {
  const filteredByDev = advisories.filter((advisory, idx) => {
    if (advisory[1].findings[0].hasOwnProperty("dev")) {
      return (!(advisory[1].findings[0].dev && ignoreDev));
    } else {
      let filteredFindings = advisory[1].findings.filter(finding => {
        let filteredPaths = finding.paths.filter(path => {
          let parentModule = path.split(">")[0];
          return !moduleInfo[parentModule]
        });
        return filteredPaths.length > 0;
      });
      return filteredFindings > 0;
    }
    // const isDev = advisory[1].findings[0].dev || moduleInfo[advisory[1].module_name];
    return (!(isDev && ignoreDev));   // Filter out Dev dependencies when indicated
  });

  const filteredByThreshold = filteredByDev.filter((advisory, idx) => {
    return (validThresholds.indexOf(advisory[1].severity) >= threshold);  // Filter out lower severities when indicated
  });

  return filteredByThreshold.filter((advisory, idx) => {
    const moduleName = advisory[1].module_name;
    const moduleVersion = advisory[1].findings[0].version;
    for (let i = 0; i < whitelist.length; i++) {
      if (whitelist[i].startsWith(`${moduleName}:`) || (whitelist[i] === moduleName)) {
        const version = whitelist[i].split(':')[1];   // Module name matches, check the version
        if (version === undefined || version === '*') {
          return false;       // Version was not specified or is a wildcard, so filter out this item
        } else if (version === moduleVersion) {
          return false;       // Version matches specified version, so filter out this item
        }
      }
    }
    return true;
  });
}

/**
 * Parse the "Actions" section of the NPM Audit report and determine which modules are dev dependencies and which are not
 * @param {Object[]} actions An array/list of Action objects from NPM Audit
 */
function process_actions(actions) {
  let moduleInfo = {};
  actions.forEach(action => {
    const module_name = action.module;
    const is_dev_dependency = action.resolves.filter(path => path.dev).length > 0;
    moduleInfo[module_name] = is_dev_dependency;
  });
  return moduleInfo;
}

module.exports = {
  parse_audit_results,
  filter_advisories: filter_advisories,
  process_actions
};
