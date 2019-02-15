const parse_audit_results = require('./index');

const LOW_THRESHOLD = 0;
const MOD_THRESHOLD = 1;
const HIGH_THRESHOLD = 2;
const CRIT_THRESHOLD = 3;

test('Validate run with 0 vulnerabilities', () => {
  const test_data = `{
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
        "dependencies": 1,
        "devDependencies": 74642,
        "optionalDependencies": 396,
        "totalDependencies": 74643
      },
      "runId": "13b24789-ae58-468a-83ff-7eb3faafa8ae"
    }`;
  expect(parse_audit_results(null, test_data, null, LOW_THRESHOLD, false)).toBe(0);
});