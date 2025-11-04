# Arts GitHub Release Browser

A reusable GitHub release browser package with PHP backend and React frontend.

## Installation

### Composer

```bash
composer require arts/github-release-browser
```

### NPM

```bash
npm install @arts/github-release-browser
```

## Usage

### PHP

```php
use Arts\GH\ReleaseBrowser\Browser;

$browser = new Browser([
    'cache_prefix' => 'my_app_',
    'github_token' => 'your_actual_github_token_here',  // Your GitHub personal access token
    'protocol' => 'my-app://',
    'action_prefix' => 'my_app',  // Optional: default is 'github_release_browser'
]);

// Register modal integration for WordPress media library
$browser->register_modal_integration();
```

### TypeScript/React

```typescript
import { BrowserApp } from '@arts/github-release-browser';

<BrowserApp 
  config={{
    apiUrl: '/wp-admin/admin-ajax.php',
    nonce: 'your_nonce',
    actionPrefix: 'my_app',
    protocol: 'my-app://',
    onSelectAsset: (asset) => {
      console.log('Selected asset:', asset);
    }
  }}
/>
```

## Development

```bash
# Install dependencies
npm install

# Development build
npm run dev

# Production build
npm run build
```

## License

GPL-3.0-or-later
