const { readFileSync } = require('fs');
const { parse_audit_results, filter_advisories } = require('./parser');

const LOW_THRESHOLD = 0;
const MOD_THRESHOLD = 1;
const HIGH_THRESHOLD = 2;
const CRIT_THRESHOLD = 3;

test('Validate when err is NULL', () => {
  const test_data = readFileSync('test_data/zero_vulnerabilities.json', 'utf8');
  expect(parse_audit_results(null, test_data, null, LOW_THRESHOLD, false)).toBe(0);
});

test('Validate run with 0 vulnerabilities', () => {
  const test_data = readFileSync('test_data/zero_vulnerabilities.json', 'utf8');
  expect(parse_audit_results("", test_data, null, LOW_THRESHOLD, false)).toBe(0);
});

test('Validate run with 7 vulnerabilities', () => {
  const test_data = readFileSync('test_data/vue_js_app.json', 'utf8');
  expect(parse_audit_results("", test_data, null, LOW_THRESHOLD, false)).toBe(1);
});

test('Validate run with 7 vulnerabilities and JSON output', () => {
  const test_data = readFileSync('test_data/vue_js_app.json', 'utf8');
  expect(parse_audit_results("", test_data, null, LOW_THRESHOLD, true)).toBe(0);
});

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

test('Validate advisories filtering on HIGH threshold and ignoring Dev dependencies', () => {
  const test_data = readFileSync('test_data/vue_js_app.json', 'utf8');
  const data = JSON.parse(test_data);
  const results = filter_advisories(Object.entries(data.advisories), true, HIGH_THRESHOLD);
  expect(results.length).toBe(1);
  expect(results[0][1].module_name).toBe('https-proxy-agent');

  expect(results[0][1].severity).toBe('high');

  expect(results[0][1].findings[0].dev).toBe(false);
});