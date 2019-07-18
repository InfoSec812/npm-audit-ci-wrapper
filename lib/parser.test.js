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

const { readFileSync } = require('fs');
const { parse_audit_results, filter_advisories } = require('./parser');

const LOW_THRESHOLD = 0;
const MOD_THRESHOLD = 1;
const HIGH_THRESHOLD = 2;
const CRIT_THRESHOLD = 3;

/*
 * When err is NULL, there are NO DEPENDENCIES, therefore expect a 0 exit code.
 */
test('Validate when err is NULL', () => {
  const test_data = readFileSync('test_data/zero_vulnerabilities.json', 'utf8');
  let { exitCode, cli_output } = parse_audit_results(null, test_data, LOW_THRESHOLD, false);
  expect(cli_output).toBe('No vulnerabilities found.\n');
  expect(exitCode).toBe(0);
});

/*
 * When err is NULL, and JSON is requested, expect default JSON output as well
 */
test('Validate when err is NULL and JSON output is desired', () => {
  const test_data = readFileSync('test_data/zero_vulnerabilities.json', 'utf8');
  let { exitCode, cli_output } = parse_audit_results(null, test_data, LOW_THRESHOLD, false, true);
  const expectedOutput = {
    "actions": [],
    "advisories": {},
    "muted": [],
    "metadata": {
      "vulnerabilities": {
        "info": 0,
        "low": 0,
        "moderate": 0,
        "high": 0,
        "critical": 0
      },
      "dependencies": 879278,
      "devDependencies": 387,
      "optionalDependencies": 9709,
      "totalDependencies": 889374
    },
    "runId": "3fdcb3d6-c9f3-4e6f-9e4f-c77d1e0dac86"
  }
  const actualObject = JSON.parse(cli_output);
  expect(actualObject.actions).toEqual([]);
  expect(actualObject.advisories).toEqual({});
  expect(actualObject.muted).toEqual([]);
  expect(actualObject.metadata.vulnerabilities.info).toEqual(0);
  expect(actualObject.metadata.vulnerabilities.low).toEqual(0);
  expect(actualObject.metadata.vulnerabilities.moderate).toEqual(0);
  expect(actualObject.metadata.vulnerabilities.high).toEqual(0);
  expect(actualObject.metadata.vulnerabilities.critical).toEqual(0);
  expect(actualObject.metadata.dependencies).toBeDefined();
  expect(actualObject.metadata.devDependencies).toBeDefined();
  expect(actualObject.metadata.optionalDependencies).toBeDefined();
  expect(actualObject.metadata.totalDependencies).toBeDefined();
  expect(actualObject.runId).toBeDefined();
  expect(exitCode).toBe(0);
});

/*
 * When there are 0 vulnerable dependencies, expect a 0 exit code
 */
test('Validate run with 0 vulnerabilities', () => {
  const test_data = readFileSync('test_data/zero_vulnerabilities.json', 'utf8');
  let { exitCode, cli_output } = parse_audit_results("", test_data, LOW_THRESHOLD, false);
  expect(cli_output).toBe('');
  expect(exitCode).toBe(0);
});

/*
 * If 7 vulnerabilities exceed the threshold and dev dependencies are not
 * ignore, expect a non-zero exit code and correct messaging
 */
test('Validate run with 7 vulnerabilities', () => {
  const test_data = readFileSync('test_data/vue_js_app.json', 'utf8');
  let { exitCode, cli_output } = parse_audit_results("", test_data, LOW_THRESHOLD, false);
  expect(cli_output).not.toContain('{');
  expect(cli_output).toContain("growl");
  expect(cli_output).toContain('https://www.npmjs.com/advisories/');
  expect(cli_output).toContain('The following vulnerabilities are low severity or higher:');
  expect(exitCode).toBe(1);
});

/*
 * If 7 vulnerabilities exceed the high threshold and dev dependencies are
 * ignored, expect a non-zero exit code and correct messaging.
 */
