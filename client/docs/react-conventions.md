# React Conventions

- This project uses React 19.
- Skip `useMemo`, `useCallback`, and `memo`; React Compiler handles memoization.
- For filter, sort, search, and pagination state, use URL search params (e.g. TanStack Router `useSearch`) instead of `useState`.
- When the same state selection is used in more than three places, colocate a custom hook with the state source. Select the fields callers need; use a shallow comparison when a selector creates an object or array.
- Use `tiny-invariant` to narrow values that must exist, such as a required provider. Keep ordinary conditional rendering for valid empty states, such as a closed dialog with no selected booking.
