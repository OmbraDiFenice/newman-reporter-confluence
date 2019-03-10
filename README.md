# newman-reporter-confluence
Confluence reporter for [Newman](https://github.com/postmanlabs/newman) that uploads newman report on a Confluence page.
This needs to be used in [conjunction with Newman](https://github.com/postmanlabs/newman#external-reporters) so that it can recognize the reporting options.

> The code gathering the run information is based on [neman-reporter-htmlfull](https://github.com/martijnvandervlag/newman-reporter-htmlfull), so the data included in the report are not aggregated; each execution is reported independently. 

> The code also incorporates the latest (at the time of forking) test scripts and repository configuration as [newman-reporter-html](https://github.com/postmanlabs/newman-reporter-html), with some minor changes.

## Install
> The installation should be global if newman is installed globally, local otherwise. (Replace -g from the command below with -S for a local installation)

```console
$ npm install -g newman-reporter-confluence
```

## Usage
**Note:** the default template used produces wikimarkup text understood by Atlassian &copy; Confluence and uploaded on a page through their [REST API](https://developer.atlassian.com/cloud/confluence/rest/).
This means that the final page won't include any script or custom CSS and therefore *is not possible to parse markdown or have any external library in place, such as bootstrap*.

Effort has been made to exploit standard Confluence plugins and produce a result similar to the [neman-reporter-htmlfull](https://github.com/martijnvandervlag/newman-reporter-htmlfull) template.
Nonetheless if you have, in your Confluence installation, a plugin suitable for e.g. render markdown text it's always possible to create a new template to exploit it.

In order to enable this reporter, specify `confluence` in Newman's `-r` or `--reporters` option. 

```console
$ newman run https://www.getpostman.com/collections/631643-f695cab7-6878-eb55-7943-ad88e1ccfd65-JsLv -r confluence --reporter-confluence-export './examples/template-default.wiki' -n 2
```

### Options

#### With Newman CLI

| CLI Option  | Description       |
|-------------|-------------------|
| `--reporter-confluence-export <path>` | Specify a path where the output HTML file will be written to disk. If not specified, the file will be written to `newman/` in the current working directory. |
| `--reporter-confluence-template <path>` | Specify a path to the custom template which will be used to render the HTML report. This option depends on `--reporter htmlfull` and `--reporter-htmlfull-export` being present in the run command. If this option is not specified, the [default template](https://github.com/martijnvandervlag/newman-reporter-htmlfull/tree/master/templates/full/template-default-colored.hbs) is used |

Custom templates (currently handlebars only) can be passed to the HTML reporter via `--reporter-confluence-template <path>` with `--reporters confluence`.
The [default template](https://github.com/OmbraDiFenice/newman-reporter-confluence/blob/master/templates/confluence/confluence.hbs) is used in all other cases.

#### With Newman as a Library
The CLI functionality is available for programmatic use as well.

```javascript
const newman = require('newman');

newman.run({
    collection: require('https://www.getpostman.com/collections/631643-f695cab7-6878-eb55-7943-ad88e1ccfd65-JsLv'), // can also provide a URL or path to a local JSON file.
    reporters: 'confluence',
    reporter: {
        confluence: {
            export: './examples/default-template.wiki',
            template: './templates/confluence/confluence.hbs' // optional, this will be picked up relative to the directory that Newman runs in.
        }
    },
	iterationCount: 2
}, function (err) {
	if (err) { throw err; }
    console.log('collection run complete!');
});
```

## License
This software is licensed under Apache-2.0. Copyright Postdot Technologies, Inc. See the [LICENSE](LICENSE.md) file for more information.
