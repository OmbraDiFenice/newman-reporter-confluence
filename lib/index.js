const fs = require('fs'),
    path = require('path'),
    Confluence = require('confluence-api'),

    _ = require('lodash'),
    handlebars = require('handlebars'),

    util = require('./util'),

    /**
     * An object of the default file read preferences.
     *
     * @type {Object}
     */
    FILE_READ_OPTIONS = { encoding: 'utf8' },

    /**
     * The default Handlebars template to use when no user specified template is provided.
     *
     * @type {String}
     */
    DEFAULT_TEMPLATE = '../templates/confluence/confluence.hbs',

    /**
     * A reference object for run stats properties to use for various assertion states.
     *
     * @type {Object}
     */
    ASSERTION_STATE = { false: 'passed', true: 'failed' },

    /**
     * The list of execution data fields that are aggregated over multiple requests for the collection run
     *
     * @type {String[]}
     */
    AGGREGATED_FIELDS = ['cursor', 'item', 'request', 'response', 'requestError'];

let PostmanConfluenceReporter;

/**
 * Upload the wiki content on Confluence.
 *
 * The page is first searched (for title) in the space provided in the options as spaceId. If found, it is updated
 * with the new content, otherwise a new page is created, as child of the page whose ID is provided in options.parentId.
 *
 * @param {Object} options - Confluence connection options
 * @param {String} options.username - Username of the Confluence user. It will need write access to the specified space
 * @param {String} options.password - Password for the Confluence user
 * @param {String} options.baseUrl - Base url to Confluence REST API _without trailing slash_
 * @param {number=} options.version - Optional Confluence REST API version number
 * @param {String} options.spaceId - ID of the Confluence space where to upload the report page
 * @param {String=} options.parentId - ID of the Confluence page which should be parent of the report page
 * @param {String} pageTitle - Title of the page to update or create
 * @param {String} content - Content of the page to upload, in Confluence wiki markup format
 * @see {@link https://www.npmjs.com/package/confluence-api|confluence-api}
 */
function uploadReport (options, pageTitle, content) {
    const confluence = new Confluence(_.cloneDeep(options));

    /**
     * Simple error handler that throws any non null error object
     *
     * @param {Object} err - error object which is JSON stringified and thrown if non null
     */
    function checkError (err) {
        if (err) { throw new Error(JSON.stringify(err, null, 2)); }
    }

    confluence.getContentByPageTitle(options.spaceId, pageTitle, (err, res) => {
        checkError(err);

        switch (res.size) {
            case 1:
                confluence.putContent(options.spaceId, res.results[0].id, res.results[0].version.number + 1,
                    pageTitle, content, checkError, false, 'wiki');
                break;
            case 0:
                confluence.postContent(options.spaceId, pageTitle, content, options.parentId, checkError, 'wiki');
                break;
            default:
                throw new Error(`Got too many results form Confluence getContent API: ${res}`);
        }
    });
}

/**
 * Check if all the mandatory options are provided, and raise an exception if not
 *
 * @param {Object} options - The reporter option object
 */
function validateOptions (options) {
    const confluenceOptions = [
            'username',
            'password',
            'baseUrl',
            'spaceId',
            'parentId'
        ],
        fileOptions = [
            'export'
        ];
    let hasConfluenceOption = confluenceOptions.reduce((accumulator, currentValue) => {
        return accumulator && _.has(options, currentValue);
    });

    // if options contain any of the mandatory options, all of them are mandatory
    // otherwise non of them must be specified
    if (hasConfluenceOption) {
        confluenceOptions.forEach((option) => {
            if (!_.has(options, option)) { throw new Error(`[Confluence Reporter] ${option} option is mandatory`); }
        });
    }
    else {
        fileOptions.forEach((option) => {
            if (!_.has(options, option)) {
                throw new Error('If no Confluence options are given you must provide the export path at least');
            }
        });
    }
}

/**
 * A function that creates raw wiki markup to be uploaded to Confluence.
 *
 * @param {Object} newman - The collection run object, with a event handler setter, used to enable event wise reporting
 * @param {Object} options - The set of reporter run options
 * @param {String=} options.template - Optional path to the custom user defined report template (Handlebars)
 * @param {String=} options.export - Optional custom path to create the report at
 * @param {String} options.username - Username of the Confluence user. It will need write access to the specified space
 * @param {String} options.password - Password for the Confluence user
 * @param {String} options.baseUrl - Base url to Confluence REST API _without trailing slash_
 * @param {number=} options.version - Optional Confluence REST API version number
 * @param {String} options.spaceId - ID of the Confluence space where to upload the report page
 * @param {String=} options.parentId - ID of the Confluence page which should be parent of the report page
 * @param {Object} collectionRunOptions - The set of all the collection run options
 * @returns {*}
 * @see {@link https://www.npmjs.com/package/confluence-api|confluence-api} for the Confluence REST API related options
 */
