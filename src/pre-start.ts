/**
 * Pre-start is where we want to place things that must run BEFORE the express
 * server is started. This is useful for environment variables, command-line
 * arguments, and cron-jobs.
 */

import path from 'path';
import dotenv from 'dotenv';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import commandLineArgs from 'command-line-args';

// **NOTE** Do not import any local paths here, or any libraries dependent
// on environment variables.

// **** Setup command line options **** //

const options = commandLineArgs([
    {
        name: 'env',
        alias: 'e',
        defaultValue: 'docker',
        type: String
    }
]);

// **** Set the env file **** //
if (options.env !== 'docker') {
    const result2 = dotenv.config({
        path: path.join(__dirname, `../env/${String(options.env)}.env`)
    });

    if (result2.error) {
        throw result2.error;
    }
}
