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
const { validThresholds } = require('./parse_args');

/**
 * Parse the output of `npm audit --json` and filter according to `threshold` and `ignoreDev`
 * @param {*} err Any errors encountered by the parent call to `exec`
 * @param {*} stdout The output from the command provided to `exec`
 * @param {*} threshold The severity threshold to filter on
 * @param {*} ignoreDev Boolean which determines if dev dependencies should be considered
 */
function parse_audit_results(err, stdout, threshold, ignoreDev, json_output = false) {
  let exitCode = 0;
  if (err === null) {
    console.warn('No vulnerabilities found.')
  } else {
    let data = JSON.parse(stdout);
    let advisories = Object.entries(data.advisories);

    let flaggedDepenencies = filter_advisories(advisories, ignoreDev, threshold);

    // If `-j` or `--json` passed, return the json data with the appropriate filters applied
    if (json_output) {
      var retVal = data;
      retVal.advisories = {};
      retVal.advisories = flaggedDepenencies;
      console.warn(JSON.stringify(retVal));
    } else { // If any vulnerabilities exceed the threshold and are not filtered, print the details and fail the build.
      if (flaggedDepenencies.length > 0) {
        console.warn('There are vulnerable dependencies which exceed the selected threshold and scope:');
        exitCode = 1;
      }
      flaggedDepenencies.forEach((advisory) => {                      // Print out dependencies which exceed the threshold
        let libraryName = advisory[1].module_name;
        let libraryVersion = advisory[1].findings[0].version;
        let advisoryOverview = 'https://www.npmjs.com/advisories/' + advisory[0];
        let severity = advisory[1].severity;
        console.warn(util.format("    %s(%s): %s (%s >= %s)", libraryName.padStart(30), libraryVersion.padEnd(20), advisoryOverview.padEnd(50), severity, validThresholds[threshold]));
      });
    }
  }
  return exitCode;
}

function filter_advisories(advisories, ignoreDev, threshold) {
  let filteredByThreshold = advisories.filter((advisory, idx) => {
    return (!(advisory[1].findings[0].dev && ignoreDev));
  });
  
  let filteredByDev = filteredByThreshold.filter((advisory, idx) => {
    return (validThresholds.indexOf(advisory[1].severity) >= threshold);
  });
  return filteredByDev;
}

module.exports = {
  parse_audit_results,
  filter_advisories: filter_advisories
};
