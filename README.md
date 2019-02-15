# NPM Audit Continuous Integration Wrapper

[![Build Status](https://travis-ci.com/InfoSec812/npm-audit-ci-wrapper.svg?branch=master)](https://travis-ci.com/InfoSec812/npm-audit-ci-wrapper)
![https://sonarcloud.io/dashboard?id=com.zanclus%3Anpm-audit-ci-wrapper](https://sonarcloud.io/api/project_badges/measure?project=com.zanclus%3Anpm-audit-ci-wrapper&metric=alert_status)


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

	--json, -j
		Do not fail, just output the filtered JSON data which matches the specified threshold/scope
		'npm-audit-ci-wrapper --threshold=high -p --json' or 'npm-audit-ci-wrapper -j'
```
