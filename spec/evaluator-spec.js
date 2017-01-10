const fs = require('fs'),
    path = require('path'),
    assert = require('assert'),

    stylus = require('stylus'),

    stylusSrcPath = path.join(__dirname, 'data/main.styl'),
    stylusSrc = fs.readFileSync(stylusSrcPath, 'utf8');

describe("RequireCSSEvaluator", function(){
    it("imports interpolates css files using require", function(done){
        stylus(stylusSrc)
            .set('filename', stylusSrcPath)
            .use(require('../index'))
            .render(function(err, str){
                if (err) throw err;
                assert.equal(str.indexOf('css-require-success') >= 0, true, "css test 'success' should have been imported");
                done();
            })
    })
});