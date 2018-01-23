"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rgo_1 = require("rgo");
const keys_to_object_1 = require("keys-to-object");
const uuid = require("uuid/v1");
const sqlScalars = {
    boolean: 'BOOLEAN',
    int: 'INTEGER',
    float: 'FLOAT',
    string: 'TEXT',
    date: 'TIMESTAMPTZ',
    file: 'TEXT',
    json: 'JSON',
};
const applyFilter = (knex, typeFields, filter, isOr) => {
    if (['AND', 'OR'].includes(filter[0])) {
        return knex.where(function () {
            filter
                .slice(1)
                .forEach(f => applyFilter(this, typeFields, f, filter[0] === 'OR'));
        });
    }
    const op = filter.length === 3 ? filter[1] : '=';
    const value = filter[filter.length - 1];
    if (value === null && ['=', '!='].includes(op)) {
        return knex[`${isOr ? 'orWhere' : 'where'}${op === '=' ? 'Null' : 'NotNull'}`](filter[0]);
    }
    const field = typeFields[filter[0]];
    if (field &&
        rgo_1.fieldIs.scalar(field) &&
        field.isList &&
        ['=', '!='].includes(op)) {
        return knex[isOr ? 'orWhereRaw' : 'whereRaw'](op === '='
            ? `? = ANY(${filter[0]})`
            : `? != ALL(COALESCE(${filter[0]}, '{}'))`, [value]);
    }
    if (op === '!=') {
        return knex[isOr ? 'orWhereRaw' : 'whereRaw'](`${filter[0]} IS DISTINCT FROM ?`, [value]);
    }
    return knex[isOr ? 'orWhere' : 'where'](filter[0], op, value);
};
async function sqlResolver(knex, schema, owner) {
    const types = Object.keys(schema);
    const dbFields = keys_to_object_1.default(types, type => keys_to_object_1.default(Object.keys(schema[type]).filter(f => !rgo_1.fieldIs.foreignRelation(schema[type][f])), f => {
        const field = schema[type][f];
        return `${sqlScalars[rgo_1.fieldIs.scalar(field) ? field.scalar : 'string']}${field.isList ? '[]' : ''}`;
    }));
    await Promise.all(types.map(async (type) => {
        const columns = (await knex(type).columnInfo());
        if (Object.keys(columns).length === 0) {
            await knex.schema.createTable(type, table => {
                table.text('id').primary();
            });
            if (owner)
                await knex.raw('ALTER TABLE ?? OWNER TO ??;', [type, owner]);
        }
        delete columns.id;
        for (const field of Array.from(new Set([...Object.keys(columns), ...Object.keys(dbFields[type])]))) {
            if (!columns[field] && dbFields[type][field]) {
                await knex.schema.table(type, table => {
                    table.specificType(field, dbFields[type][field]);
                });
            }
            else if (columns[field] && !dbFields[type][field]) {
                // await knex.schema.table(type, table => {
                //   table.dropColumn(field);
                // });
            }
        }
    }));
    return rgo_1.resolvers.db(schema, {
        async find(type, { filter, sort, start = 0, end }, fields) {
            if (start === end)
                return [];
            const query = filter
                ? applyFilter(knex(type), schema[type], filter)
                : knex(type);
            if (sort) {
                sort.forEach(s => {
                    const field = s.replace('-', '');
                    const dir = s[0] === '-' ? 'desc' : 'asc';
                    if (dbFields[type][field] === 'TEXT') {
                        query.orderByRaw(`lower("${field}") ${dir}`);
                    }
                    else {
                        query.orderByRaw(`${field} ${dir} NULLS LAST`);
                    }
                });
            }
            query.offset(start);
            if (end !== undefined)
                query.limit(end);
            query.select(...(fields || []));
            return await query;
        },
        async insert(type, record) {
            const idRecord = Object.assign({ id: uuid() }, record);
            await knex(type).insert(idRecord);
            return idRecord.id;
        },
        async update(type, id, record) {
            await knex(type)
                .where('id', id)
                .update(record);
        },
        async delete(type, id) {
            await knex(type)
                .where('id', id)
                .delete();
        },
    });
}
exports.default = sqlResolver;
