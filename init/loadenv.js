const dotenv = require('dotenv');
const commandLineArgs = require('command-line-args');// Setup command line options
const options = commandLineArgs([{ name: 'env', alias: 'e', defaultValue: 'prod', type: String, }]);
const result2 = dotenv.config({ path: `./env/${options.env}.env` });
if (result2.error) { throw result2.error; }
