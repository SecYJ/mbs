# React Conventions

- This project uses React 19.
- Skip `useMemo`, `useCallback`, and `memo`; React Compiler handles memoization.
- For filter, sort, search, and pagination state, use URL search params (e.g. TanStack Router `useSearch`) instead of `useState`.
