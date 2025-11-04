import { describe, test, expect } from 'vitest'
import { parseGitHubUrl, buildGitHubUrl } from '@/utils/github'

describe('parseGitHubUrl utility', () => {
  test('parses valid GitHub URL with all components', () => {
    const url = 'github-release://owner/repo/release/filename.ext'
    const result = parseGitHubUrl(url)

    expect(result).toEqual({
      owner: 'owner',
      repo: 'repo',
      release: 'release',
      filename: 'filename.ext'
    })
  })

  test('parses URL with "latest" release', () => {
    const url = 'github-release://owner/repo/latest/filename.ext'
    const result = parseGitHubUrl(url)

    expect(result).toEqual({
      owner: 'owner',
      repo: 'repo',
      release: 'latest',
      filename: 'filename.ext'
    })
  })

  test('parses URL with complex repository names', () => {
    const url = 'github-release://my-org/my-repo/v1.2.3/my-file.tar.gz'
    const result = parseGitHubUrl(url)

    expect(result).toEqual({
      owner: 'my-org',
      repo: 'my-repo',
      release: 'v1.2.3',
      filename: 'my-file.tar.gz'
    })
  })

  test('parses URL with numbers and special characters', () => {
    const url = 'github-release://user123/repo-name/v2.0.0-alpha/file-name_123.zip'
    const result = parseGitHubUrl(url)

    expect(result).toEqual({
      owner: 'user123',
      repo: 'repo-name',
      release: 'v2.0.0-alpha',
      filename: 'file-name_123.zip'
    })
  })

  test('returns null for empty string', () => {
    const result = parseGitHubUrl('')
    expect(result).toBeNull()
  })

  test('returns null for null input', () => {
    const result = parseGitHubUrl(null as any)
    expect(result).toBeNull()
  })

  test('returns null for undefined input', () => {
    const result = parseGitHubUrl(undefined as any)
    expect(result).toBeNull()
  })

  test('returns null for URL without correct protocol', () => {
    const url = 'https://github.com/owner/repo/releases/download/release/filename.ext'
    const result = parseGitHubUrl(url)

    expect(result).toBeNull()
  })

  test('returns null for URL with missing components', () => {
    const url = 'github-release://owner/repo'
    const result = parseGitHubUrl(url)

    expect(result).toBeNull()
  })

  test('returns null for URL with only 3 components', () => {
    const url = 'github-release://owner/repo/release'
    const result = parseGitHubUrl(url)

    expect(result).toBeNull()
  })

  test('returns null for URL with empty components', () => {
    const url = 'github-release:///repo/release/filename.ext'
    const result = parseGitHubUrl(url)

    expect(result).toBeNull()
  })

  test('returns null for URL with missing owner', () => {
    const url = 'github-release:///repo/release/filename.ext'
    const result = parseGitHubUrl(url)

    expect(result).toBeNull()
  })

  test('returns null for URL with missing repo', () => {
    const url = 'github-release://owner//release/filename.ext'
    const result = parseGitHubUrl(url)

    expect(result).toBeNull()
  })

  test('returns null for URL with missing release', () => {
    const url = 'github-release://owner/repo//filename.ext'
    const result = parseGitHubUrl(url)

    expect(result).toBeNull()
  })

  test('returns null for URL with missing filename', () => {
    const url = 'github-release://owner/repo/release/'
    const result = parseGitHubUrl(url)

    expect(result).toBeNull()
  })

  test('handles URL with extra slashes at the end', () => {
    const url = 'github-release://owner/repo/release/filename.ext/'
    const result = parseGitHubUrl(url)

    // Should parse the first 4 components and ignore the rest
    expect(result).toEqual({
      owner: 'owner',
      repo: 'repo',
      release: 'release',
      filename: 'filename.ext'
    })
  })

  test('handles URL with more than 4 components', () => {
    const url = 'github-release://owner/repo/release/filename.ext/extra/path'
    const result = parseGitHubUrl(url)

    // Should parse the first 4 components
    expect(result).toEqual({
      owner: 'owner',
      repo: 'repo',
      release: 'release',
      filename: 'filename.ext'
    })
  })
})

