"use client";

import React, { useState } from "react";
import { GalleryExperienceProps } from "../types/index";
import { GalleryAmbient } from "./gallery-ambient";
import { ArtworkCard } from "./artwork-card";

export function GalleryExperience({ items }: GalleryExperienceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Fixture estática injetada para o slice visual, ignorando props Medusa
  const fixture = [
    {
      id: "1",
      title: "O crochê se move",
      artist: "Fernando",
      material: "Linho e Cobre",
      year: "2026",
      ambientColors: ["#a38d7d", "#6f5b4d", "#3b2a20"],
      primaryImage: { url: "/images/fio-vivo/fv-001-espiral-dourada.jpg", alt: "Espiral Dourada" },
      scenes: [
        { id: "s1", label: "Front", image: { url: "/images/fio-vivo/fv-001-espiral-dourada.jpg" } },
        { id: "s2", label: "Detail", image: { url: "/images/fio-vivo/fv-002-orbita-negra.jpg" } }
      ]
    },
    {
      id: "2",
      title: "Órbita Negra",
      artist: "Fernando",
      material: "Algodão Orgânico",
      year: "2026",
      ambientColors: ["#4a4a4a", "#2c2c2c", "#111111"],
      primaryImage: { url: "/images/fio-vivo/fv-002-orbita-negra.jpg", alt: "Órbita Negra" },
      scenes: []
    },
    {
      id: "3",
      title: "Trama Solar",
      artist: "Fernando",
      material: "Seda e Âmbar",
      year: "2026",
      ambientColors: ["#c99c55", "#8f6333", "#452d13"],
      primaryImage: { url: "/images/fio-vivo/fv-003-trama-solar.jpg", alt: "Trama Solar" },
      scenes: []
    },
    {
      id: "4",
      title: "Fio Ancestral",
      artist: "Fernando",
      material: "Lã Virgem",
      year: "2026",
      ambientColors: ["#827870", "#524b45", "#292420"],
      primaryImage: { url: "/images/fio-vivo/fv-004-fio-ancestral.jpg", alt: "Fio Ancestral" },
      scenes: []
    }
  ];

  const activeArtwork = fixture[currentIndex] || fixture[0];

  return (
    <div className="gallery-shell relative h-full w-full overflow-hidden text-[#e6e2dd] bg-[#1a1918]" style={{ height: "calc(100svh - 64px)" }}>
      {/* Ambient, Grain e Vignette */}
      <GalleryAmbient colors={activeArtwork.ambientColors} />
      <div className="gallery-grain absolute inset-0 z-[1] opacity-[0.04] pointer-events-none mix-blend-overlay" />
      <div className="gallery-vignette absolute inset-0 z-[2] pointer-events-none" />

      {/* Header Preservado e Coluna Editorial */}
      <aside className="gallery-editorial absolute left-[7vw] top-[34%] z-10 hidden max-w-[280px] lg:block">
        <p className="mb-5 font-mono text-[0.58rem] tracking-[0.18em] text-[#d6b08a]">
          COLEÇÃO Nº 01
        </p>
        <p className="font-serif text-[2.55rem] leading-[0.96] tracking-[-0.045em] text-[#f4f1eb]">
          O crochê<br />
          <em className="text-[#d6b08a] italic">se move.</em>
        </p>
        <span className="my-6 block h-px w-9 bg-[#d6b08a]/40" aria-hidden="true" />
        <p className="text-[0.68rem] leading-[1.6] text-[#a6a098]">
          Os dois primeiros gestos transformam o crochê em presença viva.
        </p>
      </aside>

      {/* Slider Assimetrico */}
      <div className="gallery-viewport relative z-10 flex h-full w-full items-center pl-[35vw]">
        <div className="flex gap-[4vw] items-center transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]" style={{ transform: `translateX(calc(-${currentIndex} * (35vw + 4vw)))` }}>
          {fixture.map((artwork, idx) => (
            <ArtworkCard 
              key={artwork.id} 
              artwork={artwork} 
              isActive={idx === currentIndex} 
              onClick={() => setCurrentIndex(idx)} 
            />
          ))}
        </div>
      </div>

      {/* Navegação Inferior */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-4">
        {fixture.map((_, i) => (
          <button key={i} onClick={() => setCurrentIndex(i)} className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-[#d6b08a]' : 'bg-[#d6b08a]/30'}`} />
        ))}
      </div>
      
      {/* CTA Commerce */}
      <button className="absolute right-10 bottom-7 z-20 min-h-[44px] items-center gap-2 border border-white/10 bg-black/20 px-4 font-mono text-[0.58rem] uppercase tracking-[0.15em] text-white backdrop-blur-md hidden md:flex hover:border-[#d6b08a]/50 transition-colors">
        Conhecer a peça
      </button>
    </div>
  );
}
