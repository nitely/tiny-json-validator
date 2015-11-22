"use strict";

let validator = require('..');


describe("Validator test suite", function() {

    beforeEach(function() {
        //...
    });

    afterEach(function() {
        //...
    });

    // Types
    it("handles object type", function() {
        var res = validator({type: 'object', properties: {}}, {});
        expect(res.isValid).toBe(true);
        expect(res.data).toEqual({});
    });

    it("handles nested object type", function() {
        var res = validator({type: 'object', properties: {foo: {type: 'object', properties: {}}}}, {});
        expect(res.isValid).toBe(true);
        expect(res.data).toEqual({});
    });

    it("handles array type", function() {
        var res = validator({type: 'array', items: {type: 'integer'}}, []);
        expect(res.isValid).toBe(true);
        expect(res.data).toEqual([]);
    });

    it("handles string type", function() {
        var res = validator({type: 'string'}, 'foo');
        expect(res.isValid).toBe(true);
        expect(res.data).toEqual('foo');
    });

    it("handles integer type", function() {
        var res = validator({type: 'integer'}, 1337);
        expect(res.isValid).toBe(true);
        expect(res.data).toEqual(1337);
    });

    it("throws on unknown type", function() {
        expect(validator, {type: 'bad_type'}, {}).toThrow();
    });

    // Validations: is required
    it("validates object is required", function() {
        var schema = {type: 'object', properties: {foo: {type: 'string', required: true}}};
        expect(validator(schema, {foo: 'what?'}).isValid).toBe(true);
        expect(validator(schema, {}).errors).toEqual({foo: 'is required'});
        expect(validator(schema, {}).data).toEqual({});
    });

    it("validates nested object is required", function() {
        var schema = {type: 'object', properties: {
            foo: {type: 'object', required: true, properties: {bar: {type: 'string', required: true}}}
        }};
        expect(validator(schema, {foo: {bar: 'sup?'}}).isValid).toBe(true);
        expect(validator(schema, {foo: {}}).errors).toEqual({'foo.bar': 'is required'});
        expect(validator(schema, {foo: {}}).data).toEqual({foo: {}});
    });

    it("validates nested object is not required when " +
        "parent is not required and parent was not submitted", function() {
        var schema = {type: 'object', properties: {
            foo: {type: 'object', properties: {bar: {type: 'string', required: true}}}
        }};
        expect(validator(schema, {foo: {bar: 'sup?'}}).isValid).toBe(true);
        expect(validator(schema, {}).errors).toEqual({});
        expect(validator(schema, {}).data).toEqual({});
    });

    it("validates array is required", function() {
        var schema = {type: 'array', required: true, items: {type: 'integer'}};
        expect(validator(schema, [1337]).isValid).toBe(true);
        expect(validator(schema, [1337]).data).toEqual([1337]);
        expect(validator(schema, []).isValid).toBe(true);  // You are probably looking for minItems here, bad luck brian.
        expect(validator(schema, []).data).toEqual([]);
    });

    it("validates string is required", function() {
        var schema = {type: 'string', required: true};
        expect(validator(schema, '1337').isValid).toBe(true);
        expect(validator(schema).errors).toEqual({root: 'is required'});
        expect(validator(schema).data).toEqual(undefined);
    });

    it("validates integer is required", function() {
        var schema = {type: 'integer', required: true};
        expect(validator(schema, 1337).isValid).toBe(true);
        expect(validator(schema).errors).toEqual({root: 'is required'});
        expect(validator(schema).data).toEqual(undefined);
    });

    // Validations: type
    it("validates object type", function() {
        expect(validator({type: 'object', properties: {}}, []).errors).toEqual({root: 'type must be object'});
    });

    it("validates nested object type", function() {
        expect(validator({type: 'object', properties: {foo: {type: 'object', properties: {}}}}, {foo: []}).errors).toEqual({ foo: 'type must be object' });
    });

    it("validates array type", function() {
        var schema = {type: 'array', items: {type: 'integer'}};
        expect(validator(schema, '1337').errors).toEqual({root: 'type must be array' });
        expect(validator(schema, ['1337']).errors).toEqual({0: 'type must be integer'});
    });

    it("validates string type", function() {
        expect(validator({type: 'string'}, 1337).errors).toEqual({ root: 'type must be string' });
    });

    it("validates integer type", function() {
        expect(validator({type: 'integer'}, '1337').errors).toEqual({ root: 'type must be integer' });
    });

    // Validations: format
    it("validates date-time format", function() {
        var schema = {type: 'string', format: 'date-time'};
        expect(validator(schema, '2010-06-09T15:20:00Z').isValid).toBe(true);
        expect(validator(schema, '(-_____- U)').errors).toEqual({ root: 'format must be date-time' });
    });

    it("validates date format", function() {
        var schema = {type: 'string', format: 'date'};
        expect(validator(schema, '2010-06-09').isValid).toBe(true);
        expect(validator(schema, 'U_____U').errors).toEqual({ root: 'format must be date' });
    });

    it("validates time format", function() {
        var schema = {type: 'string', format: 'time'};
        expect(validator(schema, '15:20:00').isValid).toBe(true);
        expect(validator(schema, '?____?').errors).toEqual({ root: 'format must be time' });
    });

    it("validates email format", function() {
        var schema = {type: 'string', format: 'email'};
        expect(validator(schema, 'geezchrist@gmail.com').isValid).toBe(true);
        expect(validator(schema, 'T____T').errors).toEqual({ root: 'format must be email' });
    });

    it("validates ip-address format", function() {
        var schema = {type: 'string', format: 'ip-address'};
        expect(validator(schema, '11.111.111.111').isValid).toBe(true);
        expect(validator(schema, '<____<').errors).toEqual({ root: 'format must be ip-address' });
    });

    it("validates ipv4 format", function() {
        var schema = {type: 'string', format: 'ipv4'};
        expect(validator(schema, '11.111.111.111').isValid).toBe(true);
        expect(validator(schema, '>____>').errors).toEqual({ root: 'format must be ipv4' });
    });

    it("validates ipv6 format", function() {
        var schema = {type: 'string', format: 'ipv6'};
        expect(validator(schema, 'FE80:0000:0000:0000:0202:B3FF:FE1E:8329').isValid).toBe(true);
        expect(validator(schema, 'o____O').errors).toEqual({ root: 'format must be ipv6' });
    });

    it("validates uri format", function() {
        var schema = {type: 'string', format: 'uri'};
        expect(validator(schema, 'localhost:1337').isValid).toBe(true);
        expect(validator(schema, 'o___o').errors).toEqual({ root: 'format must be uri' });
    });

    it("validates color format", function() {
        var schema = {type: 'string', format: 'color'};
        expect(validator(schema, '#FFF').isValid).toBe(true);
        expect(validator(schema, '#FFFFFF').isValid).toBe(true);
        expect(validator(schema, 'white').isValid).toBe(true);
        expect(validator(schema, 'D____D').errors).toEqual({ root: 'format must be color' });
    });

    it("validates hostname format", function() {
        var schema = {type: 'string', format: 'hostname'};
        expect(validator(schema, 'tedmosbyisajerk.com').isValid).toBe(true);
        expect(validator(schema, 'himym?').errors).toEqual({ root: 'format must be hostname' });
    });

    it("validates alpha format", function() {
        var schema = {type: 'string', format: 'alpha'};
        expect(validator(schema, 'Marshall').isValid).toBe(true);
        expect(validator(schema, 'Ted000').errors).toEqual({ root: 'format must be alpha' });
    });

    it("validates alphanumeric format", function() {
        var schema = {type: 'string', format: 'alphanumeric'};
        expect(validator(schema, 'Lily000').isValid).toBe(true);
        expect(validator(schema, 'Robin?').errors).toEqual({ root: 'format must be alphanumeric' });
    });

    it("validates style format", function() {
        var schema = {type: 'string', format: 'style'};
        expect(validator(schema, 'display:none;').isValid).toBe(true);
        expect(validator(schema, '???').errors).toEqual({ root: 'format must be style' });
    });

    it("validates phone format", function() {
        var schema = {type: 'string', format: 'phone'};
        expect(validator(schema, '+54123123123').isValid).toBe(true);
        expect(validator(schema, '???').errors).toEqual({ root: 'format must be phone' });
    });

    it("validates utc-millisec format", function() {
        var schema = {type: 'string', format: 'utc-millisec'};
        expect(validator(schema, '123123123123').isValid).toBe(true);
        expect(validator(schema, '???').errors).toEqual({ root: 'format must be utc-millisec' });
    });

    // Cleaned data
    it("does not contain extra properties", function() {
        var schema = {type: 'object', properties: {foo: {type: 'string'}}};
        var data = {foo: '1337', bar: 123};
        expect(validator(schema, data).isValid).toBe(true);
        expect(validator(schema, data).data).toEqual({foo: '1337'});
        expect(data).toEqual({foo: '1337', bar: 123});  // Should not mutate data
    });

    it("does not contain nested extra properties", function() {
        var schema = {type: 'object', properties: {foo: {type: 'object', properties: {bar: {type: 'string'}}}}};
        var data = {foo: {bar: '1337', foo2: 123}, bar2: 123};
        expect(validator(schema, data).isValid).toBe(true);
        expect(validator(schema, data).data).toEqual({foo: {bar: '1337'}});
        expect(data).toEqual({foo: {bar: '1337', foo2: 123}, bar2: 123});  // Should not mutate data
    });

    it("does not contain extra properties from array items", function() {
        var schema = {type: 'array', items: {type: 'object', properties: {foo: {type: 'string'}}}};
        var data = [{foo: '1337', bar: 123}, {bar: 123}];
        expect(validator(schema, data).isValid).toBe(true);
        expect(validator(schema, data).data).toEqual([{foo: '1337'}, {}]);
        expect(data).toEqual([{foo: '1337', bar: 123}, {bar: 123}]);  // Should not mutate data
    });

    it("keeps valid array items from invalid array", function() {
        var schema = {type: 'array', items: {type: 'string'}};
        var data = ['1337', 1337, '1337', 700, 'foo'];
        expect(validator(schema, data).isValid).toBe(false);
        expect(validator(schema, data).data).toEqual(['1337', '1337', 'foo']);
    });


});

