# Tiny JSON validator

[![Build Status](https://img.shields.io/travis/nitely/tiny-json-validator/master.svg?style=flat-square)](https://travis-ci.org/nitely/tiny-json-validator)
[![npm](https://img.shields.io/npm/v/tiny-json-validator.svg?style=flat-square)](https://www.npmjs.com/package/tiny-json-validator)

A Node.js lib that has *less lines than this readme™*.

It supports a tiny subset of the [json schema](http://json-schema.org/) specs. The main goal of this project is
to provide a nice and easy to follow implementation of a json validator. You may fork it and extend it as you please.

Release versioning follows [SemVer](http://semver.org/).

# Installation

```
$ npm install tiny-json-validator
```

It is supported in all versions of [Node.js(https://nodejs.org) +4.2 without any flags.

# Example

```javascript
"use strict";

let validator = require('tiny-json-validator');


let book_schema = {
    type: 'object',
    required: true,
    properties: {
        title: {
            type: 'string',
            required: true
        },
        author: {
            type: 'object',
            required: true,
            properties: {
                name: {
                    type: 'string',
                    required: true
                },
                age: {
                    type: 'integer',
                    required: true
                },
                city: {
                    type: 'string'
                }
            }
        },
        related_titles: {
            type: 'array',
            required: true,
            items: {
                type: 'string'
            }
        }
    }
};

let data = {
    title: 'A Game of Thrones',
    author: {
        name: 'George R. R. Marti'
    },
    related_titles: [1, 2, 'A Song of Ice and Fire'],
    extra: 'this will get removed'
};

let res = validator(book_schema, data);

res.isValid
// false

res.errors
// {author.age: "is required", related_titles.0: 'type must be string', related_titles.1: 'type must be string'}

res.data
// {title: 'A Game of Thrones', author: {name: 'George R. R. Marti'}, related_titles: ['A Song of Ice and Fire']}
```

# Running tests

```
$ npm run test
```

## License

MIT