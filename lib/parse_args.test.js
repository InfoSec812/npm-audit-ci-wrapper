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

const { parse_args, validThresholds, check_npm_version } = require('./parse_args');

test('Test whitelist with HIGH threshold', () => {
  const argv = ['-w', 'https-proxy-agent:1.0.0'];
  const { threshold, ignoreDev, json_output, registry, whitelist } = parse_args(argv);
  expect(whitelist[0]).toBe('https-proxy-agent:1.0.0');
});

test('Check npm version', async () => {
  const result = await check_npm_version();
  expect(result).toBe(true);
});

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