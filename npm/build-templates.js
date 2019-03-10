#!/usr/bin/env node

const fs = require('fs');
const _ = require('lodash');
const concat = require('concat'),
    templateDir = 'templates';

/**
 * Just prints the error info on stderr and throw err
 *
 * @param {*} err - error object
 */
function handleErr (err) {
    if (err) {
        let message;

        try {
            message = JSON.stringify(err, null, 2);
        }
        catch (e) {
            message = err;
        }
        console.error(message);
        throw err;
    }
}

fs.readdir(templateDir, { withFileTypes: true }, function (err, files) {
    handleErr(err);
    const dirs = _.filter(files, (file) => { return file.isDirectory(); });

    dirs.forEach((template) => {
        fs.readdir(`${templateDir}/${template.name}/fragments`, { withFileTypes: true }, function (err, files) {
            handleErr(err);
            const fragments = _.filter(files, (file) => {
                    return file.isFile() &&
                    file.name.match(/^\d+/) &&
                    file.name.endsWith('.hbs');
                })
                    .sort()
                    .map(((value) => { return `${templateDir}/${template.name}/fragments/${value.name}`; })),

                filename = `${templateDir}/${template.name}/${template.name}.hbs`;

            concat(fragments).then((result) => {
                fs.writeFile(filename, result, { flag: 'w' }, handleErr);
            });
        });
    });
});
