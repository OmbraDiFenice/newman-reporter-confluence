const fs = require('fs'),
    http = require('http');

describe('Newman Library', function () {
    let callCounter, server;
    const outFile = 'out/newman-report.wiki',
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
        newman.run({
            collection: 'test/fixtures/single-get-request.json',
            reporters: ['confluence'],
            reporter: { confluence: { export: outFile } }
        }, function (err) {
            if (err) { return done(err); }

            fs.stat(outFile, done);
        });
    });

    it('should correctly generate the report for a failed run', function (done) {
        newman.run({
            collection: 'test/fixtures/single-request-failing.json',
            reporters: ['confluence'],
            reporter: { confluence: { export: outFile } }
        }, function (err, summary) {
            expect(err).to.be.null;
            expect(summary.run.failures, 'should have 1 failure').to.have.lengthOf(1);
            fs.stat(outFile, done);
        });
    });

    it('should correctly produce the report for a run with AssertionError/TypeError', function (done) {
        newman.run({
            collection: 'test/fixtures/newman-report-test.json',
            reporters: ['confluence'],
            reporter: { confluence: { export: outFile } }
        }, function (err, summary) {
            expect(err).to.be.null;
            expect(summary.run.failures, 'should have 2 failures').to.have.lengthOf(2);
            fs.stat(outFile, done);
        });
    });

    it('should correctly produce the report for a run with one or more failed requests', function (done) {
        newman.run({
            collection: 'test/fixtures/failed-request.json',
            reporters: ['confluence'],
            reporter: { confluence: { export: outFile } }
        }, function (err, summary) {
            expect(err).to.be.null;
            expect(summary.run.failures, 'should have 1 failure').to.have.lengthOf(1);
            fs.stat(outFile, done);
        });
    });

    it('should call the server for report upload', function (done) {
        newman.run({
            collection: 'test/fixtures/single-get-request.json',
            reporters: ['confluence'],
            reporter: { confluence: { export: outFile, username: 'test', password: 'test', baseUrl: `http://localhost:${port}`, spaceId: 1, parentId: 1 } }
        }, function (err) {
            expect(err).to.be.null;
            expect(callCounter).to.equal(1);
            done();
        });
    });
});
