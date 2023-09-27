# Contributing

## Installation

Follow the **[installation](./installation.md)** procedure.

## Continuous Build

```sh
npm run build:watch
npm run api
npm run app
```

## Lint

```sh
npm run lint

# or
npm run lint:code
npm run lint:scss
```

## Test

```sh
npm run test
```

NB: Running tests will truncate the Database.

### Writing test

Test in `it()` should be self-sufficient and possible to execute in parallel of any other tests.
If API is needed, your test should seed the data it needs with random identifier

```ts
// example
it('should fail to get an user', async () => {
  const { token } = await seedSimpleUser();
  const res = await fetch.get('/0/me', { token });
  expect(res.status).toBe(403);
});
```

## Database

```sh
# Run migration
npm run db:migrate

# Create migration
npm run db:migrate:create
```
