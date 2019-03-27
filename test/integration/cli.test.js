const fs = require('fs'),
    http = require('http');

describe('Newman CLI', function () {
    let callCounter, server;
    const outFile = 'out/newman-report.wiki',
        newman = 'node ./.temp/node_modules/newman/bin/newman.js',
        hostname = '0.0.0.0',
        port = 8081;

    before(function (done) {
        server = http.createServer((req, res) => {
            callCounter++;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Hello World\n');
        });

        server.listen(port, hostname, done);
    });

    after(function () {
        server.close();
    });

    beforeEach(function (done) {
        fs.stat('out', function (err) {
            callCounter = 0;
            if (err) {
                return fs.mkdir('out', done);
            }

            done();
        });
    });

    afterEach(function (done) {
        fs.stat(outFile, function (err) {
            if (err) {
                return done();
            }

            fs.unlink(outFile, done);
        });
    });

    it('should correctly generate the report for a successful run', function (done) {
        // eslint-disable-next-line max-len
        exec(`${newman} run test/fixtures/single-get-request.json -r confluence --reporter-confluence-export ${outFile}`,
            function (code) {
                expect(code, 'should have exit code of 0').to.equal(0);
                fs.stat(outFile, done);
            });
    });

    it('should correctly generate the report for a failed run', function (done) {
        // eslint-disable-next-line max-len
        exec(`${newman} run test/fixtures/single-request-failing.json -r confluence --reporter-confluence-export ${outFile}`,
            function (code) {
                expect(code, 'should have exit code of 1').to.equal(1);
                fs.stat(outFile, done);
            });
    });

    it('should correctly produce the report for a run with TypeError', function (done) {
        // eslint-disable-next-line max-len
        exec(`${newman} run test/fixtures/newman-report-test.json -r confluence --reporter-confluence-export ${outFile}`,
            function (code) {
                expect(code, 'should have exit code of 1').to.equal(1);
                fs.stat(outFile, done);
            });
    });

    it('should correctly produce the report for a run with one or more failed requests', function (done) {
        // eslint-disable-next-line max-len
        exec(`${newman} run test/fixtures/failed-request.json -r confluence --reporter-confluence-export ${outFile}`,
            function (code) {
                expect(code, 'should have exit code of 1').to.equal(1);
                fs.stat(outFile, done);
            });
    });

    it('should call the server for report upload', function (done) {
        // eslint-disable-next-line max-len
        exec(`${newman} run test/fixtures/single-get-request.json -r confluence --reporter-confluence-export ${outFile}
            --reporter-confluence-username test
            --reporter-confluence-password test
            --reporter-confluence-baseUrl localhost:${port}
            --reporter-confluence-spaceId 1
            --reporter-confluence-parentId 1`,
        function (code) {
            expect(code, 'should have exit code of 0').to.equal(0);
            expect(callCounter).to.equal(1);
            done();
        });
    });
});
