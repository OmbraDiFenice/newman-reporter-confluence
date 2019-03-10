# newman-reporter-confluence
[![Build Status](https://travis-ci.com/OmbraDiFenice/newman-reporter-confluence.svg?branch=master)](https://travis-ci.com/OmbraDiFenice/newman-reporter-confluence)

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
In order to enable this reporter, specify `confluence` in Newman's `-r` or `--reporters` option.

```console
$ newman run https://www.getpostman.com/collections/631643-f695cab7-6878-eb55-7943-ad88e1ccfd65-JsLv -r confluence --reporter-confluence-export './examples/template-default.wiki' -n 2
```

The options related to Confluence are needed if you want to automatically upload the report page and must be provided all together
(i.e. you cannot provide just one and leave out the others). If no provided, at least the `export` option must be provided.
In that case you will be responsible to upload the generated wiki template to Confluence.

The report page on Confluence will be placed as child page of the page specified through the `parentId` option, which must be 
in the space with ID `spaceId`.

When uploading, the algorihtm is as follows:
 1. The page is searched (for title) in the space provided in the options as spaceId.
 2. If found, it is updated with the new content
 3. Otherwise a new page is created, as child of the page whose ID is provided in `options.parentId`

## Note about templates
The default template used produces wikimarkup text understood by Atlassian &copy; Confluence, and is uploaded on a page through their [REST API](https://developer.atlassian.com/cloud/confluence/rest/).
This means that the final page won't include any script or custom CSS and therefore *is not possible to parse markdown or have any external library such as bootstrap in place*.

Effort has been made to exploit standard Confluence plugins and produce a result similar to the [newman-reporter-htmlfull](https://github.com/martijnvandervlag/newman-reporter-htmlfull) template.
Nonetheless if you have, in your Confluence installation, a plugin suitable for e.g. render markdown text it's always possible to create a new template to exploit it. 

### Options

#### With Newman CLI

| CLI Option  | Description       |
|-------------|-------------------|
| `--reporter-confluence-export <path>` | Specify a path where the output report file will be written to disk. You must at lesat specify this if you don't want to use the automatic Confluence upload |
| `--reporter-confluence-template <path>` | Specify a path to the custom [handlebars](https://handlebarsjs.com/) template which will be used to render the report. If this option is not specified, the [default template](https://github.com/OmbraDiFenice/newman-reporter-confluence/blob/master/templates/confluence/confluence.hbs) is used |
| `--reporter-confluence-username <string>` | Username of the Confluence user. It will need write access to the specified space. If specified, also the other Confluence related options must be present |
| `--reporter-confluence-password <string>` | Password for the Confluence user.  If specified, also the other Confluence related options must be present |
| `--reporter-confluence-baseUrl <string>` | Base url to Confluence REST API _without trailing slash_. If specified, also the other Confluence related options must be present |
| `--reporter-confluence-version <number>` | Optional Confluence REST API version number|
| `--reporter-confluence-spaceId <string>` | ID of the Confluence space where to upload the report page. If specified, also the other Confluence related options must be present |
| `--reporter-confluence-parentId <string>` | ID of the Confluence page which should be parent of the report page. If specified, also the other Confluence related options must be present |

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
