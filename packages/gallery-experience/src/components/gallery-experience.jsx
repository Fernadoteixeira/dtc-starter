import React from "react";
import { resolveGalleryLocale, translateGallery, } from "../i18n/dictionary";
const SCENE_LABEL_KEYS = [
    "gallery.scene.profile",
    "gallery.scene.gesture",
    "gallery.scene.detail",
];
function StaticSceneRail({ scenes, locale, }) {
    return (<div className="dtc-gallery__scene-rail" aria-hidden="true">
      {scenes.slice(0, 3).map((scene, index) => (<div key={scene.id} className="dtc-gallery__scene">
          <img src={scene.image.url} alt="" title={translateGallery(locale, SCENE_LABEL_KEYS[index] ?? SCENE_LABEL_KEYS[0])} className="dtc-gallery__scene-image" width={scene.image.width} height={scene.image.height}/>
        </div>))}
    </div>);
}
function StaticArtworkCard({ item, role, locale, }) {
    const isActive = role === "active";
    const isAdjacent = role === "adjacent";
    const isContinuation = role === "continuation";
    let cardClass = "dtc-gallery__card";
    if (isActive)
        cardClass += " dtc-gallery__card--active";
    if (isAdjacent)
        cardClass += " dtc-gallery__card--adjacent";
    if (isContinuation)
        cardClass += " dtc-gallery__card--continuation";
    if (!isActive) {
        return (<article className={cardClass} aria-hidden="true">
        <div className="dtc-gallery__media">
          <img src={item.primaryImage.url} alt="" className="dtc-gallery__image" width={item.primaryImage.width} height={item.primaryImage.height}/>
        </div>
      </article>);
    }
    return (<article className={cardClass}>
      <div className="dtc-gallery__media">
        <img src={item.primaryImage.url} alt={item.primaryImage.alt} className="dtc-gallery__image" width={item.primaryImage.width} height={item.primaryImage.height}/>
        <StaticSceneRail scenes={item.scenes} locale={locale}/>
      </div>
      <div className="dtc-gallery__caption">
        <span className="dtc-gallery__artwork-index" aria-hidden="true">
          01
        </span>
        <h2 className="dtc-gallery__artwork-title">{item.title}</h2>
      </div>
    </article>);
}
function StaticNavigation({ current, total, }) {
    return (<div className="dtc-gallery__navigation" aria-hidden="true">
      {Array.from({ length: total }).map((_, index) => (<div key={index} className={`dtc-gallery__navigation-dot ${index === current ? "dtc-gallery__navigation-dot--active" : ""}`}/>))}
    </div>);
}
export function GalleryExperience({ items, collectionTitle = "Fio Vivo", collectionNumber = "01", collectionNarrative, locale: localeInput, }) {
    const locale = resolveGalleryLocale(localeInput);
    const activeItem = items[0];
    const adjacentItem = items[1];
    const continuationItem = items[2];
    const totalCount = items.length;
    // Format fixed at "01 / NN" per BB-04 fixture contract (Section 2), independent of locale.
    const formattedCounter = `01 / ${String(totalCount).padStart(2, "0")}`;
    const tagline = collectionNarrative ?? translateGallery(locale, "gallery.tagline");
    const collectionLabel = translateGallery(locale, "gallery.collection", {
        number: collectionNumber,
    });
    return (<div data-gallery-experience="true" className="dtc-gallery" lang={locale}>
      <div className="dtc-gallery__ambient" aria-hidden="true">
        <div className="dtc-gallery__ambient-layer"/>
      </div>

      <aside className="dtc-gallery__editorial">
        <p className="dtc-gallery__collection-number">{collectionLabel}</p>
        <h1 className="dtc-gallery__collection-title">{collectionTitle}</h1>
        <p className="dtc-gallery__collection-narrative">{tagline}</p>
        <span className="dtc-gallery__counter">{formattedCounter}</span>
      </aside>

      <div className="dtc-gallery__viewport">
        <div className="dtc-gallery__track">
          {activeItem && (<StaticArtworkCard item={activeItem} role="active" locale={locale}/>)}
          {adjacentItem && (<StaticArtworkCard item={adjacentItem} role="adjacent" locale={locale}/>)}
          {continuationItem && (<StaticArtworkCard item={continuationItem} role="continuation" locale={locale}/>)}
        </div>
      </div>

      <StaticNavigation current={0} total={totalCount}/>

      <span className="dtc-gallery__cta" aria-hidden="true">
        {translateGallery(locale, "gallery.cta")}
      </span>
    </div>);
}
