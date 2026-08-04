import React from "react";
export function ArtworkCard({ artwork, isActive, onClick }) {
    return (<article onClick={onClick} className={`relative shrink-0 cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isActive ? 'w-[35vw]' : 'w-[20vw] opacity-40'} aspect-[3/4] overflow-hidden`}>
      <div className="absolute inset-0 bg-[#2a2a2a]">
        <img src={artwork.primaryImage.url} alt={artwork.primaryImage.alt} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-black/10 mix-blend-multiply pointer-events-none"/>
      </div>

      <div className="absolute left-6 top-6 z-10 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#d6b08a]"/>
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-white/80">
          {artwork.material}
        </span>
      </div>

      {isActive && (<div className="absolute inset-x-6 bottom-6 z-10">
          <div className="mb-3 flex items-center gap-3">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[#d6b08a]">
              {artwork.year}
            </p>
            <span className="h-px w-8 bg-[#d6b08a]/40"/>
          </div>
          <h2 className="font-serif text-[2.5rem] leading-[0.98] tracking-[-0.035em] text-[#f4f1eb]">
            {artwork.title}
          </h2>
          <p className="mt-3 text-[0.68rem] uppercase tracking-[0.16em] text-white/70">
            por {artwork.artist}
          </p>
        </div>)}

      {/* Static Scene Thumbnails (Mockup of Rail) */}
      {isActive && artwork.scenes?.length > 0 && (<div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          {artwork.scenes.map((scene, idx) => (<div key={scene.id} className={`w-10 h-14 overflow-hidden border ${idx === 0 ? 'border-[#d6b08a]' : 'border-transparent'}`}>
              <img src={scene.image.url} alt="" className="w-full h-full object-cover"/>
            </div>))}
        </div>)}
    </article>);
}
