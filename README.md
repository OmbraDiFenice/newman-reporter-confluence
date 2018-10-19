# newman-reporter-htmlfull
HTML reporter for [Newman](https://github.com/postmanlabs/newman) that provides the information about the collection run in HTML format.
This needs to be used in [conjunction with Newman](https://github.com/postmanlabs/newman#external-reporters) so that it can recognize HTML reporting options.

> Different from [newman-reporter-html](https://github.com/postmanlabs/newman-reporter-html) is not aggregating results for executions by using the cursor reference which is unique for each execution instead of the item id.

> Please use [newman-reporter-html](https://github.com/postmanlabs/newman-reporter-html) if you want aggregated results. You can use the [templates](https://github.com/martijnvandervlag/newman-reporter-htmlfull/tree/master/templates/aggregated) which are based on the original templates including the [changes](#changes), see [Templates > Aggregated](#aggregated) here below.

## Install
> The installation should be global if newman is installed globally, local otherwise. (Replace -g from the command below with -S for a local installation)

```console
$ npm install -g newman-reporter-htmlfull
```

## Usage
The examples provided in the usage are for showing the differences between [newman-reporter-html](https://github.com/postmanlabs/newman-reporter-html) and this project included the [changes](#changes) to the original templates.

Iteration (```-n 2```) is used to show the difference between aggregated and full reports.

HTML examples can be found [here](https://github.com/martijnvandervlag/newman-reporter-htmlfull/tree/master/examples).

### Original templates
> Use [newman-reporter-html](https://github.com/postmanlabs/newman-reporter-html) to execute

In order to enable this reporter, specify `html` in Newman's `-r` or `--reporters` option.

```console
$ newman run https://www.getpostman.com/collections/631643-f695cab7-6878-eb55-7943-ad88e1ccfd65-JsLv -r html --reporter-html-export './examples/original/template-default.html' --reporter-html-template './templates/original/template-default.hbs' -n 2
$ newman run https://www.getpostman.com/collections/631643-f695cab7-6878-eb55-7943-ad88e1ccfd65-JsLv -r html --reporter-html-export './examples/original/template-default-colored.html' --reporter-html-template './templates/original/template-default-colored.hbs' -n 2
$ newman run https://www.getpostman.com/collections/631643-f695cab7-6878-eb55-7943-ad88e1ccfd65-JsLv -r html --reporter-html-export './examples/original/htmlreqres.html' --reporter-html-template './templates/original/htmlreqres.hbs' -n 2
```

### Aggregated templates
> Use [newman-reporter-html](https://github.com/postmanlabs/newman-reporter-html) to execute with [aggregated](https://github.com/martijnvandervlag/newman-reporter-htmlfull/tree/master/templates/aggregated) templates.

In order to enable this reporter, specify `html` in Newman's `-r` or `--reporters` option.

```console
newman run https://www.getpostman.com/collections/631643-f695cab7-6878-eb55-7943-ad88e1ccfd65-JsLv -r html --reporter-html-export './examples/aggregated/template-default.html' --reporter-html-template './templates/aggregated/template-default.hbs' -n 2
newman run https://www.getpostman.com/collections/631643-f695cab7-6878-eb55-7943-ad88e1ccfd65-JsLv -r html --reporter-html-export './examples/aggregated/template-default-colored.html' --reporter-html-template './templates/aggregated/template-default-colored.hbs' -n 2
newman run https://www.getpostman.com/collections/631643-f695cab7-6878-eb55-7943-ad88e1ccfd65-JsLv -r html --reporter-html-export './examples/aggregated/htmlreqres.html' --reporter-html-template './templates/aggregated/htmlreqres.hbs' -n 2
```

### Full templates

In order to enable this reporter, specify `htmlfull` in Newman's `-r` or `--reporters` option.

```console
newman run https://www.getpostman.com/collections/631643-f695cab7-6878-eb55-7943-ad88e1ccfd65-JsLv -r htmlfull --reporter-htmlfull-export './examples/full/template-default.html' --reporter-htmlfull-template './templates/full/template-default.hbs' -n 2
newman run https://www.getpostman.com/collections/631643-f695cab7-6878-eb55-7943-ad88e1ccfd65-JsLv -r htmlfull --reporter-htmlfull-export './examples/full/template-default-colored.html' --reporter-htmlfull-template './templates/full/template-default-colored.hbs' -n 2
newman run https://www.getpostman.com/collections/631643-f695cab7-6878-eb55-7943-ad88e1ccfd65-JsLv -r htmlfull --reporter-htmlfull-export './examples/full/htmlreqres.html' --reporter-htmlfull-template './templates/full/htmlreqres.hbs' -n 2
```

### Options

#### With Newman CLI

| CLI Option  | Description       |
|-------------|-------------------|
| `--reporter-htmlfull-export <path>` | Specify a path where the output HTML file will be written to disk. If not specified, the file will be written to `newman/` in the current working directory. |
| `--reporter-htmlfull-template <path>` | Specify a path to the custom template which will be used to render the HTML report. This option depends on `--reporter htmlfull` and `--reporter-htmlfull-export` being present in the run command. If this option is not specified, the [default template](https://github.com/martijnvandervlag/newman-reporter-htmlfull/tree/master/templates/full/template-default-colored.hbs) is used |

Custom templates (currently handlebars only) can be passed to the HTML reporter via `--reporter-htmlfull-template <path>` with `--reporters htmlfull` and `--reporter-htmlfull-export`.
The [default template](https://github.com/martijnvandervlag/newman-reporter-htmlfull/tree/master/templates/full/template-default-colored.hbs) is used in all other cases.

#### With Newman as a Library
The CLI functionality is available for programmatic use as well.

```javascript
const newman = require('newman');

newman.run({
    collection: require('https://www.getpostman.com/collections/631643-f695cab7-6878-eb55-7943-ad88e1ccfd65-JsLv'), // can also provide a URL or path to a local JSON file.
    reporters: 'htmlfull',
    reporter: {
        htmlfull: {
            export: './examples/full/htmlreqres.html', // If not specified, the file will be written to `newman/` in the current working directory.
            template: './templates/htmlreqres.hbs' // optional, this will be picked up relative to the directory that Newman runs in.
        }
    },
	iterationCount: 2
}, function (err) {
	if (err) { throw err; }
    console.log('collection run complete!');
});
```
### Changes

The improvements and fixes to the templates are inspired somewhat contributed by several community users of Postman, Github and Stackoverflow.

#### Improvements

* **[General insight in working with Handlebars and newman-reporter](https://community.getpostman.com/t/improve-newman-documention-for-custom-reports)** by [azharmohammedk](https://community.getpostman.com/u/azharmohammedk), [tegomassria](https://community.getpostman.com/u/tegomassria), [gopikrishna4595](https://community.getpostman.com/u/gopikrishna4595), [rmlira](https://community.getpostman.com/u/rmlira) and [pfarrell](https://community.getpostman.com/u/pfarrell)
* **[Prettify Syntax Highlighting JSON](https://stackoverflow.com/a/7220510)** by [hassan](https://stackoverflow.com/users/2359679/hassan)
* **[Prettify markdown with Remarkable](https://github.com/postmanlabs/newman/issues/1309#issuecomment-406018929)** by [filipeamaral](https://github.com/filipeamaral)

#### Fixes

* **[Total failures showing [Object][Object]](https://gist.github.com/tegomass/fd67fa22f39a7ebe33a533862ff09d88#gistcomment-2402284)** by [sakthiveltk](https://gist.github.com/sakthiveltk)
* **[Empty request body shown when using request.body](https://github.com/MarcosEllys/awesome-newman-html-template/blob/master/templates/htmlreqres.hbs)** by [MarcosEllys](https://github.com/MarcosEllys) at line [545](https://github.com/MarcosEllys/awesome-newman-html-template/blob/master/templates/htmlreqres.hbs#L545)

### Templates

The following community related templates are adjusted, improved and included:

* Template [template-default.hbs](https://github.com/postmanlabs/newman-reporter-html/tree/master/lib/template-default.hbs) from [postmanlabs/newman-reporter-html](https://github.com/postmanlabs/newman-reporter-html)
* Template [template-default-colored.hbs](https://gist.github.com/tegomass/fd67fa22f39a7ebe33a533862ff09d88#file-template-default-colored-hbs) from [tegomass](https://gist.github.com/tegomass)
* Template [htmlreqres.hbs](https://github.com/MarcosEllys/awesome-newman-html-template/blob/master/templates/htmlreqres.hbs) from [MarcosEllys/awesome-newman-html-template](https://github.com/MarcosEllys/awesome-newman-html-template)

#### Original

The original templates are included [here](https://github.com/martijnvandervlag/newman-reporter-htmlfull/tree/master/templates/original).

#### Aggregated

The [changes](#changes) to the original templates, which can be used with [newman-reporter-html](https://github.com/postmanlabs/newman-reporter-html), are included [here](https://github.com/martijnvandervlag/newman-reporter-htmlfull/tree/master/templates/aggregated).

#### Full

The templates which can be used with this project including the [changes](#changes) are included [here](https://github.com/martijnvandervlag/newman-reporter-htmlfull/tree/master/templates/full).

### Possible improvements

Improvements that are known, working in other templates or will be worked on in the future:

* Parse form and urlencoded request body to display
* Add copy to clipboard


## Compatibility

| **newman-reporter-htmlfull** | **newman** | **node** |
|:-----------------------------:|:----------:|:--------:|
|            v1.0.0             | >= v4.0.0  | >= v6.x  |

## Troubleshooting

### Reporter not found
The reporter and newman must be installed at the same level, the installation should be global if newman is installed globally, local otherwise.

### Getting different HTML output
You are most probably getting in-built reporter output used in older versions of newman, Please check the newman's [compatibility](#compatibility) section above.

> If you are facing any other problem, please check the open [issues](https://github.com/martijnvandervlag/newman-reporter-htmlfull/issues) or create new.

## Community Support

<img src="https://avatars1.githubusercontent.com/u/3220138?v=3&s=120" align="right" />
If you are interested in talking to the Postman team and fellow Newman users, you can find us on our <a href="https://community.getpostman.com">Postman Community Forum</a>. Feel free to drop by and say hello. You'll find us posting about upcoming features and beta releases, answering technical support questions, and contemplating world peace.

Sign in using your Postman account to participate in the discussions and don't forget to take advantage of the <a href="https://community.getpostman.com/search?q=newman">search bar</a> - the answer to your question might already be waiting for you! Don’t want to log in? Then lurk on the sidelines and absorb all the knowledge.


## License
This software is licensed under Apache-2.0. Copyright Postdot Technologies, Inc. See the [LICENSE](LICENSE) file for more information.