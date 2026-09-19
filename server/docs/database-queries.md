# Database Queries

- Prefer shaping data in Drizzle/SQL so the query returns the fields and structure needed by the caller.
- Perform filtering, sorting, pagination, joins, grouping, counts, and other aggregations in the database instead of fetching rows and doing that work in JavaScript.
- Use selected fields and aliases, nested selections, subqueries, SQL expressions, and JSON aggregation where appropriate to build the result shape. Select only the data needed.
- Avoid chains of JavaScript `map`, `filter`, or `reduce` calls, manual joins, and large lookup maps whose purpose is to reconstruct data that the database can return directly.
- Keep small JavaScript conversions when needed for serialization or logic that is clearer outside SQL. Do not force business workflows into complicated SQL just to eliminate every transformation.
- Keep queries readable: name reusable conditions and subqueries, and split complex queries into understandable pieces.
