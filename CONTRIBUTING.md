# Overview
If you would like to contribute to this project, I would be VERY happy to review your pull requests. 
The workflow which I advocate for is:

- Fork this repository
- Create an Issue for the feature/fix/improvement you are working on
- Create a branch in your fork which is named like `Issue-<num>_-_<short_description>`
- Commit you changes to that branch in your fork
  - Make sure that you add unit tests as the build will fail if you have < 80% coverage on new code
  - Make sure that you run [Stryker](https://stryker-mutator.io/) (npm run stryker) to validate your unit tests
  - Make sure you update the CLI help/args for new flags/params
  - Make sure you update the README if needed
  - Use [SonarLint](https://www.sonarlint.org/) to check your code for bugs/vulnerabilities/smells
- Submit a pull request
  - Mention @InfoSec812 in the body
  - Add `Resolves #<issue num>` in the body

After submitting your pull request, TravisCI will run a PR build to run our automated tests/checks/scans. 
If any part of the TravisCI build fails, please update your PR until it succeeds.
