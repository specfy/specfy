# Contributing

- [Install](./installation.md) the project

## Lint

```sh
npm run lint

# or
npm run lint:code
npm run lint:scss
```

## Test

```sh
npm run -w @specfy/api test
npm run -w @specfy/app test
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
cd pkgs/api

# Apply all migration
npm run prod:migrate

# Create migration
npm run migrate:create

# Seed development data
npm run seed
```


