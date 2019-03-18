# NPM Audit Continuous Integration Wrapper

[![Build Status](https://travis-ci.com/InfoSec812/npm-audit-ci-wrapper.svg?branch=master)](https://travis-ci.com/InfoSec812/npm-audit-ci-wrapper)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=com.zanclus%3Anpm-audit-ci-wrapper&metric=alert_status)](https://sonarcloud.io/dashboard?id=com.zanclus%3Anpm-audit-ci-wrapper)
[![Code Coverage](https://sonarcloud.io/api/project_badges/measure?project=com.zanclus%3Anpm-audit-ci-wrapper&metric=coverage)](https://sonarcloud.io/dashboard?id=com.zanclus%3Anpm-audit-ci-wrapper)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=com.zanclus%3Anpm-audit-ci-wrapper&metric=bugs)](https://sonarcloud.io/dashboard?id=com.zanclus%3Anpm-audit-ci-wrapper)
[![Quality](https://sonarcloud.io/api/project_badges/measure?project=com.zanclus%3Anpm-audit-ci-wrapper&metric=sqale_index)](https://sonarcloud.io/dashboard?id=com.zanclus%3Anpm-audit-ci-wrapper)
[![Known Vulnerabilities](https://snyk.io/test/github/InfoSec812/npm-audit-ci-wrapper/badge.svg?targetFile=package.json)](https://snyk.io/test/github/InfoSec812/npm-audit-ci-wrapper?targetFile=package.json)

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
Usage: index.js [options]

	--help, -h
			Displays help information about this script
			'index.js -h' or 'index.js --help'

	--threshold, -t
			The threshold at which the audit should fail the build (low, moderate, high, critical)
			'npm-audit-ci-wrapper --threshold=high' or 'npm-audit-ci-wrapper -t high'

	--ignore-dev-dependencies, -p
			Tells the tool to ignore dev dependencies and only fail the build on runtime dependencies which exceed the threshold
			'npm-audit-ci-wrapper -p' or 'npm-audit-ci-wrapper --ignore-dev-dependencies'

	--json, -j
			Do not fail, just output the filtered JSON data which matches the specified threshold/scope (useful in combination with `npm-audit-html`)
			'npm-audit-ci-wrapper --threshold=high -p --json' or 'npm-audit-ci-wrapper -j'

	--registry, -r
			Submit the dependency report to and get the list of vulnerabilities from this npm registry. Useful when your default npm regsitry (i.e. npm config set registry) does not support the npm audit command.
			'npm-audit-ci-wrapper --registry=https://registry.npmjs.org/'

	--whitelist, -w
			Whitelist the given dependency at the specified version or all versions (Can be specified multiple times).
			'npm-audit-ci-wrapper -w https-proxy-agent' or 'npm-audit-ci-wrapper -w https-proxy-agent:*' or 'npm-audit-ci-wrapper --whitelist=https-proxy-agent:1.0.0'
```
