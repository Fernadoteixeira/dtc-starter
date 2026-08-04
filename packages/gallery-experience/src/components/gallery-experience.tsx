import React from "react";
import { GalleryExperienceProps, GalleryItem } from "../types/index";

function StaticSceneRail({ scenes }: { scenes: GalleryItem["scenes"] }) {
  return (
    <div className="dtc-gallery__scene-rail" aria-hidden="true">
      {scenes.slice(0, 3).map((scene) => (
        <div key={scene.id} className="dtc-gallery__scene">
          <img
            src={scene.image.url}
            alt=""
            className="dtc-gallery__scene-image"
            width={scene.image.width}
            height={scene.image.height}
          />
        </div>
      ))}
    </div>
  );
}

function StaticArtworkCard({
  item,
  role,
}: {
  item: GalleryItem;
  role: "active" | "adjacent" | "continuation";
}) {
  const isActive = role === "active";
  const isAdjacent = role === "adjacent";
  const isContinuation = role === "continuation";

  let cardClass = "dtc-gallery__card";
  if (isActive) cardClass += " dtc-gallery__card--active";
  if (isAdjacent) cardClass += " dtc-gallery__card--adjacent";
  if (isContinuation) cardClass += " dtc-gallery__card--continuation";

  if (!isActive) {
    return (
      <article className={cardClass} aria-hidden="true">
        <div className="dtc-gallery__media">
          <img
            src={item.primaryImage.url}
            alt=""
            className="dtc-gallery__image"
            width={item.primaryImage.width}
            height={item.primaryImage.height}
          />
        </div>
      </article>
    );
  }

  return (
    <article className={cardClass}>
      <div className="dtc-gallery__media">
        <img
          src={item.primaryImage.url}
          alt={item.primaryImage.alt}
          className="dtc-gallery__image"
          width={item.primaryImage.width}
          height={item.primaryImage.height}
        />
        <StaticSceneRail scenes={item.scenes} />
      </div>
      <div className="dtc-gallery__caption">
        <span className="dtc-gallery__artwork-index" aria-hidden="true">
          01
        </span>
        <h2 className="dtc-gallery__artwork-title">{item.title}</h2>
      </div>
    </article>
  );
}

function StaticNavigation({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="dtc-gallery__navigation" aria-hidden="true">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={`dtc-gallery__navigation-dot ${
            index === current ? "dtc-gallery__navigation-dot--active" : ""
          }`}
        />
      ))}
    </div>
  );
}

export function GalleryExperience({
  items,
  collectionTitle = "Fio Vivo",
  collectionNumber = "01",
  collectionNarrative = "O crochê se move",
}: GalleryExperienceProps) {
  const activeItem = items[0];
  const adjacentItem = items[1];
  const continuationItem = items[2];
  const totalCount = items.length;
  const formattedCounter = `01 / ${String(totalCount).padStart(2, "0")}`;

  return (
    <div data-gallery-experience="true" className="dtc-gallery">
      <div className="dtc-gallery__ambient" aria-hidden="true">
        <div className="dtc-gallery__ambient-layer" />
      </div>

      <aside className="dtc-gallery__editorial">
        <p className="dtc-gallery__collection-number">
          Coleção Nº {collectionNumber}
        </p>
        <h1 className="dtc-gallery__collection-title">{collectionTitle}</h1>
        <p className="dtc-gallery__collection-narrative">
          {collectionNarrative}
        </p>
        <span className="dtc-gallery__counter">{formattedCounter}</span>
      </aside>

      <div className="dtc-gallery__viewport">
        <div className="dtc-gallery__track">
          {activeItem && <StaticArtworkCard item={activeItem} role="active" />}
          {adjacentItem && (
            <StaticArtworkCard item={adjacentItem} role="adjacent" />
          )}
          {continuationItem && (
            <StaticArtworkCard item={continuationItem} role="continuation" />
          )}
        </div>
      </div>

      <StaticNavigation current={0} total={totalCount} />

      <span className="dtc-gallery__cta" aria-hidden="true">
        Conhecer a peça
      </span>
    </div>
  );
}

