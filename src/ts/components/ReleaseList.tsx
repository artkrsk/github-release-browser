import type React from 'react'
import { IReleaseListProps } from '../interfaces'
import { FeatureBadge } from './FeatureBadge'
import { formatDate } from '../utils/format'
import { getString } from '../utils/getString'

const { Card, CardBody } = wp.components

export const ReleaseList: React.FC<IReleaseListProps> = ({
  releases,
  selectedRelease,
  onSelectRelease,
  repository,
  strings = {},
  features,
  upgradeUrl,
  error,
  onRetry
}) => {
  const isLatestSelected = selectedRelease === 'latest'
  const isLatestProFeature = features && !features.useLatestRelease

  if (error) {
    return (
      <p className="github-release-browser-release-list__empty github-release-browser-release-list__error">
        {error}{' '}
        {onRetry && (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onRetry()
            }}
          >
            {strings.retry || getString('common.retry')}
          </a>
        )}
      </p>
    )
  }

  if (releases.length === 0) {
    return (
      <p className="github-release-browser-release-list__empty">
        {strings.noReleases || getString('releases.noReleases')}{' '}
        {repository && (
          <a
            href={`https://github.com/${repository}/releases/new`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {strings.createOne || getString('releases.createOne')}
          </a>
        )}
      </p>
    )
  }

  return (
    <div className="github-release-browser-release-list">
      <Card
        className={`github-release-browser-release-card github-release-browser-release-card_latest ${
          isLatestProFeature
            ? 'github-release-browser-release-card_pro'
            : isLatestSelected
              ? 'github-release-browser-card_selected'
              : ''
        }`}
        onClick={() => {
          if (isLatestProFeature && upgradeUrl) {
            window.open(upgradeUrl, '_blank')
          } else {
            onSelectRelease('latest')
          }
        }}
      >
        <CardBody className="github-release-browser-card__body">
          <div className="github-release-browser-card__content">
            <div>
              <div className="github-release-browser-card__star-title">
                <span className="dashicons dashicons-star-filled"></span>
                <strong>{strings.useLatestRelease || getString('releases.useLatest')}</strong>
              </div>
              <p className="github-release-browser-card__meta">
                {strings.useLatestReleaseDesc || getString('releases.latestDescription')}
              </p>
            </div>
            <span className="github-release-browser-card__check">
              {isLatestProFeature ? (
                <FeatureBadge feature={strings.getPro || getString('common.getPro')} />
              ) : isLatestSelected ? (
                <span className="dashicons dashicons-yes"></span>
              ) : (
                <span className="dashicons dashicons-ellipsis"></span>
              )}
            </span>
          </div>
        </CardBody>
      </Card>

      <h3 className="github-release-browser-release-list__heading">{strings.releases || getString('releases.title')}</h3>

      {releases.map((release) => {
        const isSelected = selectedRelease === release.tag_name

        return (
          <Card
            key={release.id}
            className={`github-release-browser-release-card ${isSelected ? 'github-release-browser-card_selected' : ''}`}
            onClick={() => onSelectRelease(release)}
          >
            <CardBody className="github-release-browser-card__body">
              <div className="github-release-browser-card__content">
                <div className="github-release-browser-card__info">
                  <div className="github-release-browser-card__title">
                    {release.tag_name}
                    {release.name && release.name !== release.tag_name && (
                      <span className="github-release-browser-card__subtitle"> - {release.name}</span>
                    )}
                  </div>
                  <div className="github-release-browser-card__meta">
                    {formatDate(release.published_at)} • {release.assets.length}{' '}
                    {release.assets.length === 1 ? strings.asset || getString('assets.asset') : strings.assets || getString('assets.assets')}
                  </div>
                </div>
                <span className="github-release-browser-card__dots">
                  {isSelected ? (
                    <span className="dashicons dashicons-yes"></span>
                  ) : (
                    <span className="dashicons dashicons-ellipsis"></span>
                  )}
                </span>
              </div>
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
}
