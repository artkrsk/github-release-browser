<!-- 94e53743-e2e5-46cd-bb97-0f510a9975fc 8d1b9ba9-df88-4839-8c1f-37ba65146928 -->
# Extract GitHub Release Browser Package

## Package Structure Setup

### 1. Create Base Directory Structure

Create at `/Users/art/Projects/Framework/packages/ArtsGithubReleaseBrowser/`:

```
ArtsGithubReleaseBrowser/
├── src/
│   ├── php/
│   │   ├── Core/
│   │   │   ├── Interfaces/
│   │   │   ├── Services/
│   │   │   └── Types/
│   │   ├── Adapters/
│   │   │   └── WordPress/
│   │   ├── Includes/
│   │   │   ├── Frontend.php
│   │   │   └── ModalIntegration.php
│   │   ├── libraries/
│   │   │   └── github-release-browser/  (build output)
│   │   └── Browser.php  (main class)
│   ├── ts/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── interfaces/
│   │   ├── types/
│   │   ├── constants/
│   │   ├── utils/
│   │   └── index.ts
│   └── styles/
│       └── core/
├── dist/  (temporary build, copies to libraries/)
├── project.config.js
├── project.development.js
├── project.production.js
├── package.json
├── composer.json
├── tsconfig.json
├── .gitignore
└── README.md
```

### 2. Initialize Git and Add Build Submodule

- Run `git init` in package directory
- Add `__build__/` as git submodule from Release Deploy EDD Lite
- Create `.gitignore`

### 3. Create composer.json

```json
{
  "name": "arts/github-release-browser",
  "description": "Reusable GitHub release browser with PHP backend & React frontend",
  "type": "library",
  "license": "GPL-3.0-or-later",
  "require": {
    "php": ">=7.4"
  },
  "autoload": {
    "psr-4": {
      "Arts\\GH\\ReleaseBrowser\\": "src/php/"
    }
  }
}
```

### 4. Create package.json

```json
{
  "name": "@arts/github-release-browser",
  "version": "1.0.0",
  "description": "Reusable GitHub release browser with PHP backend & React frontend",
  "author": "Artem Semkin",
  "license": "GPL-3.0-or-later",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist/", "src/php/", "composer.json", "README.md"],
  "scripts": {
    "dev": "node __build__/src/index.js dev",
    "build": "node __build__/src/index.js build"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@wordpress/element": "^6.0.0",
    "@wordpress/components": "^28.0.0",
    "@wordpress/i18n": "^5.0.0"
  },
  "devDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@wordpress/element": "^6.33.0",
    "@wordpress/components": "^30.6.0",
    "@wordpress/i18n": "^6.6.0",
    "@types/react": "^18.3.26",
    "@types/react-dom": "^18.3.7",
    "typescript": "^5.0.0"
  }
}
```

### 5. Create project.config.js

```javascript
export default {
  name: 'github-release-browser',
  entry: './src/ts/index.ts',
  author: 'Artem Semkin',
  license: 'GPL-3.0-or-later',
  
  paths: {
    root: './',
    src: './src',
    dist: './dist',
    php: './src/php',
    styles: './src/styles',
    ts: './src/ts',
    library: {
      base: 'libraries',
      name: 'github-release-browser',
      assets: 'src/php/libraries/github-release-browser'
    }
  },
  
  build: {
    formats: ['iife'],
    target: 'es2018',
    sourcemap: false,
    externals: {
      'react': 'React',
      'react-dom': 'ReactDOM',
      '@wordpress/element': 'wp.element',
      '@wordpress/components': 'wp.components',
      '@wordpress/i18n': 'wp.i18n'
    },
    umd: {
      name: 'ArtsGitHubBrowser',
      exports: 'named'
    },
    output: {
      iife: 'index.js'
    }
  },
  
  sass: {
    enabled: true,
    entry: './src/styles/index.sass',
    output: './dist/index.css'
  },
  
  wordpressPlugin: {
    enabled: false
  },
  
  liveReload: {
    enabled: false
  },
  
  wordpress: {
    enabled: false
  },
  
  i18n: {
    enabled: false
  }
}
```

