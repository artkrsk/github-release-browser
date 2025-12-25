import type React from 'react'
import { IContentItem } from '../interfaces'

const { Card, CardBody, Spinner } = wp.components

export interface IDirectoryBrowserProps {
  contents: IContentItem[]
  currentPath: string
  selectedFolderPath: string | null
  onNavigate: (path: string) => void
  onSelectFolder: (path: string) => void
  loading?: boolean
  repositoryName?: string
}

/**
 * Directory browser with breadcrumb navigation and folder selection
 */
export const DirectoryBrowser: React.FC<IDirectoryBrowserProps> = ({
  contents,
  currentPath,
  selectedFolderPath,
  onNavigate,
  onSelectFolder,
  loading = false,
  repositoryName = ''
}) => {
  const getBreadcrumbs = () => {
    if (!currentPath) {
      return [{ name: repositoryName || 'root', path: '' }]
    }

    const parts = currentPath.split('/').filter(Boolean)
    const breadcrumbs = [{ name: repositoryName || 'root', path: '' }]

    let accumulatedPath = ''
    for (const part of parts) {
      accumulatedPath += (accumulatedPath ? '/' : '') + part
      breadcrumbs.push({ name: part, path: accumulatedPath })
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  // Separate folders and files
  const folders = contents.filter(item => item.type === 'dir')
  const files = contents.filter(item => item.type === 'file')

  return (
    <div className="github-release-browser-directory">
      {/* Breadcrumb navigation */}
      <div className="github-release-browser-directory__breadcrumb">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.path}>
            {index > 0 && <span className="github-release-browser-directory__breadcrumb-separator"> / </span>}
            <button
              type="button"
              className="github-release-browser-directory__breadcrumb-item"
              onClick={() => onNavigate(crumb.path)}
            >
              {crumb.name}
            </button>
          </span>
        ))}
      </div>

      {loading ? (
        <div className="github-release-browser-directory__loading">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Root folder option */}
          <div className="github-release-browser-directory__list">
            <Card
              className={`github-release-browser-directory__item github-release-browser-directory__root-option ${
                selectedFolderPath === currentPath ? 'github-release-browser-directory__item_selected' : ''
              }`}
              onClick={() => onSelectFolder(currentPath)}
            >
              <CardBody>
                <div className="github-release-browser-directory__item-content">
                  <input
                    type="radio"
                    checked={selectedFolderPath === currentPath}
                    onChange={() => onSelectFolder(currentPath)}
                    className="github-release-browser-directory__radio"
                  />
                  <span className="dashicons dashicons-portfolio github-release-browser-directory__icon"></span>
                  <span className="github-release-browser-directory__name">
                    Use current folder
                  </span>
                </div>
              </CardBody>
            </Card>

            {/* Folders (selectable and navigable) */}
            {folders.map((item) => {
              const itemPath = item.path
              const isSelected = selectedFolderPath === itemPath

              return (
                <Card
                  key={item.sha}
                  className={`github-release-browser-directory__item github-release-browser-directory__item_folder ${
                    isSelected ? 'github-release-browser-directory__item_selected' : ''
                  }`}
                >
                  <CardBody>
                    <div className="github-release-browser-directory__item-content">
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => onSelectFolder(itemPath)}
                        className="github-release-browser-directory__radio"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="dashicons dashicons-portfolio github-release-browser-directory__icon"></span>
                      <button
                        type="button"
                        className="github-release-browser-directory__name"
                        onClick={() => onNavigate(itemPath)}
                      >
                        {item.name}
                      </button>
                    </div>
                  </CardBody>
                </Card>
              )
            })}

            {/* Files (not selectable, grayed out) */}
            {files.map((item) => (
              <Card
                key={item.sha}
                className="github-release-browser-directory__item github-release-browser-directory__item_file"
              >
                <CardBody>
                  <div className="github-release-browser-directory__item-content">
                    <span className="dashicons dashicons-media-default github-release-browser-directory__icon"></span>
                    <span className="github-release-browser-directory__name">{item.name}</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {folders.length === 0 && files.length === 0 && (
            <p className="github-release-browser-directory__empty">This directory is empty</p>
          )}
        </>
      )}
    </div>
  )
}
