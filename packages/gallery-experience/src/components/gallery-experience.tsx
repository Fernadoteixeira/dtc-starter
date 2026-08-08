import React, { useState, useEffect, useCallback, useMemo } from "react";
import { GalleryExperienceProps, GalleryItem } from "../types/index";
import {
  GalleryLocale,
  resolveGalleryLocale,
  translateGallery,
} from "../i18n/dictionary";
import { GalleryAmbient } from "./gallery-ambient";

const SCENE_LABEL_KEYS = [
  "gallery.scene.profile",
  "gallery.scene.gesture",
  "gallery.scene.detail",
];

function SceneRail({
  scenes,
  locale,
  onSceneClick,
}: {
  scenes: GalleryItem["scenes"];
  locale: GalleryLocale;
  onSceneClick?: (scene: GalleryItem["scenes"][number]) => void;
}) {
  if (!scenes || scenes.length === 0) return null;

  return (
    <div className="dtc-gallery__scene-rail" aria-label="Alternative views">
      {scenes.slice(0, 3).map((scene, index) => (
        <button
          key={scene.id}
          type="button"
          className="dtc-gallery__scene"
          onClick={(e) => {
            e.stopPropagation();
            if (onSceneClick) onSceneClick(scene);
          }}
          title={translateGallery(locale, SCENE_LABEL_KEYS[index] ?? SCENE_LABEL_KEYS[0])}
        >
          <img
            src={scene.image.url}
            alt={scene.image.alt || scene.label}
            className="dtc-gallery__scene-image"
            width={scene.image.width}
            height={scene.image.height}
            loading="lazy"
          />
        </button>
      ))}
    </div>
  );
}

function InteractiveArtworkCard({
  item,
  index,
  role,
  locale,
  onClick,
  onSceneClick,
}: {
  item: GalleryItem;
  index: number;
  role: "active" | "adjacent" | "continuation";
  locale: GalleryLocale;
  onClick?: () => void;
  onSceneClick?: (scene: GalleryItem["scenes"][number]) => void;
}) {
  const isActive = role === "active";
  const isAdjacent = role === "adjacent";
  const isContinuation = role === "continuation";

  let cardClass = "dtc-gallery__card";
  if (isActive) cardClass += " dtc-gallery__card--active";
  if (isAdjacent) cardClass += " dtc-gallery__card--adjacent";
  if (isContinuation) cardClass += " dtc-gallery__card--continuation";

  const modelNumber = String(index + 1).padStart(2, "0");
  const sceneCount = item.scenes?.length || 1;

  return (
    <article
      className={cardClass}
      role={isActive ? "group" : "button"}
      aria-label={item.title}
      aria-current={isActive ? "true" : undefined}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="dtc-gallery__badge-model">
        MODELO {modelNumber}
      </div>

      {isActive && (
        <div className="dtc-gallery__badge-scene">
          1 DE {sceneCount} CENAS &bull; MOVA O CURSOR
        </div>
      )}

      <div className="dtc-gallery__media">
        <img
          src={item.primaryImage.url}
          alt={item.primaryImage.alt || item.title}
          className="dtc-gallery__image"
          width={item.primaryImage.width}
          height={item.primaryImage.height}
          loading={isActive ? "eager" : "lazy"}
        />
        <div className="dtc-gallery__overlay" aria-hidden="true" />
      </div>

      {isActive && (
        <>
          <SceneRail
            scenes={item.scenes}
            locale={locale}
            onSceneClick={onSceneClick}
          />

          <div className="dtc-gallery__caption">
            <span className="dtc-gallery__artwork-index" aria-hidden="true">
              {item.year || "2020"} &bull;
            </span>

            <h2 className="dtc-gallery__artwork-title">{item.title}</h2>

            <p className="dtc-gallery__artwork-subtitle">
              Crochê em movimento
            </p>

            <p className="dtc-gallery__artwork-credit">
              POR @LUIZASCROCHE &bull; BRASIL - ARACAJU-SE &bull; {item.artist || "Fio Vivo"}
            </p>

            <div className="flex items-center justify-between text-[10px] font-mono text-white/50 mt-1 pt-1 border-t border-white/10">
              <span>01 / {String(sceneCount).padStart(2, "0")}</span>
              <span className="text-[#d48c46]">FRENTE &check;</span>
            </div>
          </div>
        </>
      )}
    </article>
  );
}

