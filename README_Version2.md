# Northward Collection — Frontend Design Prototype

This is a static, design-only frontend inspired by a premium minimal ecommerce layout. It uses only HTML/CSS/JS, with random placeholder images and English placeholder copy.

- Pages:
  - Home (`/index.html`)
  - Collections (`/collections/index.html`)
  - Product Detail (`/product/index.html`)
  - About (`/about/index.html`)
  - Contact (`/contact/index.html`)
  - 404 (`/404.html`)

- Tech:
  - HTML5, modern CSS (flex/grid), minimal JS
  - Components: Header/Footer (injected), Carousel, Accordion
  - Fonts: Playfair Display (headings), Inter (body)

- Notes:
  - All forms/buttons are non-functional by design.
  - Images load from picsum.photos with deterministic seeds.
  - Accessible structure: semantic elements, aria attributes on accordion/carousel.

## Local preview
Open `index.html` directly in your browser, or serve the folder using any static server.

```bash
# Example with Python
python3 -m http.server 5173

# Or use VS Code Live Server, or any static server tool
```