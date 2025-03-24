---
title: "Placegoose: Seeding and deployment with HONC"
description: "Exploring how to seed and deploy a HONC app on Cloudflare."
slug: placegoose-to-prod
date: 2025-03-24
author: Aristo Spanos
tags:
  - hono
  - honc
  - d1
  - cloudflare
---

In the [first article of this series](/blog/placegoose-guide), we walked through building Placegoose, a simple mock data API using the [HONC stack](https://honc.dev/). My goals were pretty simple:

- Showcase solutions for common [Hono](https://hono.dev/) project requirements, like relations and rate limiting
- Provide a free mock data API that returns error responses for invalid requests

It’s easy enough to find Hono starter templates with a “Hello World” endpoint, or a basic configuration, but there are fewer resources out there that demonstrate how to integrate non-trivial services and functionality. In the same vein, many popular mock data APIs don’t validate requests or implement rate-limiting, which makes it impossible to test sad paths.

Placegoose was meant to be a step up in complexity from the average starter template, without becoming overly-specific. While you’re welcome to [test out the API](https://placegoose.fp.dev/), you may find it more useful to [clone the project](https://github.com/fiberplane/create-honc-app/tree/main/examples/placegoose) and adjust the database schema and mock data to fit your needs.

### What does production deployment entail?

In this article, we’ll be covering the steps to prepare apps like Placegoose for Cloudflare deployment. Placegoose is a fairly simple data API with statically-served docs, so we won’t be addressing monorepos or use-cases that require SSR or CSR front-ends.

I won’t be getting too technical, but you’ll need to be comfortable with web fundamentals and reading TypeScript, as I won’t be explaining implementation details. It will also help if you’re familiar with Drizzle configuration and database schemas. If you’re new to the HONC stack, I’d recommend giving [the previous article](https://dev.to/fiberplane/placegoose-building-data-apis-with-honc-id8) a read first!

While many production deployments require a complex multi-stage build process that incorporates advanced features like testing or dependency optimization,  we’ll focus on two key steps:

- Creating and seeding a remote D1 database
- Deploying a Workers project using the [Cloudflare CLI](https://developers.cloudflare.com/workers/wrangler/commands/)

The CLI makes deploying simple apps fairly trivial, but seeding the remote D1 proved to be a little more complicated than anticipated. In this article, we’ll discuss some of the infrastructure constraints you may encounter, and the Cloudflare and Drizzle tooling used to work around them:

- Seeding a remote D1 over HTTP using [Drizzle’s generic HTTP adapter](https://orm.drizzle.team/docs/guides/d1-http-with-drizzle-kit)
- Or using [Cloudflare’s CLI](https://developers.cloudflare.com/d1/wrangler-commands) to apply a locally-generated SQL file to a remote D1

Both solutions rely on locally-run scripts that use pre-generated data. With some adjustments, though, it should be possible to integrate them into a [custom build](https://developers.cloudflare.com/workers/wrangler/custom-builds/) process. Doing so was out of scope for Placegoose, but might be relevant if you regularly spin up demo instances for new clients.

If you have a better solution, or think you see a problem with one of the implementations, please let me know in the comments!

## Getting set up with Cloudflare

When deploying Workers that rely on bindings to other Cloudflare services, we must first ensure that these services are live. Otherwise, we’ll get an error like this one:

```sh
binding DB of type d1 must have a database that already exists. 
Use wrangler or the UI to create the database. [code: 10021]
```

Creating Cloudflare services is simple enough. First, [create a Cloudflare account](https://dash.cloudflare.com/sign-up), if you haven’t already, then run the `d1 create` command to create a new remote D1 database: 

```bash
wrangler d1 create placegoose-d1
```

Once the database has been created, the script will log the binding details. You can also find these values in [your Cloudflare dashboard](https://dash.cloudflare.com). Be sure to update your `wrangler.toml` file with the logged `database_id`. You’ll also need to add your account ID, database ID, and Cloudflare API token to your `prod.vars` file in order to run local migration and seeding scripts.

```toml
[[d1_databases]]
binding = "DB"
database_name = "placegoose-d1"
database_id = "<DATABASE-ID-FROM-ABOVE>"
migrations_dir = "drizzle/migrations"
```

Now that our database is online, we can apply our migrations and begin to interact with it! Drizzle takes care of this for us with the `drizzle-kit migrate` command:

```bash
npm run ENVIRONMENT=production drizzle-kit migrate
```

By setting the `ENVIRONMENT` variable to `production`, we ensure that `drizzle.config` uses our production configuration (and credentials) for the migration.

<aside>

If you’re following along, take a moment to inspect the database in [your Cloudflare dashboard](https://dash.cloudflare.com/). You should see all the tables defined in your schema, along with a Drizzle-generated migrations table.

</aside>

We could jump straight to deploying our app now, but it wouldn’t have any data to show us, so first we’ll seed it with the data we’ve already generated.

## Database seeding

Seeding databases is a key component of application development, but it can often seem like a cumbersome afterthought. Especially in a project’s early days, when speed is of the essence, structuring and re-structuring seed data as your database evolves feels thrash-y. Mocking database calls feels much cheaper in comparison, at least when it comes to testing.

<aside>

Seeding a database is the process of populating it with mock data that conforms to your spec. It’s useful throughout the product lifecycle: during development, testing, and demos.

</aside>

I’ve worked on projects that mocked database calls, and “seeded” data for demos in the course of UI/UX testing. Setting aside the issues with using test data for demos, this approach quickly ran into scaling problems. In essence, we had traded managing database seeding for managing database mocks, which was no less cumbersome but much more fragile.

Even if it feels like a lot at first, using seed data for development—and especially testing, is a game-changer. Notably, it makes integration tests a lot easier, and in my experience it can be easier to keep in sync with your database schema. In fact, tools like [`drizzle-seed`](https://orm.drizzle.team/docs/seed-overview) make this almost an afterthought by automatically generating seed data based on your latest schema.

## Seeding Placegoose

When I got started on Placegoose, [`drizzle-seed`](https://orm.drizzle.team/docs/seed-overview) had just been released. While intriguing, introducing it felt a bit like scope creep. If nothing else, it didn’t seem like it would support the goose theme I was going for, and solving *that* problem was definitely out of scope.

To create the seed data, I used a generative AI tool to create arrays of entries, which I saved in local project files. This worked well for Placegoose because the schema was essentially fixed, and there was no real need (or plans) to modify it. For most projects though, re-generating entries each time the schema changes would be cost-prohibitive, especially considering the amount of scrutiny AI-generated content requires.

Determining the right path to insert the data was equally a function of the project’s requirements and constraints. Unlike many projects, which grow and evolve with time, Placegoose is meant to serve as an example, and as a tool that can easily be run (and modified) locally. Seeding the remote database with a local script was the clear answer: it’s a little more transparent, and it can be integrated into an automated build process if needed. 

### Infrastructure constraints

This is where things get a little more complicated. While Workers run in the `workerd` runtime—and have access to bindings—any standalone scripts executed locally (or during the remote build ) run in a standard Node process. This means that there’s no way to directly call a remote D1 database via script.

Executing the script in the worker global scope or creating a standalone worker to handle seeding are both options, but they introduce problems of their own. Notably, they would require gating access to the seeding logic, and creating an additional worker would add extra complexity with minimal return.

Fortunately, we can also connect to D1 databases over HTTP. This allows us to pass our D1 credentials in the request, rather than relying on the binding. We can even keep using Drizzle to generate our SQL!

## Seeding with Drizzle’s HTTP proxy

Drizzle offers an [HTTP proxy driver](https://orm.drizzle.team/docs/connect-drizzle-proxy) that allows us to define how database requests are made, without modifying our query implementation.

First though, we need to adjust our `drizzle.config` so that `drizzle-kit` uses the HTTP driver when running in a `production` environment. The config definition is essentially the same: we only need to update the `driver` and `dbCredentials` properties, so that `drizzle-kit` can connect to our remote D1 when applying migrations (or introspecting).

```tsx
import 'dotenv/config'; // We use dotenv to grab local environment variables
import { config } from "dotenv";
import { defineConfig, type Config } from 'drizzle-kit';

let drizzleConfig: Config;

if (process.env.ENVIRONMENT === 'production') {
	config({ path: './.prod.vars' });
	
	// Don't forget to update your local .prod.vars file!
	const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
	const databaseId = process.env.CLOUDFLARE_DATABASE_ID;
	const token = process.env.CLOUDFLARE_D1_TOKEN;
	
	// Make sure we actually set our credentials
	if (!accountId || !databaseId || !token) {
		console.error(
			`Configuration Failed: Missing Credentials`,
			JSON.stringify({ accountId, databaseId, token }, null, 2),
		);
		process.exit(1);
	}

	drizzleConfig = defineConfig({
		schema: './src/schema.ts',
	  out: './migrations',
	  dialect: 'sqlite',
	  driver: 'd1-http', // Use the HTTP driver
	  dbCredentials: {
	    accountId,
	    databaseId,
	    token,
	  },
	});
	
} else { 
	// Local config
}

export default drizzleConfig
```

Next, we’ll need to update our seed script to use the HTTP driver. This is slightly more involved, but still pretty straightforward.

### Implementing the HTTP driver

The driver takes a callback responsible for making a single query, and an optional callback for making batches of requests. In the simplest case, the batch callback is just an iterative implementation of the single-query function we provide.

```tsx
import { drizzle } from 'drizzle-orm/sqlite-proxy';

// Drizzle driver instance that we can use
// interchangeably with the d1 or libsql drivers
const db = drizzle(
	/**
	 * AsyncBatchRemoteCallback
	 */
	async (
		sql: string,
		params: any[],
		method: 'run' | 'all' | 'values' | 'get'
	): Promise<{ rows: any[]; }> => { 
		// Execute a single query over HTTP
	},
	/**
	 * AsyncBatchRemoteCallback
	 */
	async (
		batch: {
	    sql: string;
	    params: any[];
	    method: 'run' | 'all' | 'values' | 'get';
		}[]
	): Promise<{ rows: any[]; }> => {
		// Iteratively execute an array of queries over HTTP
	},
	/**
	 * Standard Drizzle config, instructs driver to
	 * translate between snake and camel case column names
	 */
	{ casing: 'snake_case', }
);
```

Since we’re seeding relational data, we’ll want to take advantage of batches (which are executed as transactions), so we’ll need to implement both callbacks. Let’s start with the single-query case though, so we can get to know [Cloudflare’s D1 HTTP query resource](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/).

For the most part, Cloudflare’s query API matches the `AsyncRemoteCallback` function signature. Both accept a `sql` string, an array of `params`, and the `method`, so we can just pass those values through directly. 

We’ll also need to specify the `accountId`, `databaseId`, and `apiToken` for our remote D1, as the credentials we set in `drizzle.config` are only used by `drizzle-kit`.

Below is a minimal implementation of the single-query callback. The `fetch` request itself is extremely simple, but it takes a few steps to unpack the response and handle any errors. For more details on response typing, refer to [the Cloudflare API docs](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/).

```tsx
import type { AsyncRemoteCallback } from "drizzle-orm/sqlite-proxy";

type D1HttpQueryResponse = {
  errors?: { code: number; message: string; }[];
	messages?: { code: number; message: string; }[];
	result?: { results: unknown[]; success: boolean; }[];
	success?: boolean;
}

const httpQueryD1: AsyncRemoteCallback = (
  sql: string,
  params: unknown[],
  method: string,
): Promise<{ rows: unknown[][] }> => {
	const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params, method }),
  });
  
  if (response.status !== 200) {
	  /** HTTP request failed */
  }

	// Based on the Cloudflare docs
	// In practice, the type should be validated at runtime
  const dbResponse: D1HttpQueryResponse = await res.json();
  if (dbResponse.errors.length > 0 || !dbResponse.success) { 
	  /** Query failed */ 
	}
  
	const queryResult = dbResponse?.result?.at(0);
	if (!queryResult?.success) {
		/** Query failed */ 
	}
  
  // Format row data
  const rows = queryResult.results.map((row) => {
	  if (row instanceof Object) {
		  return Object.values(row);
	  }
	  
	  throw new Error('Unexpected Response', {
		  cause: dbResponse,
	  });
  });
  
  return { rows };
}
```

Note that since Cloudflare’s D1 `query` endpoint returns results as JSON, we’ll need to flatten the values from each row into an array. Since the returned results are inherently `unknown`, we can use an `instanceof` check to let TypeScript know that each array element can be unpacked with `Object.values`. While it might be tempting to save a few lines by casting to `any`, [doing so should be strictly avoided](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html#any). The cost to your type safety is almost never justified.

With our single-query callback implemented, creating a function to handle batch queries is fairly trivial. We just need to loop over the array of queries, pass the arguments into our single-query function, and push the returned rows into our `results` array.

```tsx
const httpBatchQueryD1: AsyncBatchRemoteCallback = async (
	queries: {
		sql: string;
		params: unknown[];
	  method: string;
	}[]
): Promise<{ rows: unknown[][] }> => {
	const results = [];
	
	for (const query of queries) {
	  const { sql, params, method } = query;
	  const result = await httpQueryD1(sql, params, method);
	  results.push(result);
	}
	
	return results;
};
```

If we try to run the script though, we run into an error! [Cloudflare limits us to 100 bound variables](https://developers.cloudflare.com/d1/platform/limits/) for D1 queries. This means that we can insert no more than 20 rows of 5 columns each at a time (for example), assuming we’re only using variables to insert values.

```bash
400 Bad Request
{
	"errors":[{
		"code":7500,
		"message":"too many SQL variables at offset 420: SQLITE_ERROR"
	}],
	"success":false
}
```

### Chunking writes

To work around this limit, we can seed our data in chunks. This is a common pattern for handling large inserts, and shouldn’t pose any problems for an app of this scale. To accomplish this, we can use a simple utility to break our data into appropriately-sized arrays. Remember, the formula for determining maximum chunk size is `100 / column count`, so you may need to adjust your chunk size if a table’s column count changes.

```tsx
// Break data into appropriately-sized chunks
const chunkArray = <T>(array: T[], size: number) => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}
```

### Writing relational data with transactions

Ideally we would wrap our writes in a `transaction`, ensuring they’d succeed or fail together. This is especially important when inserting relational data with inherent interdependencies between tables (and ID values). Unfortunately, there is an [open issue with the way Drizzle handles D1 transactions](github.com/drizzle-team/drizzle-orm/issues/4212). While they work locally, they fail when writing to a remote D1 over HTTP.

We can achieve the same effect, though, by using Drizzle’s `batch` method. According to [Drizzle’s docs on D1 batches](https://orm.drizzle.team/docs/batch-api), they “execute and commit sequentially and non-concurrently”, and are fully-fledged SQL transactions.

The `batch` method effectively accepts an array of operations, but it’s typed as a tuple, so we’ll need to get a little creative when constructing the array. We’ll use a second utility to break our data into chunks, and create insert statements for each.

```tsx
const chunkInserts = <T extends SQLiteTable>(
	table: T, 
	data: T["$inferInsert"][],
	batchSize: number,
) => {
	const dataChunks = chunkArray(data, batchSize);
	
  // Initialize the array with the first insert to
  // satisfy the tuple type requirement
  const chunkedInserts: [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]] = [
    db.insert(table).values(dataChunks[0]),
  ];

  // Loop starts at 1 as we've already added 0
  for (let i = 1; i < dataChunks.length; i++) {
	  const batchItem = db.insert(table).values(dataChunks[i]);
    chunkedInserts.push(batchItem);
  }

  return chunkedInserts;
}
```

## Seeding with the CLI

Adding batches to the local seed script was minimally invasive, and got the job done. It was good enough for Placegoose, but it left me wondering whether there was a lower-touch solution.

After some digging, I found that [Cloudflare’s CLI](https://developers.cloudflare.com/d1/wrangler-commands) allows you to push data directly to a remote D1 database, without worrying about batching (or even scripting)! 

The first step is to initialize and seed a database locally. Then, export the database to a local SQL file using the `wrangler d1 export` command:

```bash
wrangler d1 export placegoose-d1 --local --output ./seed.sql --no-schema
```

The `--no-schema` flag ensures that only seed insert statements will be included in the generated file, since we’ll still use `drizzle-kit` to push our migrations.

```bash
wrangler d1 migrations apply placegoose-d1 --local
```

The next step is to push the SQL file to our remote D1. To do this, we’ll use the `wrangler d1 execute` command, pointing to our `--output` file from the export script:

```bash
wrangler d1 execute placegoose-d1 --remote --file ./seed.sql --yes
```

You don’t need to include the `--yes` flag. This will automatically approve prompts that come up while the script runs. It may be useful if you choose to incorporate this approach into your build process, but it can have unintended consequences if you’re not sure what prompts will appear.

### Debugging schema issues

When I first ran this script, the SQL file was uploaded successfully, but the remote execution failed. I got the following error message referring to a `sqlite_sequence` table. 

```bash
🌀 File already uploaded. Processing.

✘ [ERROR] no such table: sqlite_sequence: SQLITE_ERROR
```

Normally this table is generated for us when we create a table with auto-incrementing columns. I forgot to make the ID columns in the Placegoose schema auto-incrementing though.

```tsx
const metadata = {
  id: integer({ mode: "number" }).primaryKey({
	  autoIncrement: true, // Simple fix
  }),
};
```

For a number of reasons, the right answer is to update the schema, but to be honest this didn’t occur to me until I had found a different solution:

```sql
CREATE TABLE dummy (id INTEGER PRIMARY KEY AUTOINCREMENT);
DROP TABLE dummy;
```

By adding these lines to the top of the generated SQL file, I got D1 to create a `sqlite_sequence` table without changing the actual schema. As a mock data API, Placegoose doesn’t actually support inserts, so I could have gotten away with this approach, but as a general rule, ignoring such fundamental problems with your database schema is a recipe for disaster.

### Mapping migration tables

A different change to the generated SQL file *was* necessary though. Drizzle keeps track of migrations in a `__drizzle_migrations` table, which was added to the remote D1 when we used `drizzle-kit` to apply migrations. 

[Wrangler *also* keeps track of migrations in a `d1_migrations` table](https://developers.cloudflare.com/d1/reference/migrations/#wrangler-customizations) though, and doesn’t have access to Drizzle’s migrations table. Consequently, the generated SQL file includes inserts to a `d1_migrations`table that doesn’t exist on the remote. The schemas are the same though, so we just need to update the table name.

```sql
// INSERT INTO d1_migrations VALUES(...
INSERT INTO __drizzle_migrations VALUES(1,'0000_little_newton_destine.sql','2025-03-10 11:53:01');
```

I’m sure there is a more elegant or hands-off way to approach this (let me know if you’ve found it), but my goal in researching this approach was to verify that it was possible, not to fine-tune it.

After updating the database schema and updating the generated SQL file, we can push *all* the seed data at once. We only have a few hundred records in total, so I’m not sure how this approach scales, but that volume of mock data is sufficient for many projects.

## Deploying a Worker

Now that we have some data to display, let’s get our app deployed! As with creating our remote D1, it’s a really simple process. If you’ve been developing locally, you must already have [installed Node](https://nodejs.org/en/download), and have [Wrangler installed in your project](https://developers.cloudflare.com/workers/wrangler/install-and-update/), and it was necessary to create a Cloudflare account to create your remote D1.

With the prerequisites out of the way, there’s just one more step: Run the [Wrangler deploy command](https://developers.cloudflare.com/workers/wrangler/install-and-update/)! Note that using the `--minify` flag can help reduce startup times, and keep the bundle within [Cloudflare’s Worker size limits](https://developers.cloudflare.com/workers/platform/limits/#worker-size). It can make debugging more difficult though, as minification typically obscures variable and function names.

```bash
wrangler deploy --minify src/index.ts
```

That’s it! Your project is live. It will be exposed at  `<project-name>.<cloudflare-user>.workers.dev` by default, but you can [configure a custom domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) in your `wrangler.toml` or Cloudflare dashboard. 

If you end up using Placegoose as a starting point for your own mock data API, let me know in the comments! I’d also love to hear if there’s anything you wish I had covered in more detail, or if you’ve discovered a more streamlined approach!

## What will you deploy next?

As we’ve seen, deploying a simple backend to Cloudflare is pretty straightforward. We had to work around some infrastructure limits to seed our remote database, but the HONC stack offers a few solutions that meet our needs.

Using Cloudflare’s CLI is a more direct approach and requires less configuration, but you may run into issues seeding larger datasets. Batching chunked writes is a more flexible solution, even though it requires a bit more code up-front.

The optimal solution will depend on your use-case though. No matter which approach (or stack) you choose, you’ll run into some kind of limitations or constraints. To develop effective solutions, you’ll need to experiment with the tools your stack provides, and a clear understanding of your project’s requirements.

The next steps are up to you! You may want to move on to deploying more complex backends, or make use of your mock data API to enhance your development experience. As with every software problem, success ultimately boils down to reading documentation and persistently experimenting with different approaches.