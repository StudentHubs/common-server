"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rgo_1 = require("rgo");
const common_1 = require("common");
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
exports.timestamps = rgo_1.enhancers.onUpdate(async ({ id, record }) => {
    if (record) {
        const time = new Date();
        return Object.assign({}, id || record.createdat ? {} : { createdat: time }, record.modifiedat ? {} : { modifiedat: time });
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
