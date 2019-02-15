const { parse_args } = require('./parse_args');

test('Test defaults', () => {
  const argv = [];
  const {threshold, ignoreDev, json_output } = parse_args(argv);

  expect(threshold).toBe(3);
  expect(ignoreDev).toBe(false);
  expect(json_output).toBe(false);
});

test('Test LOW', () => {
  const argv = ['-t', 'low'];
  const {threshold, ignoreDev, json_output } = parse_args(argv);

  expect(threshold).toBe(0);
  expect(ignoreDev).toBe(false);
  expect(json_output).toBe(false);
});

test('Test HIGH and ignoreDev', () => {
  const argv = ['-t', 'high', '-p'];
  const {threshold, ignoreDev, json_output } = parse_args(argv);

  expect(threshold).toBe(2);
  expect(ignoreDev).toBe(true);
  expect(json_output).toBe(false);
});

test('Test JSON Output', () => {
  const argv = ['-j'];
  const {threshold, ignoreDev, json_output } = parse_args(argv);

  expect(threshold).toBe(3);
  expect(ignoreDev).toBe(false);
  expect(json_output).toBe(true);
});