function NavigationControls({
  current,
  total,
  onSelect,
  onPrev,
  onNext,
}: {
  current: number;
  total: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <nav className="dtc-gallery__navigation" aria-label="Gallery pagination">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous artwork"
          className="dtc-gallery__nav-btn p-2 text-white/60 hover:text-white transition-colors"
        >
          &larr;
        </button>

        <div className="flex items-center gap-1.5" role="tablist">
          {Array.from({ length: total }).map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === current}
              aria-label={`Go to artwork ${index + 1}`}
              onClick={() => onSelect(index)}
              className={`dtc-gallery__navigation-dot cursor-pointer transition-all ${
                index === current ? "dtc-gallery__navigation-dot--active w-6" : "w-2 opacity-50"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onNext}
          aria-label="Next artwork"
          className="dtc-gallery__nav-btn p-2 text-white/60 hover:text-white transition-colors"
        >
          &rarr;
        </button>
      </div>
    </nav>
  );
}

export function GalleryExperience({
  items,
  collectionTitle = "Fio Vivo",
  collectionNumber = "01",
  collectionNarrative,
  initialItemHandle,
  locale: localeInput,
  reducedMotion,
  onItemView,
  onSceneView,
  onProductIntent,
  onShare,
  onProgressChange,
}: GalleryExperienceProps) {
  const locale = resolveGalleryLocale(localeInput);
  const totalCount = items?.length || 0;

  const initialIndex = useMemo(() => {
    if (!initialItemHandle || !items) return 0;
    const foundIdx = items.findIndex((it) => it.handle === initialItemHandle);
    return foundIdx >= 0 ? foundIdx : 0;
  }, [initialItemHandle, items]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const activeItem = items?.[currentIndex] || items?.[0];
  const adjacentItem = items?.[(currentIndex + 1) % totalCount];
  const continuationItem = items?.[(currentIndex + 2) % totalCount];

  const formattedCounter = `${String(currentIndex + 1).padStart(2, "0")} / ${String(
    totalCount
  ).padStart(2, "0")}`;

  const tagline =
    collectionNarrative ?? translateGallery(locale, "gallery.tagline");
  const collectionLabel = translateGallery(locale, "gallery.collection", {
    number: collectionNumber,
  });

  const goToNext = useCallback(() => {
    if (totalCount === 0) return;
    const nextIdx = (currentIndex + 1) % totalCount;
    setCurrentIndex(nextIdx);
    if (onProgressChange) {
      onProgressChange({ currentIndex: nextIdx, totalItems: totalCount });
    }
  }, [currentIndex, totalCount, onProgressChange]);

  const goToPrev = useCallback(() => {
    if (totalCount === 0) return;
    const prevIdx = (currentIndex - 1 + totalCount) % totalCount;
    setCurrentIndex(prevIdx);
    if (onProgressChange) {
      onProgressChange({ currentIndex: prevIdx, totalItems: totalCount });
    }
  }, [currentIndex, totalCount, onProgressChange]);

  const selectIndex = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < totalCount) {
        setCurrentIndex(idx);
        if (onProgressChange) {
          onProgressChange({ currentIndex: idx, totalItems: totalCount });
        }
      }
    },
    [totalCount, onProgressChange]
  );

  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) {
      goToNext();
    } else if (diff < -50) {
      goToPrev();
    }
    setTouchStart(null);
  };

  const wheelLockRef = React.useRef(false);
  const handleWheel = (e: React.WheelEvent) => {
    if (wheelLockRef.current) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 30) {
      wheelLockRef.current = true;
      if (delta > 0) {
        goToNext();
      } else {
        goToPrev();
      }
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 400);
    }
  };

  useEffect(() => {
    if (activeItem && onItemView) {
      onItemView(activeItem, currentIndex);
    }
  }, [activeItem, currentIndex, onItemView]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "Home") {
        selectIndex(0);
      } else if (e.key === "End") {
        selectIndex(totalCount - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, selectIndex, totalCount]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      data-gallery-experience="true"
      data-reduced-motion={reducedMotion ? "true" : undefined}
      className="dtc-gallery"
      lang={locale}
      role="region"
      aria-label="Fio Vivo Interactive Gallery"
    >
      <GalleryAmbient colors={activeItem?.ambientColors} />

      {/* Top Brand Header Overlay */}
      <div className="absolute top-4 left-6 right-6 z-10 flex items-center justify-between pointer-events-none text-white/70 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center font-serif text-xs text-[#d48c46]">
            71
          </div>
          <div>
            <div className="font-bold tracking-widest text-white uppercase text-[11px]">FIO VIVO</div>
            <div className="text-[9px] text-white/40 italic font-serif">atelier multiverse</div>
          </div>
          <div className="ml-4 pl-4 border-l border-white/10 hidden md:block">
            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider text-[#d48c46]">EM FOCO</span>
            <span className="ml-2 font-bold text-white text-[11px]">Crochê em movimento</span>
            <span className="ml-2 text-white/40 text-[9px]">CROCHÊ MANUAL &bull; FIBRA &bull; GESTO</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest hidden lg:flex">
          <span className="text-white/40">&bull; EXPLORAÇÃO 1/16 &mdash;&mdash; CONTINUAR &rarr;</span>
          <span className="text-white font-bold">COLEÇÃO 01 &mdash;&mdash; 01 / 04</span>
        </div>
      </div>

      <aside className="dtc-gallery__editorial pt-12">
        <p className="dtc-gallery__collection-number">{collectionLabel}</p>
        <h1 className="dtc-gallery__collection-title text-4xl lg:text-5xl font-serif font-bold">
          O crochê<br />
          <span className="italic font-serif text-[#d48c46]">se move.</span>
        </h1>
        <p className="dtc-gallery__collection-narrative text-sm text-white/60 mt-2">
          Os dois primeiros gestos transformam o crochê em presença viva.
        </p>
        <span className="dtc-gallery__counter font-mono text-xs text-[#d48c46] mt-4" aria-live="polite">
          {formattedCounter}
        </span>
      </aside>

      <div
        className="dtc-gallery__viewport"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div className="dtc-gallery__track">
          {activeItem && (
            <InteractiveArtworkCard
              item={activeItem}
              index={currentIndex}
              role="active"
              locale={locale}
              onClick={() => {
                if (onProductIntent) {
                  onProductIntent(activeItem);
                } else if (activeItem.productUrl) {
                  window.location.href = activeItem.productUrl;
                }
              }}
              onSceneClick={(scene) => {
                if (onSceneView) onSceneView(activeItem, scene);
              }}
            />
          )}

          {adjacentItem && totalCount > 1 && (
            <InteractiveArtworkCard
              item={adjacentItem}
              index={(currentIndex + 1) % totalCount}
              role="adjacent"
              locale={locale}
              onClick={goToNext}
            />
          )}

          {continuationItem && totalCount > 2 && (
            <InteractiveArtworkCard
              item={continuationItem}
              index={(currentIndex + 2) % totalCount}
              role="continuation"
              locale={locale}
              onClick={() => selectIndex((currentIndex + 2) % totalCount)}
            />
          )}
        </div>
      </div>

      <NavigationControls
        current={currentIndex}
        total={totalCount}
        onSelect={selectIndex}
        onPrev={goToPrev}
        onNext={goToNext}
      />

      <div className="dtc-gallery__actions flex items-center gap-4">
        {onShare && activeItem && (
          <button
            type="button"
            className="dtc-gallery__share cursor-pointer bg-transparent border-0 font-mono uppercase tracking-[0.16em] text-xs text-white/60 hover:text-white transition-colors"
            onClick={() => onShare(activeItem)}
            aria-label="Share artwork"
          >
            Share
          </button>
        )}

        <button
          type="button"
          className="dtc-gallery__cta cursor-pointer"
          onClick={() => {
            if (onProductIntent && activeItem) {
              onProductIntent(activeItem);
            } else if (activeItem?.productUrl) {
              window.location.href = activeItem.productUrl;
            }
          }}
        >
          <span>&equiv;</span>
          <span>CONHECER A PEÇA</span>
          <span>&nearr;</span>
        </button>
      </div>
    </div>
  );
}