test('Validate run with 7 vulnerabilities, a high severity cutoff, and production-only', () => {
  const test_data = readFileSync('test_data/vue_js_app.json', 'utf8');
  let { exitCode, cli_output } = parse_audit_results("", test_data, HIGH_THRESHOLD, true);
  expect(cli_output).not.toContain('{');
  expect(cli_output).toContain("https-proxy-agent@1.0.0");
  expect(cli_output).toContain('https://www.npmjs.com/advisories/');
  expect(cli_output).toContain('The following production vulnerabilities are high severity or higher:');
  expect(exitCode).toBe(1);
});

/*
 * Regardless of threshold, dev ignore, etc...; whenever we do JSON output the exit code is always 0
 */
test('Validate run with 7 vulnerabilities and JSON output', () => {
  const test_data = readFileSync('test_data/vue_js_app.json', 'utf8');
  let { exitCode, cli_output } = parse_audit_results("", test_data, LOW_THRESHOLD, true, true);
  const actualObject = JSON.parse(cli_output);
  console.log(cli_output+"\n\n");
  expect(cli_output).toContain('"https-proxy-agent"');
  expect(cli_output).toContain('"version"');
  expect(cli_output).toContain('"module_name"');
  expect(cli_output.substring((cli_output.length - 1), cli_output.length)).toBe('\n');
  expect(actualObject.metadata.dependencies).toBeDefined();
  expect(actualObject.metadata.devDependencies).toBeDefined();
  expect(actualObject.metadata.optionalDependencies).toBeDefined();
  expect(actualObject.metadata.totalDependencies).toBeDefined();
  expect(actualObject.runId).toBeDefined();
  expect(exitCode).toBe(0);
});

/*
 * Test the advisories filter and expect ALL advisories to make it through
 */
test('Validate advisories filtering on LOW threshold and not ignoring Dev dependencies', () => {
  const test_data = readFileSync('test_data/vue_js_app.json', 'utf8');
  const data = JSON.parse(test_data);
  const results = filter_advisories(Object.entries(data.advisories), false, LOW_THRESHOLD);
  expect(results.length).toBe(7);
  expect(results[0][1].module_name).toBe('growl');
  expect(results[1][1].module_name).toBe('debug');
  expect(results[2][1].module_name).toBe('https-proxy-agent');
  expect(results[3][1].module_name).toBe('http-proxy-agent');
  expect(results[4][1].module_name).toBe('merge');
  expect(results[5][1].module_name).toBe('webpack-dev-server');
  expect(results[6][1].module_name).toBe('handlebars');

  expect(results[0][1].severity).toBe('critical');
  expect(results[1][1].severity).toBe('low');
  expect(results[2][1].severity).toBe('high');
  expect(results[3][1].severity).toBe('high');
  expect(results[4][1].severity).toBe('low');
  expect(results[5][1].severity).toBe('high');
  expect(results[6][1].severity).toBe('high');

  expect(results[0][1].findings[0].dev).toBe(true);
  expect(results[1][1].findings[0].dev).toBe(true);
  expect(results[2][1].findings[0].dev).toBe(false);
  expect(results[3][1].findings[0].dev).toBe(true);
  expect(results[4][1].findings[0].dev).toBe(true);
  expect(results[5][1].findings[0].dev).toBe(true);
  expect(results[6][1].findings[0].dev).toBe(true);
});

/*
 * Test the advisories filter and expect 5 advisories to make it through
 */
