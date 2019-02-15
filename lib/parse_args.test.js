const { parse_args } = require('./parse_args');

test('Test defaults', () => {
  const argv = [];
  const {threshold, ignoreDev, json_output, registry } = parse_args(argv);

  expect(threshold).toBe(3);
  expect(ignoreDev).toBe(false);
  expect(json_output).toBe(false);
  expect(registry).toBeNull();
});

test('Test LOW', () => {
  const argv = ['-t', 'low'];
  const {threshold, ignoreDev, json_output, registry } = parse_args(argv);

  expect(threshold).toBe(0);
  expect(ignoreDev).toBe(false);
  expect(json_output).toBe(false);
  expect(registry).toBeNull();
});

test('Test HIGH and ignoreDev', () => {
  const argv = ['-t', 'high', '-p'];
  const {threshold, ignoreDev, json_output, registry } = parse_args(argv);

  expect(threshold).toBe(2);
  expect(ignoreDev).toBe(true);
  expect(json_output).toBe(false);
  expect(registry).toBeNull();
});

test('Test JSON Output short option', () => {
  const argv = ['-j'];
  const {threshold, ignoreDev, json_output, registry } = parse_args(argv);

  expect(threshold).toBe(3);
  expect(ignoreDev).toBe(false);
  expect(json_output).toBe(true);
  expect(registry).toBeNull();
});

test('Test JSON Output long option', () => {
  const argv = ['--json'];
  const {threshold, ignoreDev, json_output, registry } = parse_args(argv);

  expect(threshold).toBe(3);
  expect(ignoreDev).toBe(false);
  expect(json_output).toBe(true);
  expect(registry).toBeNull();
});

test('Test passing registry long argument with equals', () => {
  const argv = ['--registry=registry.npmjs.org'];
  const {threshold, ignoreDev, json_output, registry } = parse_args(argv);

  expect(threshold).toBe(3);
  expect(ignoreDev).toBe(false);
  expect(json_output).toBe(false);
  expect(registry).toBe('registry.npmjs.org');
});

test('Test passing registry short argument', () => {
  const argv = ['-r', 'registry.npmjs.org'];
  const {threshold, ignoreDev, json_output, registry } = parse_args(argv);

  expect(threshold).toBe(3);
  expect(ignoreDev).toBe(false);
  expect(json_output).toBe(false);
  expect(registry).toBe('registry.npmjs.org');
});