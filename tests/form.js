QUnit.module("Form Validate");
QUnit.test("validate required", function (assert) {
    assert.ok(NR.form.validate('required', 'qualquer coisa', ''), "Diferent of undefined");
    assert.ok(!NR.form.validate('required'), "undefined test");
    assert.ok(!NR.form.validate('required', false), "false test");
    assert.ok(!NR.form.validate('required', null), "null test");
});

QUnit.test("validate min_length", function (assert) {
    assert.ok(NR.form.validate('min_length', 'teste', '3'), "more than 3");
    assert.ok(!NR.form.validate('min_length', 'te', '3'), "less than 3");
    assert.ok(NR.form.validate('min_length', 'tes', '3'), "equals than 3");
});

QUnit.test("validate max_length", function (assert) {
    assert.ok(!NR.form.validate('max_length', 'teste', '3'), "more than 3");
    assert.ok(NR.form.validate('max_length', 'te', '3'), "less than 3");
    assert.ok(NR.form.validate('max_length', 'tes', '3'), "equals than 3");
});

QUnit.test("validate exact_length", function (assert) {
    assert.ok(!NR.form.validate('exact_length', 'teste', '3'), "more than 3");
    assert.ok(!NR.form.validate('exact_length', 'te', '3'), "less than 3");
    assert.ok(NR.form.validate('exact_length', 'tes', '3'), "equals than 3");
});

QUnit.test("validate greater_than", function (assert) {
    assert.ok(NR.form.validate('greater_than', 10, '3'), "more than 3 number");
    assert.ok(!NR.form.validate('greater_than', -2, '3'), "less than 3 number");
    assert.ok(NR.form.validate('greater_than', 3, '3'), "equals than 3 number");
    assert.ok(NR.form.validate('greater_than', '10', '3'), "more than 3 string");
    assert.ok(!NR.form.validate('greater_than', '-2', '3'), "less than 3 string");
    assert.ok(NR.form.validate('greater_than', '3', '3'), "equals than 3 string");
    assert.ok(!NR.form.validate('greater_than', 'aaaa', '3'), "invalid number");
});

QUnit.test("validate less_than", function (assert) {
    assert.ok(!NR.form.validate('less_than', 10, '3'), "more than 3 number");
    assert.ok(NR.form.validate('less_than', -2, '3'), "less than 3 number");
    assert.ok(NR.form.validate('less_than', 3, '3'), "equals than 3 number");
    assert.ok(!NR.form.validate('less_than', '10', '3'), "more than 3 string");
    assert.ok(NR.form.validate('less_than', '-2', '3'), "less than 3 string");
    assert.ok(NR.form.validate('less_than', '3', '3'), "equals than 3 string");
    assert.ok(!NR.form.validate('less_than', 'aaaa', '3'), "invalid number");
});

QUnit.test("validate alpha", function (assert) {
    assert.ok(!NR.form.validate('alpha', 10), "number");
    assert.ok(NR.form.validate('alpha', 'abc'), "alpha");
    assert.ok(!NR.form.validate('alpha', 'abc2'), "alpha + number");
    assert.ok(!NR.form.validate('alpha', 'a bc'), "espace");
    assert.ok(!NR.form.validate('alpha', 'a_bc'), "underline");
    assert.ok(!NR.form.validate('alpha', 'a-bc'), "underscore");
    assert.ok(!NR.form.validate('alpha', 'açbc'), "other character");
    assert.ok(!NR.form.validate('alpha', 'aábc'), "other character");
    assert.ok(!NR.form.validate('alpha', 'a=bc'), "other character");
    assert.ok(!NR.form.validate('alpha', 'a.bc'), "other character");
});

QUnit.test("validate alpha_numeric", function (assert) {
    assert.ok(NR.form.validate('alpha_numeric', 10), "number");
    assert.ok(NR.form.validate('alpha_numeric', 'abc'), "alpha");
    assert.ok(NR.form.validate('alpha_numeric', 'abc2'), "alpha + number");
    assert.ok(!NR.form.validate('alpha_numeric', 'a bc'), "espace");
    assert.ok(!NR.form.validate('alpha_numeric', 'a_bc'), "underline");
    assert.ok(!NR.form.validate('alpha_numeric', 'a-bc'), "underscore");
    assert.ok(!NR.form.validate('alpha_numeric', 'açbc'), "other character");
    assert.ok(!NR.form.validate('alpha_numeric', 'aábc'), "other character");
    assert.ok(!NR.form.validate('alpha_numeric', 'a=bc'), "other character");
    assert.ok(!NR.form.validate('alpha_numeric', 'a.bc'), "other character");
});

