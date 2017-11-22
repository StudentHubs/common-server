import { Field, Resolver } from 'rgo';
import * as Knex from 'knex';
import { Obj } from 'common';
export default function sqlResolver(knex: Knex, schema: Obj<Obj<Field>>, owner?: string): Promise<Resolver>;
