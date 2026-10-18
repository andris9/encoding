'use strict';

const test = require('node:test');
const assert = require('node:assert').strict;

const encoding = require('../lib/encoding');

test('General tests', async t => {
    await t.test('From UTF-8 to Latin_1', () => {
        assert.deepEqual(encoding.convert('ÕÄÖÜ', 'latin1'), Buffer.from([0xd5, 0xc4, 0xd6, 0xdc]));
    });

    await t.test('From Latin_1 to UTF-8', () => {
        assert.equal(encoding.convert(Buffer.from([0xd5, 0xc4, 0xd6, 0xdc]), 'utf-8', 'latin1').toString(), 'ÕÄÖÜ');
    });

    await t.test('From UTF-8 to UTF-8', () => {
        assert.deepEqual(encoding.convert('ÕÄÖÜ', 'utf-8', 'utf-8'), Buffer.from('ÕÄÖÜ'));
    });

    await t.test('From Latin_13 to Latin_15', () => {
        assert.deepEqual(encoding.convert(Buffer.from([0xd5, 0xc4, 0xd6, 0xdc, 0xd0]), 'latin_15', 'latin13'), Buffer.from([0xd5, 0xc4, 0xd6, 0xdc, 0xa6]));
    });

    // ISO-2022-JP is not supported by iconv-lite, so there is no test converting from it
});
