/**
 * Copyright [2020] [Joseph B. Phillips]
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

test('Verify that version from package.json matches version in the code', () => {
  const testRegEx = new RegExp(`VERSION = '([0-9.]+)'`);
  const indexJs = readFileSync('bin/index.js', 'utf8');
  const indexJsVersion = indexJs.match(testRegEx);
  const packageJsonVersion = require('../package.json').version;
  expect(indexJsVersion[0]).toBe(`VERSION = '${packageJsonVersion}'`);
});