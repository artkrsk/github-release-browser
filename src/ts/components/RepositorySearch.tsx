import type React from 'react'
import { IRepositorySearchProps } from '../interfaces/IRepositorySearchProps'
import { getString } from '../utils/getString'

const { Button, SearchControl } = wp.components

/**
 * Repository search and controls component
 */
export const RepositorySearch: React.FC<IRepositorySearchProps> = ({
  searchQuery,
  onSearchChange,
  onRefresh,
  refreshDisabled = false,
  strings = {}
}) => {
  return (
    <div className="github-release-browser-browser__header">
      <div className="github-release-browser-browser__controls">
        <h2>{strings.selectRepo || getString('repositories.select')}</h2>
        <Button
          variant="tertiary"
          icon="update"
          onClick={onRefresh}
          disabled={refreshDisabled}
          label={strings.refresh || getString('repositories.refresh')}
          className="github-release-browser-browser__refresh-button"
        />
      </div>
      <SearchControl
        value={searchQuery}
        onChange={onSearchChange}
        placeholder={strings.search || getString('repositories.searchPlaceholder')}
        className="github-release-browser-browser__search"
      />
    </div>
  )
}
