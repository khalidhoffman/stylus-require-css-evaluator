const fs = require('fs'),
    path = require('path'),
    assert = require('assert'),

    stylus = require('stylus'),

    stylusSrcPath = path.join(__dirname, 'data/main.styl'),
    stylusSrc = fs.readFileSync(stylusSrcPath, 'utf8');

describe("RequireCSSEvaluator", function(){
    const requireCSSEvaluatorPlugin = require('../');

    it("has no bearing unless used", function(done){
        stylus(stylusSrc)
            .set('filename', stylusSrcPath)
            .render(function(err, str){
                if (err) throw err;
                assert.equal(str.indexOf('css-require-success') >= 0, false, "css test 'success' should not have been imported");
                done();
            })
    });

    it("imports interpolates css files using require", function(done){
        stylus(stylusSrc)
            .set('filename', stylusSrcPath)
            .use(requireCSSEvaluatorPlugin)
            .render(function(err, str){
                if (err) throw err;
                assert.equal(str.indexOf('css-require-success') >= 0, true, "css test 'success' should have been imported");
                done();
            })
    })
});