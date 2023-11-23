# fiberplane-ui

> Fiberplane UI library

Contains ReactJS UI elements for use in Fiberplane products.

## Usage

```tsx
import { Button } from "@fiberplane/ui";

function MyComponent() {
  return (
    <Button
      onClick={() => { /* your onClick handler... */ }}
      asElement="link" /* React Router `Link` element */
      buttonStyle="secondary"
    >
      Click me!
    </Button>
  );
};
```
