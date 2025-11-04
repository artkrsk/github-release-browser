import { useState, useRef } from 'react'
import { IRepo, IRelease, IAsset } from '../interfaces'
import { TBrowserView, TUseBrowserStateReturn } from '../types'

/**
 * Hook to manage all browser state
 * Centralizes state initialization and provides utilities for state management
 */
export const useBrowserState = (): TUseBrowserStateReturn => {
  // View state
  const [view, setView] = useState<TBrowserView>('repos')

  // Repository state
  const [repos, setRepos] = useState<IRepo[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null)
  const [repoReleases, setRepoReleases] = useState<{ [key: string]: IRelease[] }>({})
  const [releaseErrors, setReleaseErrors] = useState<{ [key: string]: string | null }>({})
  const [loadingRepos, setLoadingRepos] = useState(true)
  const [loadingRepo, setLoadingRepo] = useState<string | null>(null)

  // Selection state
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
  const [selectedReleaseTag, setSelectedReleaseTag] = useState<string | null>(null)
  const [selectedRelease, setSelectedRelease] = useState<IRelease | 'latest' | null>(null)
  const [selectedAssetObj, setSelectedAssetObj] = useState<IAsset | null>(null)

  // Error state
  const [error, setError] = useState<string | null>(null)

  // Ref for component mount status
  const isMountedRef = useRef(true)

  return {
    // View state
    view,
    setView,

    // Repository state
    repos,
    setRepos,
    searchQuery,
    setSearchQuery,
    expandedRepo,
    setExpandedRepo,
    repoReleases,
    setRepoReleases,
    releaseErrors,
    setReleaseErrors,
    loadingRepos,
    setLoadingRepos,
    loadingRepo,
    setLoadingRepo,

    // Selection state
    selectedRepo,
    setSelectedRepo,
    selectedReleaseTag,
    setSelectedReleaseTag,
    selectedRelease,
    setSelectedRelease,
    selectedAssetObj,
    setSelectedAssetObj,

    // Error state
    error,
    setError,

    // Refs
    isMountedRef
  }
}