test('Validate advisories filtering on HIGH threshold and not ignoring Dev dependencies', () => {
  const test_data = readFileSync('test_data/vue_js_app.json', 'utf8');
  const data = JSON.parse(test_data);
  const results = filter_advisories(Object.entries(data.advisories), false, HIGH_THRESHOLD);
  expect(results.length).toBe(5);
  expect(results[0][1].module_name).toBe('growl');
  expect(results[1][1].module_name).toBe('https-proxy-agent');
  expect(results[2][1].module_name).toBe('http-proxy-agent');
  expect(results[3][1].module_name).toBe('webpack-dev-server');
  expect(results[4][1].module_name).toBe('handlebars');

  expect(results[0][1].severity).toBe('critical');
  expect(results[1][1].severity).toBe('high');
  expect(results[2][1].severity).toBe('high');
  expect(results[3][1].severity).toBe('high');
  expect(results[4][1].severity).toBe('high');

  expect(results[0][1].findings[0].dev).toBe(true);
  expect(results[1][1].findings[0].dev).toBe(false);
  expect(results[2][1].findings[0].dev).toBe(true);
  expect(results[3][1].findings[0].dev).toBe(true);
  expect(results[4][1].findings[0].dev).toBe(true);
});

/*
 * Test the advisories filter and expect 1 advisory to make it through
 */
test('Validate advisories filtering on HIGH threshold and ignoring Dev dependencies', () => {
  const test_data = readFileSync('test_data/vue_js_app.json', 'utf8');
  const data = JSON.parse(test_data);
  const results = filter_advisories(Object.entries(data.advisories), true, HIGH_THRESHOLD);
  expect(results.length).toBe(1);
  expect(results[0][1].module_name).toBe('https-proxy-agent');

  expect(results[0][1].severity).toBe('high');

  expect(results[0][1].findings[0].dev).toBe(false);
});

/*
 * Test the advisories filter and expect 1 advisory to make it through
 */
test('Validate whitelisting of https-proxy-agent:1.0.0', () => {
  const test_data = readFileSync('test_data/vue_js_app.json', 'utf8');
  const data = JSON.parse(test_data);
  const results = filter_advisories(Object.entries(data.advisories), true, HIGH_THRESHOLD, ['https-proxy-agent:1.0.0']);
  expect(results.length).toBe(0);
});

/*
 * Test the advisories filter and expect 1 advisory to make it through
 */
test('Validate whitelisting of all versions of https-proxy-agent', () => {
  const test_data = readFileSync('test_data/vue_js_app.json', 'utf8');
  const data = JSON.parse(test_data);
  const results = filter_advisories(Object.entries(data.advisories), true, HIGH_THRESHOLD, ['https-proxy-agent']);
  expect(results.length).toBe(0);
});

/*
 * Test the advisories filter and expect 1 advisory to make it through
 */
test('Validate whitelisting of all versions of https-proxy-agent using wildcard', () => {
  const test_data = readFileSync('test_data/vue_js_app.json', 'utf8');
  const data = JSON.parse(test_data);
  const results = filter_advisories(Object.entries(data.advisories), true, HIGH_THRESHOLD, ['https-proxy-agent:*']);
  expect(results.length).toBe(0);
});

/*
 * Test the advisories filter and expect 1 advisory to make it through
 */
test('Validate failed whitelisting of https-proxy-agent using incorrect version', () => {
  const test_data = readFileSync('test_data/vue_js_app.json', 'utf8');
  const data = JSON.parse(test_data);
  const results = filter_advisories(Object.entries(data.advisories), true, HIGH_THRESHOLD, ['https-proxy-agent:0.9.9']);
  expect(results.length).toBe(1);
});

/*
 * Test the advisories filter and expect 1 advisory to make it through
 */
test('Validate failed whitelisting of https-proxy-agent-test', () => {
  const test_data = readFileSync('test_data/vue_js_app.json', 'utf8');
  const data = JSON.parse(test_data);
  const results = filter_advisories(Object.entries(data.advisories), true, HIGH_THRESHOLD, ['https-proxy-agent-test']);
  expect(results.length).toBe(1);
});

/*
 * Test the advisories filter and expect 0 advisories to make it through
 */
test('Validate advisories filtering on CRIT threshold and ignoring Dev dependencies', () => {
  const test_data = readFileSync('test_data/vue_js_app.json', 'utf8');
  const data = JSON.parse(test_data);
  const results = filter_advisories(Object.entries(data.advisories), true, CRIT_THRESHOLD);
  expect(results.length).toBe(0);
});
