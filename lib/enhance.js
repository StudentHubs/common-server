"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rgo_1 = require("rgo");
const common_1 = require("common");
const keys_to_object_1 = require("keys-to-object");
exports.previous = (knex) => rgo_1.enhancers.onUpdate(async ({ type, id }, { context }) => {
    context.previous = context.previous || {};
    context.previous[type] = context.previous[type] || {};
    if (id) {
        context.previous[type][id] =
            (id &&
                (await knex(type)
                    .where('id', id)
                    .first())) ||
                null;
    }
});
exports.formulae = rgo_1.enhancers.onUpdate(async ({ type, id, record }, { schema, context: { previous } }) => {
    const prev = previous[type][id] || null;
    if (record) {
        const fields = Object.keys(schema[type]).filter(f => schema[type][f].meta && schema[type][f].meta.formula);
        const values = await Promise.all(fields.map(f => schema[type][f].meta.formula({ type, id, record, previous: prev })));
        return keys_to_object_1.default(fields, (_, i) => values[i]);
    }
});
exports.logging = rgo_1.enhancers.onUpdate(async ({ type, id, record }, { context: { previous } }) => {
    const prev = previous[type][id] || null;
    if (record) {
        if (id) {
            console.log(`rgo-commit-update, ${type}:${id}, ` +
                `old: ${JSON.stringify(prev)}, new: ${JSON.stringify(record)}`);
        }
        else {
            console.log(`rgo-commit-insert, ${type}, new: ${JSON.stringify(record)}`);
        }
    }
    else if (id) {
        console.log(`rgo-commit-delete, ${type}:${id}, old: ${JSON.stringify(prev)}`);
    }
});
exports.validate = rgo_1.enhancers.onUpdate(async ({ type, record }, { schema }) => {
    if (record) {
        for (const f of Object.keys(record)) {
            if (!common_1.isValid(Object.assign({ scalar: schema[type][f].scalar || 'string', optional: true }, schema[type][f].meta), record[f], record)) {
                throw new Error('Invalid data');
            }
        }
    }
});
