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

/**
 * Parse the output of `npm audit --json` and filter according to `threshold` and `ignoreDev`
 * @param {string} err Any errors encountered by the parent call to `exec`
 * @param {string} stdout The output from the command provided to `exec`
 * @param {number} threshold The severity threshold to filter on
 * @param {boolean} ignoreDev Boolean which determines if dev dependencies should be considered
 */
function parse_audit_results(err, stdout, threshold, ignoreDev, json_output = false, whitelist = []) {
  let exitCode = 0;
  let cli_output = "";
  const data = JSON.parse(stdout);
  if (err === null) {
    if (json_output) {
      data['advisories'] = {};
      data['actions'] = [];
      data['muted'] = [];
      cli_output = JSON.stringify(data, null, 2) + "\n";
    } else {
      cli_output += 'No vulnerabilities found.\n';
    }
  } else {
    let advisories = Object.entries(data.advisories);

    let flaggedDepenencies = filter_advisories(advisories, ignoreDev, threshold, whitelist);

    // If `-j` or `--json` passed, return the json data with the appropriate filters applied
    if (json_output) {
      var retVal = JSON.parse(JSON.stringify(data));
      retVal.advisories = {};
      retVal.advisories = flaggedDepenencies;
      cli_output = JSON.stringify(retVal, null, 2) + '\n';
    } else if (flaggedDepenencies.length > 0) {
      // If any vulnerabilities exceed the threshold and are not filtered, print the details and fail the build.

      cli_output += ignoreDev ? (
        "The following production vulnerabilities "
      ) : (
        "The following vulnerabilities "
      )

      cli_output += "are " + validThresholds[threshold] + " severity or higher:\n"

      exitCode = 1;

      const flagTable = new Table({
        head: ["module", "severity", "overview"]
      })

      flaggedDepenencies.forEach((advisory) => {                      // Print out dependencies which exceed the threshold
        let libraryName = advisory[1].module_name;
        let libraryVersion = advisory[1].findings[0].version;
        let advisoryOverview = 'https://www.npmjs.com/advisories/' + advisory[0];
        let severity = advisory[1].severity;
        flagTable.push([
          libraryName + "@" + libraryVersion,
          severity,
          advisoryOverview
        ])
      });

      cli_output += flagTable.toString() + "\n"
    }
  }

  return { exitCode, cli_output };
}

/**
 * Given an array of advisory objects, filter the list based on threshold and allowance of dev dependencies
 * @param {Object[]} advisories An array of Advisory objects returned from NPM Audit
 * @param {boolean} ignoreDev Should dev dependencies be ignored?
 * @param {number} threshold The severity threshold above which a vulnerability will not be ignored
 * @param {string[]} whitelist A (possibly empty) list of modules/versions which should be ignored
 * @returns An array (posssibly empty) of advisory objects
 */
function filter_advisories(advisories, ignoreDev, threshold, whitelist = []) {
  const filteredByThreshold = advisories.filter((advisory, idx) => {
    return (!(advisory[1].findings[0].dev && ignoreDev));   // Filter out Dev dependencies when indicated
  });

  const filteredByDev = filteredByThreshold.filter((advisory, idx) => {
    return (validThresholds.indexOf(advisory[1].severity) >= threshold);  // Filter out lower severities when indicated
  });

  return filteredByDev.filter((advisory, idx) => {
    const module_name = advisory[1].module_name;
    const module_version = advisory[1].findings[0].version;
    for (let i = 0; i < whitelist.length; i++) {
      if (whitelist[i].startsWith(module_name+':') || (whitelist[i] === module_name)) {
        const version = whitelist[i].split(':')[1];   // Module name matches, check the version
        if (version === undefined || version === '*') {
          return false;       // Version was not specified or is a wildcard, so filter out this item
        } else if (version === module_version) {
          return false;       // Version matches specified version, so filter out this item
        }
      }
    }
    return true;
  });
}

module.exports = {
  parse_audit_results,
  filter_advisories: filter_advisories
};
