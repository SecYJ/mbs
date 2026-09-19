# Styling Conventions

- In Tailwind CSS classes, do not add the `var(...)` keyword for CSS variables; use the `(...)` shorthand instead.
- In Tailwind CSS v4 data attribute variants, use direct boolean variants like `data-popup-open:border-(--hairline)`. Use square brackets only when matching a specific data attribute value, such as `data-[dialog=active]:...`.
- Conditional `className` values must use the `cn` function instead of string template literals or inline conditional strings.
