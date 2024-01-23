# fiberplane-ui

> Fiberplane UI library

Contains ReactJS UI elements for use in Fiberplane products.

## Usage

```tsx
import { Button, Input } from "@fiberplane/ui";

function MyForm() {
  // ...

  return (
    <Input
      type="text"
      onChange={(event) => { /* your text onChange handler... */ }}
    >
    <Input
      type="lightswitch"
      onChange={(event) => { /* your lightswitch onChange handler... */ }}
      checked={isChecked}
    >
    <Button
      onClick={() => { /* your onClick handler... */ }}
      type="submit"
      buttonStyle="secondary"
    >
      Click me!
    </Button>
  );
};
```
