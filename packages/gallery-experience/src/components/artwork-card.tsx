import React from "react";
import { GalleryItem } from "../types/index";

export interface ArtworkCardProps {
  artwork: GalleryItem;
  isActive: boolean;
  onClick?: () => void;
}

export function ArtworkCard({ artwork, isActive, onClick }: ArtworkCardProps) {
  return (
    <article
      onClick={onClick}
      className={`dtc-gallery__card ${
        isActive ? "dtc-gallery__card--active" : "dtc-gallery__card--adjacent"
      }`}
      aria-selected={isActive}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="dtc-gallery__media">
        <img
          src={artwork.primaryImage.url}
          alt={artwork.primaryImage.alt}
          className="dtc-gallery__image"
          loading={isActive ? "eager" : "lazy"}
        />
        <div className="dtc-gallery__overlay" aria-hidden="true" />
      </div>

      <div className="dtc-gallery__material-badge">
        <span className="dtc-gallery__badge-dot" aria-hidden="true" />
        <span className="dtc-gallery__badge-text">
          {artwork.material || "Handmade Textile"}
        </span>
      </div>

      {isActive && (
        <div className="dtc-gallery__caption">
          {artwork.year && (
            <div className="dtc-gallery__year-wrapper">
              <span className="dtc-gallery__artwork-index" aria-hidden="true">
                {artwork.year}
              </span>
              <span className="dtc-gallery__divider" aria-hidden="true" />
            </div>
          )}
          <h2 className="dtc-gallery__artwork-title">{artwork.title}</h2>
          {artwork.artist && (
            <p className="dtc-gallery__artist-text">
              por {artwork.artist}
            </p>
          )}
        </div>
      )}

      {/* Scene Rail for active card */}
      {isActive && artwork.scenes && artwork.scenes.length > 0 && (
        <div className="dtc-gallery__scene-rail" aria-label="Alternative views">
          {artwork.scenes.slice(0, 3).map((scene, idx) => (
            <div
              key={scene.id}
              className={`dtc-gallery__scene ${
                idx === 0 ? "dtc-gallery__scene--active" : ""
              }`}
            >
              <img
                src={scene.image.url}
                alt={scene.image.alt || scene.label}
                className="dtc-gallery__scene-image"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