## PHP Backend Extraction

### 6. Extract Core Interfaces

Create in `src/php/Core/Interfaces/`:

**IHttpClient.php**:

```php
namespace Arts\GH\ReleaseBrowser\Core\Interfaces;

interface IHttpClient {
    public function get(string $url, array $headers = [], array $options = []): Response;
}
```

**ICache.php**:

```php
namespace Arts\GH\ReleaseBrowser\Core\Interfaces;

interface ICache {
    public function get(string $key): mixed;
    public function set(string $key, $value, int $ttl = 3600): bool;
    public function delete(string $key): bool;
    public function clearKeys(array $keys): bool;
}
```

**IConfig.php**:

```php
namespace Arts\GH\ReleaseBrowser\Core\Interfaces;

interface IConfig {
    public function get(string $key, $default = null);
}
```

### 7. Create Response Type

`src/php/Core/Types/Response.php`:

```php
namespace Arts\GH\ReleaseBrowser\Core\Types;

class Response {
    public function __construct(
        public int $statusCode,
        public string $body,
        public array $headers
    ) {}
}
```

### 8. Extract Core Services

Extract from current plugin to `src/php/Core/Services/`:

**GitHubAPI.php**: Inject IHttpClient, ICache, IConfig via constructor

**URIParser.php**: Add constructor parameter for protocol (default: 'github-release://')

**AssetResolver.php**: No changes needed

### 9. Create WordPress Adapters

`src/php/Adapters/WordPress/HttpClient.php`: Implements IHttpClient using wp_remote_get

`src/php/Adapters/WordPress/Cache.php`: Implements ICache using transients (no $wpdb)

`src/php/Adapters/WordPress/Config.php`: Implements IConfig using options/constants

### 10. Create Main Browser Class

