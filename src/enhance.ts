import { Enhancer, enhancers } from 'rgo';
import * as Knex from 'knex';
import { isValid, Obj } from 'common';
import keysToObject from 'keys-to-object';

export const previous = (knex: Knex) =>
  enhancers.onUpdate(async ({ type, id }, { context }) => {
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
  }) as Enhancer;

export const formulae = enhancers.onUpdate(
  async ({ type, id, record }, { schema, context: { previous } }) => {
    const prev: Obj | null = previous[type][id!] || null;
    if (record) {
      const fields = Object.keys(schema[type]).filter(
        f => schema[type][f].meta && schema[type][f].meta.formula,
      );
      const values = await Promise.all(
        fields.map(f =>
          schema[type][f].meta.formula({ type, id, record, previous: prev }),
        ),
      );
      return keysToObject(fields, (_, i) => values[i]);
    }
  },
) as Enhancer;

export const logging = enhancers.onUpdate(
  async ({ type, id, record }, { context: { previous } }) => {
    const prev: Obj | null = previous[type][id!] || null;
    if (record) {
      if (id) {
        console.log(
          `rgo-commit-update, ${type}:${id}, ` +
            `old: ${JSON.stringify(prev)}, new: ${JSON.stringify(record)}`,
        );
      } else {
        console.log(
          `rgo-commit-insert, ${type}, new: ${JSON.stringify(record)}`,
        );
      }
    } else if (id) {
      console.log(
        `rgo-commit-delete, ${type}:${id}, old: ${JSON.stringify(prev)}`,
      );
    }
  },
) as Enhancer;

export const validate = enhancers.onUpdate(
  async ({ type, record }, { schema }) => {
    if (record) {
      for (const f of Object.keys(record)) {
        if (
          !isValid(
            {
              scalar: (schema[type][f] as any).scalar || 'string',
              optional: true,
              ...schema[type][f].meta,
            },
            record[f],
            record,
          )
        ) {
          throw new Error('Invalid data');
        }
      }
    }
  },
) as Enhancer;
