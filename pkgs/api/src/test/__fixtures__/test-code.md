# Test code block

## SH

```sh
gcloud connect --foobar="top"
```

## Typescript

```ts
function foo(bar: string): Promise<null> {
  return "top"
}
```

## Go

```go
package main

import "fmt"

func main() {
 fmt.Println("Hello, 世界")
}
```

## Logs

```log
Created ["2023-08-28T13:14:10.158Z"]
Job [id: "53QoA4sTeI06"]
Org [id: "acme"]
Project [id: "b03tMzwd5A"]
Configuration =>
{
  "url": "specfy/sync"
}
Processing ["2023-08-28T13:14:10.158Z"]
Status: "success"
Finished ["2023-08-28T13:14:10.158Z"]
INFO foobar
ERROR Got 5 errors
WARN This a fair warning true / false
```

## Css

```css
.code {
  border-right: var(--blue);
}
```

```scss
.scss {
  border-right: var(--blue);
}
```

## Html

```html
<div>This is <em>Specfy</em></div>
```

## React

```jsx
const Foobar = () => {
  return (<div>This is <em>Specfy</em></div>)
}
```

## PHP

```php
<?php echo "foobar" ?>
```

## SQL

```sql
SELECT * FROM Tables WHERE col = "foobar";
```

## Docker

```dockerfile
FROM node:18.17.1-bullseye-slim as deps

RUN apt update && apt-get install -y bash jq
```

## Diff

```diff
diff --git a/pkgs/models/src/flows/__snapshots__/layout.test.ts.snap b/pkgs/models/src/flows/__snapshots__/layout.test.ts.snap
index 5fbb1892..0656b6b8 100644
--- a/pkgs/models/src/flows/__snapshots__/layout.test.ts.snap
+++ b/pkgs/models/src/flows/__snapshots__/layout.test.ts.snap
@@ -121,7 +121,7 @@ exports[`layout > should compute a tree 1`] = `
 ]
 `;

-exports[`layout > should output 3 components  1`] = `
+exports[`layout > should output 3 components 1`] = `
 {
   "height": 120,
   "nodes": [
```