`src/php/Browser.php` (similar to ArtsLicensePro's Plugin class):

```php
namespace Arts\GH\ReleaseBrowser;

use Arts\GH\ReleaseBrowser\Core\Services\GitHubAPI;
use Arts\GH\ReleaseBrowser\Core\Services\URIParser;
use Arts\GH\ReleaseBrowser\Core\Services\AssetResolver;
use Arts\GH\ReleaseBrowser\Adapters\WordPress\HttpClient;
use Arts\GH\ReleaseBrowser\Adapters\WordPress\Cache;
use Arts\GH\ReleaseBrowser\Adapters\WordPress\Config;
use Arts\GH\ReleaseBrowser\Includes\Frontend;
use Arts\GH\ReleaseBrowser\Includes\ModalIntegration;

class Browser {
    private array $config;
    private GitHubAPI $github_api;
    private URIParser $uri_parser;
    private AssetResolver $asset_resolver;
    private ?Frontend $frontend = null;
    private ?ModalIntegration $modal = null;
    
    public function __construct(array $config) {
        $this->config = wp_parse_args($config, [
            'cache_prefix' => 'gh_browser_',
            'token_key' => 'github_token',
            'protocol' => 'github-release://'
        ]);
        
        // Initialize core services
        $this->github_api = new GitHubAPI(
            new HttpClient(),
            new Cache($this->config['cache_prefix']),
            new Config(['token_key' => $this->config['token_key']])
        );
        
        $this->uri_parser = new URIParser($this->config['protocol']);
        $this->asset_resolver = new AssetResolver();
        
        // Initialize frontend (auto-enqueues assets)
        $this->frontend = new Frontend($this->config);
        $this->frontend->init();
    }
    
    public function get_github_api(): GitHubAPI {
        return $this->github_api;
    }
    
    public function get_uri_parser(): URIParser {
        return $this->uri_parser;
    }
    
    public function get_asset_resolver(): AssetResolver {
        return $this->asset_resolver;
    }
    
    public function register_modal_integration(): void {
        if (!$this->modal) {
            $this->modal = new ModalIntegration($this->config, $this);
            $this->modal->init();
        }
    }
}
```

### 11. Create Frontend Class

`src/php/Includes/Frontend.php` (similar to ArtsLicensePro's Frontend):

```php
namespace Arts\GH\ReleaseBrowser\Includes;

class Frontend {
    private array $config;
    private string $assets_path;
    private string $assets_url;
    
    public function __construct(array $config) {
        $this->config = $config;
        $this->assets_path = dirname(__DIR__) . '/libraries/github-release-browser/';
        $this->assets_url = plugins_url('libraries/github-release-browser/', dirname(__DIR__) . '/Browser.php');
    }
    
    public function init(): void {
        add_action('admin_enqueue_scripts', [$this, 'enqueue_scripts']);
    }
    
    public function enqueue_scripts(): void {
        static $enqueued = false;
        
        if ($enqueued) {
            return;
        }
        
        $enqueued = true;
        
        wp_enqueue_script(
            'github-release-browser',
            $this->assets_url . 'index.js',
            ['react', 'react-dom', 'wp-element', 'wp-components', 'wp-i18n'],
            false,
            true
        );
        
        wp_enqueue_style(
            'github-release-browser',
            $this->assets_url . 'index.css',
            [],
            false
        );
    }
}
```

### 12. Create ModalIntegration Class

`src/php/Includes/ModalIntegration.php`:

```php
namespace Arts\GH\ReleaseBrowser\Includes;

use Arts\GH\ReleaseBrowser\Browser;

class ModalIntegration {
    private array $config;
    private Browser $browser;
    
    public function __construct(array $config, Browser $browser) {
        $this->config = $config;
        $this->browser = $browser;
    }
    
    public function init(): void {
        add_filter('media_upload_tabs', [$this, 'add_github_tab']);
        add_action('media_upload_github_releases', [$this, 'render_browser']);
    }
    
    public function add_github_tab(array $tabs): array {
        $tabs['github_releases'] = __('GitHub Releases', 'github-release-browser');
        return $tabs;
    }
    
    public function render_browser(): void {
        wp_iframe([$this, 'browser_iframe_content']);
    }
    
    public function browser_iframe_content(): void {
        echo '<div id="github-release-browser-root" data-config="' . 
            esc_attr(wp_json_encode($this->config)) . '"></div>';
    }
}
```

## TypeScript/React Frontend Extraction

### 13. Extract Constants

`src/ts/constants/API.ts`:

```typescript
export const DEFAULT_PROTOCOL = 'github-release://'
export const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB']
```

### 14. Extract Interfaces

Create in `src/ts/interfaces/` (one per file, `I` prefix):

**IGitHub.ts**: IRepo, IRelease, IAsset, IRateLimit

**IBrowserConfig.ts**:

```typescript
export interface IBrowserConfig {
  apiUrl: string
  nonce: string
  actionPrefix: string
  protocol?: string
  onSelectAsset: (asset: ISelectedAsset) => void
  features?: { useLatestRelease?: boolean; [key: string]: boolean }
  upgradeUrl?: string
  strings?: Record<string, string>
  textDomain?: string
}
```

### 15. Extract Types

Create in `src/ts/types/` (one per file, `T` prefix):

**TBrowserView.ts**: `type TBrowserView = 'repos' | 'assets'`

### 16. Extract Components

From `src/ts/core/browser/` to `src/ts/components/`:

**BrowserApp.tsx**: Remove window.releaseDeployEDD, accept config prop, use config.onSelectAsset callback

**ReleaseList.tsx**: Rename ProBadge to FeatureBadge

**AssetList.tsx**: Generic implementation

**FeatureBadge.tsx**: Renamed from ProBadge

### 17. Extract GitHubService

Update to accept actionPrefix in constructor:

```typescript
class GitHubService {
  constructor(private config: { apiUrl: string; nonce: string; actionPrefix: string }) {}
  
  private getAction(action: string): string {
    return `${this->config.actionPrefix}_${action}`
  }
}
```

### 18. Extract Hooks and Utilities

Copy from current plugin:

- `hooks/useGitHubFiles.ts`
- `hooks/usePolling.ts`
- `utils/format.ts`
- `utils/github.ts` (update to use DEFAULT_PROTOCOL)
- `utils/errorHandler.ts`

### 19. Create TypeScript global.d.ts

```typescript
declare global {
  interface Window {
    wp: {
      element: typeof import('@wordpress/element')
      components: typeof import('@wordpress/components')
      i18n: typeof import('@wordpress/i18n')
    }
  }
  const wp: Window['wp']
}
export {}
```

### 20. Create Main Export

`src/ts/index.ts`:

```typescript
export { BrowserApp } from './components/BrowserApp'
export { GitHubService } from './services/GitHubService'
export { FeatureBadge } from './components/FeatureBadge'

export type { IBrowserConfig } from './interfaces/IBrowserConfig'
export type { IAsset, IRelease, IRepo } from './interfaces/IGitHub'
```

## SASS Styles Extraction

### 21. Extract Styles

Copy from `src/styles/core/`:

- Update CSS vars to `--gh-browser-*` prefix
- Keep BEM with `_` modifiers
- Rename `_pro-badge.sass` to `_feature-badge.sass`

## Documentation

### 22. Create README.md

Include:

- Installation (Composer + NPM)
- PHP usage example with Browser class
- TypeScript configuration example
- ModalIntegration setup
- Configuration options

## Update Release Deploy EDD Lite

### 23. Add Package Dependencies

`composer.json`:

```json
"repositories": [{
  "type": "path",
  "url": "../../../Framework/packages/ArtsGithubReleaseBrowser"
}],
"require": {
  "arts/github-release-browser": "@dev"
}
```

`package.json`:

```json
"dependencies": {
  "@arts/github-release-browser": "file:../../../Framework/packages/ArtsGithubReleaseBrowser"
}
```

### 24. Initialize Browser in Plugin

`src/php/Plugin.php`:

```php
use Arts\GH\ReleaseBrowser\Browser;

protected function init() {
    $this->browser = new Browser([
        'cache_prefix' => 'edd_release_deploy_',
        'token_key' => 'edd_release_deploy_token',
        'protocol' => 'edd-release-deploy://'
    ]);
    
    $this->browser->register_modal_integration();
    
    parent::init();
}
```

### 25. Create Wrapper Services

Delegate to package services:

```php
class GitHubAPI extends Service {
    public function get_releases($repo, $page = 1) {
        return $this->plugin->browser->get_github_api()->getReleases($repo, $page);
    }
}
```

### 26. Update TypeScript Entry

`src/ts/admin-init-core.ts`:

```typescript
import { BrowserApp } from '@arts/github-release-browser'

render(
  <BrowserApp 
    config={{
      apiUrl: window.releaseDeployEDD.ajaxUrl,
      nonce: window.releaseDeployEDD.contexts.browser?.nonce,
      actionPrefix: 'edd_release_deploy',
      protocol: 'edd-release-deploy://',
      onSelectAsset: (asset) => {
        // EDD field injection
      },
      features: window.releaseDeployEDD.features,
      upgradeUrl: window.releaseDeployEDD.purchaseUrl
    }}
  />,
  rootElement
)
```

### 27. Remove Extracted Code

Delete:

- `src/ts/core/browser/`
- `src/ts/core/services/GitHubService.ts`
- Core utilities (replaced by package)
- Browser styles (using package styles)

### To-dos

- [ ] Create package directory structure and base configuration files
- [ ] Configure __build__ git submodule and build system integration
- [ ] Extract and create core PHP interfaces (IHttpClient, ICache, IConfig)
- [ ] Extract core PHP services (GitHubAPI, URIParser, AssetResolver) with dependency injection
- [ ] Create WordPress adapter implementations (HttpClient, Cache, Config)
- [ ] Extract and refactor TypeScript browser components (BrowserApp, ReleaseList, AssetList)
- [ ] Extract TypeScript services, hooks, and utilities
- [ ] Extract SASS styles with configurable CSS custom properties
- [ ] Create optional WordPress modal adapter for media library integration
- [ ] Create README with installation, usage examples, and API reference
- [ ] Test package build system and verify output
- [ ] Update Release Deploy EDD to use package as dependency
- [ ] Test full integration in Release Deploy EDD plugin