PostmanConfluenceReporter = function (newman, options, collectionRunOptions) {
    validateOptions(options);

    handlebars.registerHelper('add', function (addend, augend) {
        return addend + augend;
    });
    handlebars.registerHelper('gt', function (value, threshold, options) {
        return value > threshold ?
            options.fn(this) :
            options.inverse(this);
    });

    // Confluence wiki markup helpers
    handlebars.registerHelper('sectionRow', function () {
        const firstColumnWidth = 30,
            N = arguments.length - 1;
        let row = '{section}';

        for (let i = 0; i < N; i++) {
            row += `{column${i === 0 ?
                `:width=${firstColumnWidth}%` :
                `:width:${(100 - firstColumnWidth) / (N - 1)}%`}}${arguments[i]}{column}`;
        }
        row += '{section}';

        return new handlebars.SafeString(row);
    });
    handlebars.registerHelper('link', function (src, text) {
        return new handlebars.SafeString(`[${text}|${src}]`);
    });
    handlebars.registerHelper('escapeWiki', function (markup) {
        return new handlebars.SafeString(markup.replace(/([}{])/g, '\\$1'));
    });

    const template = options.template || path.join(__dirname, DEFAULT_TEMPLATE),
        compiler = handlebars.compile(fs.readFileSync(template, FILE_READ_OPTIONS));

    newman.on('beforeDone', function () {
        const items = {},
            executionMeans = {},
            netTestCounts = {},
            aggregations = [],
            traversedRequests = {},
            aggregatedExecutions = {},
            executions = _.get(this, 'summary.run.executions'),
            assertions = _.transform(executions, function (result, currentExecution) {
                let stream,
                    reducedExecution,
                    executionId = currentExecution.cursor.ref;

                if (!_.has(traversedRequests, executionId)) {
                    // mark the current request instance as traversed
                    _.set(traversedRequests, executionId, 1);

                    // set the base assertion and cumulative test details for the current request instance
                    _.set(result, executionId, {});
                    _.set(netTestCounts, executionId, { passed: 0, failed: 0 });

                    // set base values for overall response size and time values
                    _.set(executionMeans, executionId, { time: { sum: 0, count: 0 }, size: { sum: 0, count: 0 } });

                    reducedExecution = _.pick(currentExecution, AGGREGATED_FIELDS);

                    if (reducedExecution.response && _.isFunction(reducedExecution.response.toJSON)) {
                        reducedExecution.response = reducedExecution.response.toJSON();
                        stream = reducedExecution.response.stream;
                        const responseStr = Buffer.from(stream)
                            .toString();

                        try {
                            reducedExecution.response.body = JSON.stringify(JSON.parse(responseStr), null, 2);
                        }
                        catch (e) {
                            reducedExecution.response.body = responseStr;
                        }
                    }

                    // set sample request and response details for the current request
                    items[reducedExecution.cursor.ref] = reducedExecution;
                }

                executionMeans[executionId].time.sum += _.get(currentExecution, 'response.responseTime', 0);
                executionMeans[executionId].size.sum += _.get(currentExecution, 'response.responseSize', 0);

                ++executionMeans[executionId].time.count;
                ++executionMeans[executionId].size.count;

                _.forEach(currentExecution.assertions, function (assertion) {
                    let aggregationResult,
                        assertionName = assertion.assertion,
                        isError = _.get(assertion, 'error') !== undefined,
                        updateKey = _.get(ASSERTION_STATE, isError);

                    result[executionId][assertionName] = result[executionId][assertionName] || {
                        name: assertionName,
                        passed: 0,
                        failed: 0
                    };
                    aggregationResult = result[executionId][assertionName];

                    ++aggregationResult[updateKey];
                    ++netTestCounts[executionId][updateKey];
                });
            }, {}),

            aggregator = function (execution) {
                // fetch aggregated run times and response sizes for items, (0 for failed requests)
                const aggregationMean = executionMeans[execution.cursor.ref],
                    meanTime = _.get(aggregationMean, 'time', 0),
                    meanSize = _.get(aggregationMean, 'size', 0),
                    parent = execution.item.parent(),
                    previous = _.last(aggregations),
                    current = _.merge(items[execution.cursor.ref], {
                        assertions: _.values(assertions[execution.cursor.ref]),
                        mean: {
                            time: util.prettyms(meanTime.sum / meanTime.count),
                            size: util.filesize(meanSize.sum / meanSize.count)
                        },
                        cumulativeTests: netTestCounts[execution.cursor.ref]
                    });

                if (aggregatedExecutions[execution.cursor.ref]) {
                    return;
                }

                aggregatedExecutions[execution.cursor.ref] = true;

                if (previous && parent.id === previous.parent.id) {
                    previous.executions.push(current);
                }
                else {
                    aggregations.push({
                        parent: {
                            id: parent.id,
                            name: util.getFullName(parent)
                        },
                        executions: [current]
                    });
                }
            },
            pageTitle = this.summary.collection.name;

        _.forEach(this.summary.run.executions, aggregator);

        let content = compiler({
            timestamp: Date(),
            version: collectionRunOptions.newmanVersion,
            aggregations: aggregations,
            summary: {
                stats: this.summary.run.stats,
                collection: this.summary.collection,
                globals: _.isObject(this.summary.globals) ? this.summary.globals : undefined,
                environment: _.isObject(this.summary.environment) ? this.summary.environment : undefined,
                failures: this.summary.run.failures,
                responseTotal: util.filesize(this.summary.run.transfers.responseTotal),
                responseAverage: util.prettyms(this.summary.run.timings.responseAverage),
                duration: util.prettyms(this.summary.run.timings.completed - this.summary.run.timings.started)
            }
        });

        if (options.username) {
            newman.on('done', uploadReport.bind(this, options, pageTitle, content));
        }

        if (options.export) {
            this.exports.push({
                name: 'confluence-reporter',
                default: 'newman-run-report.wiki',
                path: options.export,
                content: content
            });
        }
    });
};

module.exports = PostmanConfluenceReporter;
