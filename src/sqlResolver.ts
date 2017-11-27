import {
  Field,
  fieldIs,
  RelationField,
  Resolver,
  resolvers,
  ScalarField,
} from 'rgo';
import * as Knex from 'knex';
import keysToObject from 'keys-to-object';
import * as uuid from 'uuid/v1';
import { Obj } from 'common';

const sqlScalars = {
  boolean: 'BOOLEAN',
  int: 'INTEGER',
  float: 'FLOAT',
  string: 'TEXT',
  date: 'TIMESTAMPTZ',
  file: 'TEXT',
  json: 'JSON',
};

const applyFilter = (
  knex: Knex.QueryBuilder,
  filter: any[],
  isOr?: boolean,
) => {
  if (['AND', 'OR'].includes(filter[0])) {
    return knex.where(function(this: Knex.QueryBuilder) {
      filter.slice(1).forEach(f => applyFilter(this, f, filter[0] === 'OR'));
    });
  }
  const op = filter.length === 3 ? filter[1] : '=';
  const value = filter[filter.length - 1];
  if (value === null && ['=', '!='].includes(op)) {
    return knex[
      `${isOr ? 'orWhere' : 'where'}${op === '=' ? 'Null' : 'NotNull'}`
    ](filter[0]);
  }
  if (op === '!=') {
    return knex[isOr ? 'orWhereRaw' : 'whereRaw'](
      `${filter[0]} IS DISTINCT FROM ?`,
      [1],
    );
  }
  return knex[isOr ? 'orWhere' : 'where'](filter[0], op, value);
};

export default async function sqlResolver(
  knex: Knex,
  schema: Obj<Obj<Field>>,
  owner?: string,
) {
  const types = Object.keys(schema);

  const dbFields: Obj<Obj<string>> = keysToObject(types, type =>
    keysToObject(
      Object.keys(schema[type]).filter(
        f => !fieldIs.foreignRelation(schema[type][f]),
      ),
      f => {
        const field = schema[type][f] as RelationField | ScalarField;
        return `${sqlScalars[fieldIs.scalar(field) ? field.scalar : 'string']}${
          field.isList ? '[]' : ''
        }`;
      },
    ),
  );

  await Promise.all(
    types.map(async type => {
      const columns: Obj<Knex.ColumnInfo> = (await knex(
        type,
      ).columnInfo()) as any;
      if (Object.keys(columns).length === 0) {
        await knex.schema.createTable(type, table => {
          table.text('id').primary();
        });
        if (owner) await knex.raw('ALTER TABLE ?? OWNER TO ??;', [type, owner]);
      }
      delete columns.id;
      for (const field of Array.from(
        new Set([...Object.keys(columns), ...Object.keys(dbFields[type])]),
      )) {
        if (!columns[field] && dbFields[type][field]) {
          await knex.schema.table(type, table => {
            table.specificType(field, dbFields[type][field]);
          });
        } else if (columns[field] && !dbFields[type][field]) {
          // await knex.schema.table(type, table => {
          //   table.dropColumn(field);
          // });
        }
      }
    }),
  );

  return resolvers.db(schema, {
    async find(type, { filter, sort, start = 0, end }, fields) {
      if (start === end) return [];
      const query = filter ? applyFilter(knex(type), filter) : knex(type);
      if (sort) {
        sort.forEach(s => {
          const field = s.replace('-', '');
          const dir = s[0] === '-' ? 'desc' : 'asc';
          if (dbFields[type][field] === 'TEXT') {
            query.orderByRaw(`lower("${field}") ${dir}`);
          } else {
            query.orderByRaw(`${field} ${dir} NULLS LAST`);
          }
        });
      }
      query.offset(start);
      if (end !== undefined) query.limit(end);
      query.select(...(fields || []));
      return await query;
    },
    async insert(type, record) {
      const idRecord = { id: uuid(), ...record };
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
  }) as Resolver;
}