QUnit.test("validate alpha_dash", function (assert) {
    assert.ok(NR.form.validate('alpha_dash', 10), "number");
    assert.ok(NR.form.validate('alpha_dash', 'abc'), "alpha");
    assert.ok(NR.form.validate('alpha_dash', 'abc2'), "alpha + number");
    assert.ok(!NR.form.validate('alpha_dash', 'a bc'), "espace");
    assert.ok(NR.form.validate('alpha_dash', 'a_bc'), "underline");
    assert.ok(NR.form.validate('alpha_dash', 'a-bc'), "underscore");
    assert.ok(!NR.form.validate('alpha_dash', 'açbc'), "other character");
    assert.ok(!NR.form.validate('alpha_dash', 'aábc'), "other character");
    assert.ok(!NR.form.validate('alpha_dash', 'a=bc'), "other character");
    assert.ok(!NR.form.validate('alpha_dash', 'a.bc'), "other character");
});

QUnit.test("validate numeric", function (assert) {
    assert.ok(NR.form.validate('numeric', 10), "number");
    assert.ok(NR.form.validate('numeric', '10'), "string");
    assert.ok(NR.form.validate('numeric', -10), "negative");
    assert.ok(NR.form.validate('numeric', '-10'), "negative string");
    assert.ok(NR.form.validate('numeric', 1.2), "float");
    assert.ok(NR.form.validate('numeric', '1.2'), "float string");
    assert.ok(NR.form.validate('numeric', -1.2), "negative float");
    assert.ok(NR.form.validate('numeric', '-1.2'), "negative float string");
    assert.ok(!NR.form.validate('numeric', 'asd1'), "another character");
});

QUnit.test("validate is_natural", function (assert) {
    assert.ok(NR.form.validate('is_natural', 10), "number");
    assert.ok(NR.form.validate('is_natural', '10'), "string");
    assert.ok(!NR.form.validate('is_natural', -10), "negative");
    assert.ok(!NR.form.validate('is_natural', '-10'), "negative string");
    assert.ok(!NR.form.validate('is_natural', 1.2), "float");
    assert.ok(!NR.form.validate('is_natural', '1.2'), "float string");
    assert.ok(!NR.form.validate('is_natural', -1.2), "negative float");
    assert.ok(!NR.form.validate('is_natural', '-1.2'), "negative float string");
    assert.ok(!NR.form.validate('is_natural', 'asd1'), "another character");
});

QUnit.test("validate valid_email", function (assert) {
    assert.ok(NR.form.validate('valid_email', 'teste@teste.com'), "valid 1");
    assert.ok(NR.form.validate('valid_email', 'teste@t.te'), "valid 2");
    assert.ok(!NR.form.validate('valid_email', 'teste'), "invalid 1");
    assert.ok(!NR.form.validate('valid_email', 'teste.com'), "invalid 2");
    assert.ok(!NR.form.validate('valid_email', '@teste.com'), "invalid 3");
});

QUnit.test("validate valid_emails", function (assert) {
    assert.ok(NR.form.validate('valid_emails', 'teste@teste.com,teste@t.te,'), "valid");
    assert.ok(!NR.form.validate('valid_emails', 'teste,teste@teste.com'), "invalid");
});

QUnit.test("validate valid_ip", function (assert) {
    assert.ok(NR.form.validate('valid_ip', '192.168.0.1'), "valid 1");
    assert.ok(NR.form.validate('valid_ip', '8.8.8.8'), "valid 2");
    assert.ok(!NR.form.validate('valid_ip', '8.8.8.'), "invalid 1");
    assert.ok(!NR.form.validate('valid_ip', '...1'), "invalid 2");
    assert.ok(!NR.form.validate('valid_ip', '1234.45.14.1'), "invalid 3");
});