describe('buildGitHubUrl utility', () => {
  test('builds URL with regular release tag', () => {
    const result = buildGitHubUrl('owner/repo', 'v1.0.0', 'file.zip')

    expect(result).toBe('github-release://owner/repo/v1.0.0/file.zip')
  })

  test('builds URL with latest release', () => {
    const result = buildGitHubUrl('owner/repo', 'latest', 'file.zip')

    expect(result).toBe('github-release://owner/repo/latest/file.zip')
  })

  test('builds URL with complex repository name', () => {
    const result = buildGitHubUrl('my-org/my-repo-name', 'v2.1.0-beta', 'my-file.tar.gz')

    expect(result).toBe('github-release://my-org/my-repo-name/v2.1.0-beta/my-file.tar.gz')
  })

  test('builds URL with numbers and special characters', () => {
    const result = buildGitHubUrl('user123/repo-name', 'v2.0.0-alpha', 'file-name_123.zip')

    expect(result).toBe('github-release://user123/repo-name/v2.0.0-alpha/file-name_123.zip')
  })

  test('builds URL with filename containing dots', () => {
    const result = buildGitHubUrl('owner/repo', 'v1.0.0', 'app.min.js')

    expect(result).toBe('github-release://owner/repo/v1.0.0/app.min.js')
  })

  test('builds URL with repository containing hyphens', () => {
    const result = buildGitHubUrl('organization-name/repository-name', 'release-tag', 'filename.ext')

    expect(result).toBe('github-release://organization-name/repository-name/release-tag/filename.ext')
  })

  test('builds URL with single-character components', () => {
    const result = buildGitHubUrl('a/b', 'c', 'd')

    expect(result).toBe('github-release://a/b/c/d')
  })

  test('builds URL with underscore in repository name', () => {
    const result = buildGitHubUrl('my_user/my_repo', 'v1.0.0', 'my_file.txt')

    expect(result).toBe('github-release://my_user/my_repo/v1.0.0/my_file.txt')
  })

  test('builds URL with filename containing multiple dots', () => {
    const result = buildGitHubUrl('owner/repo', 'v1.0.0', 'bundle.min.js.map')

    expect(result).toBe('github-release://owner/repo/v1.0.0/bundle.min.js.map')
  })

  test('builds URL with release tag containing forward slashes', () => {
    const result = buildGitHubUrl('owner/repo', 'v1.0.0/beta', 'file.zip')

    expect(result).toBe('github-release://owner/repo/v1.0.0/beta/file.zip')
  })

  test('builds URL with empty filename', () => {
    const result = buildGitHubUrl('owner/repo', 'v1.0.0', '')

    expect(result).toBe('github-release://owner/repo/v1.0.0/')
  })
})

describe('GitHub utility integration', () => {
  test('round-trip parsing and building URL', () => {
    const originalUrl = 'github-release://my-org/my-repo/v2.1.0-beta/app.min.js'
    const parsed = parseGitHubUrl(originalUrl)

    expect(parsed).not.toBeNull()

    if (parsed) {
      const rebuiltUrl = buildGitHubUrl(
        `${parsed.owner}/${parsed.repo}`,
        parsed.release,
        parsed.filename
      )

      expect(rebuiltUrl).toBe(originalUrl)
    }
  })

  test('round-trip parsing and building with latest', () => {
    const originalUrl = 'github-release://owner/repo/latest/file.zip'
    const parsed = parseGitHubUrl(originalUrl)

    expect(parsed).not.toBeNull()

    if (parsed) {
      const rebuiltUrl = buildGitHubUrl(
        `${parsed.owner}/${parsed.repo}`,
        parsed.release,
        parsed.filename
      )

      expect(rebuiltUrl).toBe(originalUrl)
    }
  })
})