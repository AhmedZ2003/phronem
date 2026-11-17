# Operator desk (/operators)

The expert qualification desk, rebuilt from the EQIP Qualification Desk (the founder's single-file
prototype) inside this site, in the Nebula theme. Not linked from the public site; `robots.txt`
disallows it and every page is `noindex`.

## Signing in

`/operators/sign-in`. Each operator has their own account. The first account is created from
`SEED_OPERATOR_*` in `.env.local` the first time the desk starts with no accounts file:

| Username | Display name |
|---|---|
| operator_1 | Operator 1 |

Manage accounts from the project folder (passwords are asked for, never typed on the command line):

```bash
pnpm operators list
pnpm operators add operator_2 "Operator 2"
pnpm operators reset operator_1
pnpm operators disable operator_2    # ends their session at once; their history stays
```

Once operator_1 exists, `SEED_OPERATOR_PASSWORD` can be removed from `.env.local`.

## What is recorded against each operator

Every scorecard dimension, project-match and performance score, compliance result, claim status,
conflict check, identity check, rate sign-off and the four sign-offs stores the operator who set it
and when. The file shows it beside the value ("Scored by Operator 1, 16 Nov 2026").

The **audit trail records milestones only**, not every edit (`src/lib/desk/milestones.ts`
compares the file before and after each change):

- the file opened, the identity confirmed, the rate signed off
- the screening interview completed
- the compliance gate cleared, failed (naming the item) or reopened; a claim disputed or resolved
- the scorecard completed (total and tier) and any later change of total
- each sign-off approved, rejected or reopened
- project match outcomes and conflict checks; consultation ratings and flags
- suspension and its lifting, reviews, removed records, deletion
- the expert's resulting status ("status is now Qualified: main network")

Edits to names, notes, interview answers or a single score category are not logged. The dashboard's
Operator activity table counts each operator's scorecards, clearances and sign-offs. The two-person
rule compares real accounts: Quality can't be approved by the person who signed all three earlier
stages.

## Rules kept from the prototype

Compliance is a pass/fail gate no score overrides; three separate scores (network quality, project
match, post-call performance); a disputed claim blocks approval; a compliance-incident flag
suspends the expert. Added: a Quality approval lapses when the score changes after it, and an
"inaccurate credentials" flag reopens the Verification sign-off. Rules: `src/lib/desk/rules.ts`,
tests in `rules.test.ts` (`pnpm test`).

## Data and hosting

Records and accounts are JSON files in `.data/` (git-ignored; `DESK_DATA_DIR` moves them). Writes
are locked and atomic. This suits one server process with a persistent disk. Before a serverless
host or several instances, move `src/lib/desk/store.ts` and `accounts.ts` to a database.
Production also needs `OPERATOR_SESSION_SECRET` (32+ characters).

The desk starts with the prototype's three fictional sample experts. Remove them with the button on
the register before real use. Don't enter real experts' data until hosting, backups and the legal
review (privacy notice, retention) are settled.

## Layout

After signing in, operators land on the dashboard. Every desk page sits in a shell modelled on
the reference dashboard the founder supplied (`videoframe_68.png`), in the Nebula theme:

- **Sidebar:** brand, Dashboard, Expert register, New expert, and Public site and Sign out at the
  foot. The menu button folds it to an icon rail on desktop (remembered per browser); on phones it
  opens as a drawer.
- **Top bar:** the light / dark switch and the signed-in operator.
- **Dashboard:**
  - "Welcome, name" with a period picker (7 days, 30 days, all time).
  - The operator's own card: their scorecards, clearances and sign-offs for the period, plus the
    pilot target.
  - Three figures: registered, qualified 70+, waiting for a decision.
  - A nebula banner that points at the next file needing a decision.
  - A "Needs attention" list.
  - Below those: pilot targets, network quality, operator activity and coverage by industry.

## Files

- `src/app/operators/`: sign-in, the desk pages (`(desk)/`), server actions, `desk.css`
- `src/components/desk/`: the shell (`DeskShell.tsx`), period picker, register table, expert file and its sections
- `src/lib/desk/`: types, rules, sample data, store, accounts, sessions
- `src/proxy.ts`: sends visitors without a session to the sign-in page
- `scripts/operators.mjs`: account management
