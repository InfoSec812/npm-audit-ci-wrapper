# **DEPRECATED** NPM Audit Continuous Integration Wrapper

## Deprecation
NPM keeps changing the API for NPM Audit and I just don't have the time or inclination to keep chasing their whims. I highly recommend that you switch to using
Sonatype's [auditjs](https://github.com/sonatype-nexus-community/auditjs#readme) which is far more stable and not dependent on NPM's Audit API. It instead uses the Sonatype OSSI registry which covers a lot more detail. I have already switched all of my projects. If you would like to take over ownership of this repository and the NPM package, I would be willing to hand it over to someone who proves their intent by submitting a pull-request to handle the latest NPM Audit API.

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=com.zanclus%3Anpm-audit-ci-wrapper&metric=alert_status)](https://sonarcloud.io/dashboard?id=com.zanclus%3Anpm-audit-ci-wrapper)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=com.zanclus%3Anpm-audit-ci-wrapper&metric=coverage)](https://sonarcloud.io/dashboard?id=com.zanclus%3Anpm-audit-ci-wrapper)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=com.zanclus%3Anpm-audit-ci-wrapper&metric=bugs)](https://sonarcloud.io/dashboard?id=com.zanclus%3Anpm-audit-ci-wrapper)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=com.zanclus%3Anpm-audit-ci-wrapper&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=com.zanclus%3Anpm-audit-ci-wrapper)
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

OR

```
npx npm-audit-ci-wrapper@latest
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
		Do not fail, just output the filtered JSON data which matches the specified threshold/scope (useful in combination with `npm-audit-html`)
		'npm-audit-ci-wrapper --threshold=high -p --json' or 'npm-audit-ci-wrapper -j'

	--registry, -r
		Set an alternate NPM registry server. Useful when your default npm regsitry (i.e. npm config set registry) does not support the npm audit command.
		'npm-audit-ci-wrapper --registry=https://registry.npmjs.org/'

	--whitelist, -w
		Whitelist the given dependency at the specified version or all versions (Can be specified multiple times).
		'npm-audit-ci-wrapper -w https-proxy-agent' or 'npm-audit-ci-wrapper -w https-proxy-agent:*' or 'npm-audit-ci-wrapper --whitelist=https-proxy-agent:1.0.0'

	--version, -v
		Output the version of npm-audit-ci-wrapper and then exit
		'npm-audit-ci-wrapper -v' or 'npm-audit-ci-wrapper --version'
```
