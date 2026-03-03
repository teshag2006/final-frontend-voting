Legacy migration files are kept here for reference only.

They are intentionally excluded from runtime migration execution because they
overlap with the canonical full-init migration (`0001-InitSchema.ts`) and can
cause duplicate-table failures if executed in sequence.

Canonical runtime order:
1. `0001-InitSchema.ts`
2. `0005-santimpay-provider.ts`
3. `0006-payment-webhooks-entity-alignment.ts`
