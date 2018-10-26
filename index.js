#!/usr/bin/env node
const argv = require( 'argv' );
const util = require('util');
const { exec } = require('child_process');

const validThresholds = [ 'low', 'moderate', 'high', 'critical' ];

const options = [
  {
    name: 'threshold',
    short: 't',
    type: 'string',
    description: 'The threshold at which the audit should fail the build (low, moderate, high, critical)',
    example: "'npm-audit-ci-wrapper --threshold=high' or 'npm-audit-ci-wrapper -t high'"
  },
  {
    name: 'ignore-dev-dependencies',
    short: 'p',
    type: 'boolean',
    description: 'Tells the tool to ignore dev dependencies and only fail the build on runtime dependencies which exceed the threshold',
    example: "'npm-audit-ci-wrapper -p' or 'npm-audit-ci-wrapper --ignore-dev-dependencies'"
  }
];

let args = argv.option( options ).run();

// Check to see if this script should ignore dev dependencies
let ignoreDev = false;

if (args.options.hasOwnProperty('ignore-dev-dependencies')) { // IF the argument was passed
  if (args.options['ignore-dev-dependencies']) {              // IF the argument was set to TRUE
    ignoreDev = true;
  }
}

// Define which threshold this script should cause a non-zero exit status
let threshold = 3;
let formattedThreshold = validThresholds.indexOf('critical');

if (args.options.hasOwnProperty('threshold')) {               // IF the argument was passed
  formattedThreshold = args.options.threshold.toLocaleLowerCase();
  if (validThresholds.indexOf(formattedThreshold) > -1) {   // IF the argument is a valid option
    threshold = validThresholds.indexOf(formattedThreshold);         // Set the threshold
  }
}

// Execute `npm audit --json` and capture the output for processing
exec('npm audit --json', (err, stdout, stderr) => {
  if (err === null) {
    console.log('An unexpected error has occurred')
    console.log(stderr);
  } else {
    let data = JSON.parse(stdout);
    let advisories = Object.entries(data.advisories);

    let flaggedDepenencies = advisories.filter((advisory, idx) => { // Filter dev dependecies if that option is selected
      return (!(advisory[1].findings[0].dev && ignoreDev));
    }).filter((advisory, idx) => {                                  // Filter advisories which are below the selected threshold
      return (validThresholds.indexOf(advisory[1].severity) >= threshold);
    });

    let exitCode = 0;
    if (flaggedDepenencies.length > 0) {
      console.log('There are vulnerable dependencies which exceed the selected threshold and scope:')
      exitCode = 1;
    }
    
    flaggedDepenencies.forEach((advisory) => {                      // Print out dependencies which exceed the threshold
      let libraryName = advisory[1].module_name;
      let libraryVersion = advisory[1].findings[0].version;
      let advisoryOverview = 'https://www.npmjs.com/advisories/' + advisory[0];
      let severity = advisory[1].severity;
      console.log(util.format("    %s(%s): %s (%s >= %s)", libraryName.padStart(30), libraryVersion.padEnd(20), advisoryOverview.padEnd(50), severity, validThresholds[threshold]));
    });
    
    process.exit(exitCode);
  }
});