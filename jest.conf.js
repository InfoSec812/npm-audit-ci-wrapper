module.exports = {
    "testPathIgnorePatterns": [
        "<rootDir>/.stryker-tmp/"
    ],
    "testMatch": [
        "**/?(*.)+(spec|test).[jt]s?(x)"
    ],
    "reporters": [
        "default",
        ["./node_modules/jest-html-reporter", {
            "pageTitle": "Test Report"
        }]
    ]
};