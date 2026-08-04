"use client";
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryExperience = GalleryExperience;
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
function GalleryExperience({ items, collectionTitle = "Featured Gallery Collection", collectionNumber = "01", collectionNarrative = "Explore our curated works of craftsmanship.", initialItemHandle, locale = "en", reducedMotion = false, onItemView, onSceneView, onProductIntent, onProgressChange, }) {
    const initialIndex = initialItemHandle
        ? Math.max(0, items.findIndex((item) => item.handle === initialItemHandle))
        : 0;
    const [currentIndex, setCurrentIndex] = (0, react_1.useState)(initialIndex);
    const [activeSceneId, setActiveSceneId] = (0, react_1.useState)(undefined);
    const sliderRef = (0, react_1.useRef)(null);
    const activeItem = items[currentIndex] || items[0];
    const handleNext = (0, react_1.useCallback)(() => {
        if (items.length === 0)
            return;
        setCurrentIndex((prev) => (prev + 1) % items.length);
    }, [items.length]);
    const handlePrev = (0, react_1.useCallback)(() => {
        if (items.length === 0)
            return;
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }, [items.length]);
    const handleSelect = (index) => {
        setCurrentIndex(index);
        setActiveSceneId(undefined);
    };
    // Keyboard navigation
    (0, react_1.useEffect)(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowRight") {
                handleNext();
            }
            else if (e.key === "ArrowLeft") {
                handlePrev();
            }
            else if (e.key === "Home") {
                setCurrentIndex(0);
            }
            else if (e.key === "End") {
                setCurrentIndex(items.length - 1);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleNext, handlePrev, items.length]);
    // Notify item view
    (0, react_1.useEffect)(() => {
        if (activeItem) {
            onItemView?.(activeItem, currentIndex);
            onProgressChange?.({
                currentIndex,
                totalItems: items.length,
                activeSceneId,
            });
        }
    }, [currentIndex, activeItem, activeSceneId, onItemView, onProgressChange, items.length]);
    if (!items || items.length === 0) {
        return (<div className="dtc-gallery-root flex items-center justify-center p-8">
        <p className="text-gray-400">No gallery items available.</p>
      </div>);
    }
    const ambientColors = activeItem?.ambientColors || ["#1a1a2e", "#16213e", "#0f3460"];
    const bgGradient = `radial-gradient(circle at 50% 30%, ${ambientColors[0]} 0%, ${ambientColors[1]} 50%, ${ambientColors[2]} 100%)`;
    return (<div className="dtc-gallery-root" data-gallery-experience="true" ref={sliderRef} role="region" aria-label={collectionTitle}>
      {/* Dynamic Ambient Background */}
      <div className="dtc-gallery-ambient-bg" style={{ background: bgGradient }}/>

      {/* Gallery Header Narrative */}
      <header className="relative z-10 px-8 pt-6 flex justify-between items-end">
        <div>
          <span className="text-xs uppercase tracking-widest text-sky-400 font-semibold">
            Collection {collectionNumber}
          </span>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white mt-1">
            {collectionTitle}
          </h2>
        </div>
        <p className="hidden md:block text-xs text-slate-400 max-w-xs text-right">
          {collectionNarrative}
        </p>
      </header>

      {/* Main Interactive Track */}
      <div className="dtc-gallery-track-wrapper">
        <div className="dtc-gallery-track">
          {items.map((item, idx) => {
            const isActive = idx === currentIndex;
            const displayedImage = isActive && activeSceneId
                ? item.scenes.find((s) => s.id === activeSceneId)?.image.url ||
                    item.primaryImage.url
                : item.primaryImage.url;
            return (<framer_motion_1.motion.div key={item.id} className="dtc-gallery-card" data-active={isActive ? "true" : "false"} onClick={() => handleSelect(idx)} layout={!reducedMotion} tabIndex={0} role="button" aria-label={`View ${item.title}`} aria-selected={isActive}>
                <div className="dtc-gallery-card-image-wrapper">
                  <img src={displayedImage} alt={item.primaryImage.alt || item.title} className="dtc-gallery-card-image" loading={idx <= 2 ? "eager" : "lazy"}/>
                </div>

                <div className="dtc-gallery-card-content">
                  <span className="text-xs text-slate-400 font-mono">
                    {item.category || "Original Work"} • {item.year}
                  </span>
                  <h3 className="dtc-gallery-card-title">{item.title}</h3>
                  <p className="dtc-gallery-card-artist">{item.artist}</p>

                  <div className="dtc-gallery-card-footer">
                    {item.price ? (<span className="dtc-gallery-price">
                        {item.price.formatted}
                      </span>) : (<span className="text-xs text-slate-400">Price on request</span>)}

                    <span className="dtc-gallery-badge" data-status={item.availability}>
                      {item.availability}
                    </span>
                  </div>
                </div>
              </framer_motion_1.motion.div>);
        })}
        </div>
      </div>

      {/* Scene Switcher & Scene Navigation */}
      {activeItem && activeItem.scenes.length > 0 && (<div className="relative z-10 flex justify-center gap-2 pb-2">
          {activeItem.scenes.map((scene) => (<button key={scene.id} onClick={() => {
                    setActiveSceneId(scene.id);
                    onSceneView?.(activeItem, scene);
                }} className={`px-3 py-1 text-xs rounded-full border transition-all ${activeSceneId === scene.id
                    ? "bg-sky-400 text-slate-900 border-sky-400 font-semibold"
                    : "bg-slate-800/60 text-slate-300 border-slate-700 hover:border-slate-500"}`}>
              {scene.label}
            </button>))}
        </div>)}

      {/* Control Footer */}
      <footer className="dtc-gallery-controls">
        <div className="flex items-center gap-3">
          <button onClick={handlePrev} className="dtc-gallery-nav-button" aria-label="Previous artwork">
            ←
          </button>
          <span className="text-xs font-mono text-slate-400">
            {String(currentIndex + 1).padStart(2, "0")} /{" "}
            {String(items.length).padStart(2, "0")}
          </span>
          <button onClick={handleNext} className="dtc-gallery-nav-button" aria-label="Next artwork">
            →
          </button>
        </div>

        {activeItem && (<a href={activeItem.productUrl} onClick={() => onProductIntent?.(activeItem)} className="dtc-gallery-cta-button">
            <span>Explore Piece</span>
            <span>→</span>
          </a>)}
      </footer>
    </div>);
}
