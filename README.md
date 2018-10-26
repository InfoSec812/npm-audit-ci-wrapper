# NPM Audit Continuous Integration Wrapper

This utility is a wrapper around `npm audit --json` which allows for finer grained control over what
will cause a CI build to fail. Options include setting the severity threshold and ignoring dev dependencies.

## Installation

```
npm install --save-dev npm-audit-ci-wrapper
```

OR

```
npm install -g npm-audit-ci-wrapper
```

## Usage

```
Usage: npm-audit-ci-wrapper [options]

	--help, -h
		Displays help information about this script
		'npm-audit-ci-wrapper -h' or 'npm-audit-ci-wrapper --help'

	--threshold, -t
		The threshold at which the audit should fail the build (low, moderate, high, critical)
		'npm-audit-ci-wrapper --threshold=high' or 'npm-audit-ci-wrapper -t high'

	--ignore-dev-dependencies, -p
		Tells the tool to ignore dev dependencies and only fail the build on runtime dependencies which exceed the threshold
		'npm-audit-ci-wrapper -p' or 'npm-audit-ci-wrapper --ignore-dev-dependencies'
```