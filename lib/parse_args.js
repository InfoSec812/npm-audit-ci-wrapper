const argv = require( 'argv' );

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
  },
  {
    name: 'json',
    short: 'j',
    type: 'boolean',
    description: 'Do not fail, just output the filtered JSON data which matches the specified threshold/scope',
    example: "'npm-audit-ci-wrapper --threshold=high -p --json' or 'npm-audit-ci-wrapper -j'"
  },
  {
    name: 'registry',
    short: 'r',
    type: 'string',
    description: 'Submit the dependency report to and get the list of vulnerabilities from this npm registry. Useful when your default npm regsitry (i.e. npm config set registry) does not support the npm audit command.',
    example: "'npm-audit-ci-wrapper --registry=https://registry.npmjs.org/'"
  }
];

function parse_args(cli_args = process.argv) {
  let args = argv.option( options ).run(cli_args);

  // Check to see if this script should ignore dev dependencies
  let ignoreDev = (args.options.hasOwnProperty('ignore-dev-dependencies') && args.options['ignore-dev-dependencies']);

  // Define which threshold this script should cause a non-zero exit status
  let threshold = validThresholds.indexOf('critical');

  if (
        args.options.hasOwnProperty('threshold') && 
        validThresholds.indexOf(args.options.threshold.toLocaleLowerCase()) > -1
      ) {
    threshold = validThresholds.indexOf(args.options.threshold.toLocaleLowerCase()); // Set the threshold
  }

  let json_output = (args.options.hasOwnProperty('json') && args.options.json)

  return {threshold, ignoreDev, json_output}
}

module.exports = {
  'parse_args': parse_args,
  'validThresholds': validThresholds
}