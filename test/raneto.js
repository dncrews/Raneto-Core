var chai = require('chai'),
    should = chai.should(),
    expect = chai.expect,
    raneto = require('../raneto');

chai.config.truncateThreshold = 0;

describe('#cleanString()', function() {
	it('converts "Hello World" into "hello-world"', function() {
		raneto.cleanString('Hello World').should.equal('hello-world');
	});

	it('converts "/some/direcoty-example/hello/" into "some-direcoty-example-hello"', function() {
		raneto.cleanString('/some/direcoty-example/hello/').should.equal('some-direcoty-example-hello');
	});

    it('converts "with trailing space " into "with-trailing-space"', function() {
        raneto.cleanString('with trailing space ').should.equal('with-trailing-space');
    });

    it('converts "also does underscores" into "also_does_underscores"', function() {
        raneto.cleanString('also does underscores', true).should.equal('also_does_underscores');
    });

    it('converts "/some/direcoty-example/underscores/" into "some_direcoty_example_underscores"', function() {
        raneto.cleanString('/some/direcoty-example/underscores/', true).should.equal('some_direcoty_example_underscores');
    });
});

describe('#slugToTitle()', function() {
    it('converts "hello-world" into "Hello World"', function() {
        raneto.slugToTitle('hello-world').should.equal('Hello World');
    });

    it('converts "dir/some-example-file.md" into "Some Example File"', function() {
        raneto.slugToTitle('dir/some-example-file.md').should.equal('Some Example File');
    });
});

describe('#processMeta()', function() {
    it('returns array of meta values', function() {
        var result = raneto.processMeta('/*\n'+
            'Title: This is a title\n'+
            'Description: This is a description\n'+
            'Sort: 4\n'+
            'Multi word: Value\n'+
            '*/\n');
        expect(result).to.have.property('title', 'This is a title');
        expect(result).to.have.property('description', 'This is a description');
        expect(result).to.have.property('sort', '4');
        expect(result).to.have.property('multi_word', 'Value');
    });
    it('returns an empty array if no meta specified', function() {
        var result = raneto.processMeta('no meta here');
        expect(result).to.be.empty;
    });
});

describe('#stripMeta()', function() {
    it('strips meta comment block', function() {
        var result = raneto.stripMeta('/*\n'+
            'Title: This is a title\n'+
            'Description: This is a description\n'+
            'Sort: 4\n'+
            'Multi word: Value\n'+
            '*/\nThis is the content');
        result.should.equal('This is the content');
    });
    it('leaves content if no meta comment block', function() {
        var result = raneto.stripMeta('This is the content');
        result.should.equal('This is the content');
    });
    it('only strips the first comment block', function() {
        var result = raneto.stripMeta('/*\n'+
            'Title: This is a title\n'+
            'Description: This is a description\n'+
            'Sort: 4\n'+
            'Multi word: Value\n'+
            '*/\nThis is the content/*\n'+
            'Title: This is a title\n'+
            '*/');
        result.should.equal('This is the content/*\n'+
        'Title: This is a title\n'+
        '*/');
    });
});

describe('#processVars()', function() {
    it('replaces config vars in Markdown content', function() {
        raneto.processVars(
            'This is some Markdown with a %base_url%.',
            {
                base_url: '/base/url'
            }
        ).should.equal('This is some Markdown with a /base/url.');
    });
});

describe('#getPage()', function() {
    it('returns an array of values for a given page', function() {
        raneto.contentDir = __dirname +'/content/';
        var result = raneto.getPage(raneto.contentDir +'example-page.md');
        expect(result).to.have.property('slug', 'example-page');
        expect(result).to.have.property('title', 'Example Page');
        expect(result).to.have.property('body');
        expect(result).to.have.property('excerpt');
    });
    it('returns null if no page found', function() {
        raneto.contentDir = __dirname +'/content/';
        var result = raneto.getPage(raneto.contentDir +'nonexistent-page.md');
        expect(result).to.be.null;
    });
});

describe('#getPages()', function() {
    it('returns an array of categories and pages', function() {
        raneto.contentDir = __dirname +'/content/';
        var result = raneto.getPages();
        expect(result[0]).to.have.property('is_index', true);
        expect(result[0].files[0]).to.have.property('title', 'Example Page');
        expect(result[1]).to.have.property('slug', 'sub');
        expect(result[1].files[0]).to.have.property('title', 'Example Sub Page');
    });
    it('marks activePageSlug as active', function() {
        raneto.contentDir = __dirname +'/content/';
        var result = raneto.getPages('/example-page');
        expect(result[0].files[0]).to.have.property('active', true);
        expect(result[1].files[0]).to.have.property('active', false);
    });
});

describe('#doSearch()', function() {
    it('returns an array of search results', function() {
        raneto.contentDir = __dirname +'/content/';
        var result = raneto.doSearch('example');
        expect(result).to.have.length(2);
    });
    it('returns an empty array if nothing found', function() {
        raneto.contentDir = __dirname +'/content/';
        var result = raneto.doSearch('asdasdasd');
        expect(result).to.be.empty;
    });
});