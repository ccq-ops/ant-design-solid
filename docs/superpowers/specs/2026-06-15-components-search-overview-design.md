# Components Overview Design

## Goal

Add a Components overview page at `/components` that follows the Ant Design components overview pattern: show all documented components by category and provide a search box that filters components by name. Route both the home page "View Components" action and the top navigation "Components" link to that page.

## Scope

- Create `apps/docs/src/routes/components/index.mdx` as the Components landing page.
- Keep static title and explanatory copy in `apps/docs/src/routes/components/index.mdx`.
- Render the dynamic searchable catalogue from `apps/docs/src/routes/components/components-overview.tsx`.
- Keep existing individual component docs unchanged.
- Put an overview link at the top of the Components sidebar before generated component groups.
- Update existing tests that assert the home action and docs theme navigation.
- Add runtime tests for grouped component rendering and search filtering.

## Content Design

The overview page should be a component catalogue, not a single Search component article. Static copy should live in MDX, while dynamic searching and grouped rendering should live in TSX. It should include:

- Page title: `Components`.
- Short intro explaining that users can browse by category or search by component name.
- Search input with accessible label `Search components`.
- Component cards grouped by the same Ant Design v6-style groups already used by the docs: General, Layout, Navigation, Data Entry, Data Display, Feedback, and Other.
- Each card links to the component docs page under `/components/<slug>`.
- Empty state when no component name matches the search query.

## Dynamic Component Boundary

`components-overview.tsx` owns only:

- Search input state.
- Filtering by component name.
- Grouped component card rendering.
- Empty state for unmatched search queries.

The MDX route owns the static heading and introduction.

## Data Source

Use the existing MDX component route files as the source of truth. Read each component page's frontmatter with `import.meta.glob('./*.mdx', { eager: true })`, exclude `index.mdx`, and derive links from file slugs. This keeps the overview automatically aligned when component docs are added or renamed.

## Routing And Navigation

- `/components` is the canonical Components overview route.
- Home page `View Components` points to `/components`.
- Top navigation `Components` points to `/components`.
- Sidebar under `/components` starts with `Overview`, then the existing component groups.

## Verification

- Unit tests cover the home page frontmatter link and docs theme nav/sidebar structure.
- Component overview tests cover grouped component links, search filtering, and empty state.
