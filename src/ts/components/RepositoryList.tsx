import type React from 'react'
import { IRepositoryListProps } from '../interfaces/IRepositoryListProps'
import { ReleaseList } from './ReleaseList'
import { getString } from '../utils/getString'

const { Panel, PanelBody, Spinner } = wp.components

/**
 * Repository list component with expansion and release selection
 */
export const RepositoryList: React.FC<IRepositoryListProps> = ({
  repos,
  searchQuery,
  expandedRepo,
  selectedRepo,
  repoReleases,
  releaseErrors,
  loadingRepo,
  selectedReleaseTag,
  onRepoToggle,
  onSelectRelease,
  fetchReleasesForRepo,
  config
}) => {
  const filteredRepos = repos.filter((repo) =>
    repo.full_name?.toLowerCase().includes(searchQuery?.toLowerCase() || '')
  )

  if (filteredRepos.length === 0) {
    return (
      <p className="github-release-browser-browser__no-results">
        {searchQuery
          ? config.strings?.['repositories.noResults'] || getString('repositories.noResults')
          : config.strings?.['repositories.noneFound'] || getString('repositories.noneFound')}
      </p>
    )
  }

  return (
    <Panel>
      {filteredRepos.map((repo) => {
        const isSelected = selectedRepo === repo.full_name
        const selectedPrefix = isSelected ? '✓ ' : ''
        const lockSuffix = repo.private ? ' *' : ''
        const title = selectedPrefix + repo.full_name + lockSuffix

        return (
          <PanelBody
            key={repo.id}
            title={title}
            opened={repo.full_name ? expandedRepo === repo.full_name : false}
            onToggle={() => {
              if (repo && repo.full_name) {
                onRepoToggle(repo.full_name)
              }
            }}
          >
            {repo.full_name && loadingRepo === repo.full_name && (
              <div className="github-release-browser-repo-panel__loading">
                <Spinner />
              </div>
            )}

            {!loadingRepo && repo.full_name && (
              <ReleaseList
                releases={repoReleases[repo.full_name] || []}
                selectedRelease={repo.full_name && selectedRepo === repo.full_name ? selectedReleaseTag : null}
                onSelectRelease={(release) => onSelectRelease(repo.full_name, release)}
                repository={repo.full_name}
                strings={config.strings}
                features={config.features}
                upgradeUrl={config.upgradeUrl}
                error={releaseErrors[repo.full_name]}
                onRetry={() => fetchReleasesForRepo(repo.full_name)}
              />
            )}
          </PanelBody>
        )
      })}
    </Panel>
  )
}
