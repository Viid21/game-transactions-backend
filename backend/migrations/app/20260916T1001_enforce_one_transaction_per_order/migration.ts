#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/0bc3a1b3b999b0a11327fc600b3263bef61b93940d19943d3d483b8bc9b993c8/contract';
import startContract from '../../snapshots/0bc3a1b3b999b0a11327fc600b3263bef61b93940d19943d3d483b8bc9b993c8/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/3bb85dc5243e7f8b2c5a789c053b600b6fad8669a5afacd6b4cc99e68ec37c79/contract';
import endContract from '../../snapshots/3bb85dc5243e7f8b2c5a789c053b600b6fad8669a5afacd6b4cc99e68ec37c79/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropIndex({
        schema: 'public',
        table: 'transaction',
        index: 'transaction_orderId_idx_d284871b',
      }),
      this.addUnique({
        schema: 'public',
        table: 'transaction',
        constraint: 'transaction_orderId_key',
        columns: ['orderId'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
