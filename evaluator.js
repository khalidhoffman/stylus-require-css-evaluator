"use strict";

const fs = require('fs'),

    // stylus dependencies
    Evaluator = require('stylus/lib/visitor/evaluator'),
    utils = require('stylus/lib/utils'),
    nodes = require('stylus/lib/nodes'),
    debug = require('debug')('stylus:evaluator'),
    dirname = require('path').dirname;

class RequireCSSEvaluator extends Evaluator {

    visitImport(imported) {

        this.return++;

        var path = this.visit(imported.path).first
            , nodeName = imported.once ? 'require' : 'import'
            , found
            , literal;

        this.return--;
        debug('import %s', path);

        // url() passed
        if ('url' == path.name) {
            if (imported.once) throw new Error('You cannot @require a url');

            return imported;
        }

        // Ensure string
        if (!path.string) throw new Error('@' + nodeName + ' string expected');

        var name = path = path.string;

        // Absolute URL or hash
        if (/(?:url\s*\(\s*)?['"]?(?:#|(?:https?:)?\/\/)/i.test(path)) {
            if (imported.once) throw new Error('You cannot @require a url');
            return imported;
        }

        // Literal
        if (/\.css(?:"|$)/.test(path)) {
            if (nodeName != 'require') {
                literal = true;
                if (!imported.once && !this.includeCSS) {
                    return imported;
                }
            }
        } else {
            // support optional .styl
            if (!literal && !/\.styl$/i.test(path)) path += '.styl';
        }

        // Lookup
        found = utils.find(path, this.paths, this.filename);
        if (!found) {
            found = utils.lookupIndex(name, this.paths, this.filename);
        }

        // Throw if import failed
        if (!found) throw new Error('failed to locate @' + nodeName + ' file ' + path);

        var block = new nodes.Block;

        for (var i = 0, len = found.length; i < len; ++i) {
            block.push(RequireCSSEvaluator.importFile.call(this, imported, found[i], literal));
        }

        return block;
    }

    static importFile(node, file, literal) {
        var importStack = this.importStack
            , Parser = require('stylus/lib/parser')
            , stat;

        // Handling the `require`
        if (node.once) {
            if (this.requireHistory[file]) return nodes.null;
            this.requireHistory[file] = true;

            if (literal && !this.includeCSS) {
                return node;
            }
        }

        // Avoid overflows from importing the same file over again
        if (~importStack.indexOf(file))
            throw new Error('import loop has been found');

        var str = fs.readFileSync(file, 'utf8');

        // shortcut for empty files
        if (!str.trim()) return nodes.null;

        // Expose imports
        node.path = file;
        node.dirname = dirname(file);
        // Store the modified time
        stat = fs.statSync(file);
        node.mtime = stat.mtime;
        this.paths.push(node.dirname);

        if (this.options._imports) this.options._imports.push(node.clone());

        // Parse the file
        importStack.push(file);
        nodes.filename = file;

        if (literal) {
            literal = new nodes.Literal(str.replace(/\r\n?/g, '\n'));
            literal.lineno = literal.column = 1;
            if (!this.resolveURL) return literal;
        }

        // parse
        var block = new nodes.Block
            , parser = new Parser(str, utils.merge({root: block}, this.options));

        try {
            block = parser.parse();
        } catch (err) {
            var line = parser.lexer.lineno
                , column = parser.lexer.column;

            if (literal && this.includeCSS && this.resolveURL) {
                this.warn('ParseError: ' + file + ':' + line + ':' + column + '. This file included as-is');
                return literal;
            } else {
                err.filename = file;
                err.lineno = line;
                err.column = column;
                err.input = str;
                throw err;
            }
        }

        // Evaluate imported "root"
        block = block.clone(this.currentBlock);
        block.parent = this.currentBlock;
        block.scope = false;
        var ret = this.visit(block);
        importStack.pop();
        if (!this.resolveURL || this.resolveURL.nocheck) this.paths.pop();

        return ret;
    }

}

module.exports = RequireCSSEvaluator;
