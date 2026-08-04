export interface FioVivoProductFixture {
  id: string
  code: string
  handle: string
  title: string
  contextualName: string
  description: string
  artist: string
  material: string
  category: string
  year: string
  price: string
  availability: string
  primaryImage: {
    src: string
    alt: string
    width: number
    height: number
    aspectRatio: number
  }
  scenes: Array<{
    id: string
    src: string
    alt: string
    label: string
    width: number
    height: number
    aspectRatio: number
  }>
  ambientColors:
    | readonly [string, string, string]
    | "a informar"
}

export const fioVivoProducts: FioVivoProductFixture[] = [
  {
    id: "fv-001",
    code: "fv-001-espiral-dourada",
    handle: "espiral-dourada",
    title: "Espiral dourada",
    contextualName: "a informar",
    description: "a informar",
    artist: "a informar",
    material: "a informar",
    category: "a informar",
    year: "a informar",
    price: "a informar",
    availability: "a informar",
    primaryImage: {
      src: "/images/fio-vivo/fv-001-espiral-dourada/01-frente.png",
      alt: "Espiral dourada - frente",
      width: 1254,
      height: 1254,
      aspectRatio: 1
    },
    scenes: [
      {
        id: "fv-001-scene-2",
        src: "/images/fio-vivo/fv-001-espiral-dourada/02-perfil.png",
        alt: "Espiral dourada - perfil",
        label: "Perfil",
        width: 1254,
        height: 1254,
        aspectRatio: 1
      },
      {
        id: "fv-001-scene-3",
        src: "/images/fio-vivo/fv-001-espiral-dourada/03-gesto.png",
        alt: "Espiral dourada - gesto",
        label: "Gesto",
        width: 1254,
        height: 1254,
        aspectRatio: 1
      },
      {
        id: "fv-001-scene-4",
        src: "/images/fio-vivo/fv-001-espiral-dourada/04-detalhe.png",
        alt: "Espiral dourada - detalhe",
        label: "Detalhe",
        width: 1254,
        height: 1254,
        aspectRatio: 1
      }
    ],
    ambientColors: "a informar"
  },
  {
    id: "fv-002",
    code: "fv-002-orbita-negra",
    handle: "orbita-negra",
    title: "Órbita negra",
    contextualName: "a informar",
    description: "a informar",
    artist: "a informar",
    material: "a informar",
    category: "a informar",
    year: "a informar",
    price: "a informar",
    availability: "a informar",
    primaryImage: {
      src: "/images/fio-vivo/fv-002-orbita-negra/01-frente.png",
      alt: "Órbita negra - frente",
      width: 1254,
      height: 1254,
      aspectRatio: 1
    },
    scenes: [
      {
        id: "fv-002-scene-2",
        src: "/images/fio-vivo/fv-002-orbita-negra/02-perfil.png",
        alt: "Órbita negra - perfil",
        label: "Perfil",
        width: 1254,
        height: 1254,
        aspectRatio: 1
      },
      {
        id: "fv-002-scene-3",
        src: "/images/fio-vivo/fv-002-orbita-negra/03-gesto.png",
        alt: "Órbita negra - gesto",
        label: "Gesto",
        width: 1254,
        height: 1254,
        aspectRatio: 1
      },
      {
        id: "fv-002-scene-4",
        src: "/images/fio-vivo/fv-002-orbita-negra/04-detalhe.png",
        alt: "Órbita negra - detalhe",
        label: "Detalhe",
        width: 1254,
        height: 1254,
        aspectRatio: 1
      }
    ],
    ambientColors: "a informar"
  },
  {
    id: "fv-003",
    code: "fv-003-trama-solar",
    handle: "trama-solar",
    title: "Trama solar",
    contextualName: "a informar",
    description: "a informar",
    artist: "a informar",
    material: "a informar",
    category: "a informar",
    year: "a informar",
    price: "a informar",
    availability: "a informar",
    primaryImage: {
      src: "/images/fio-vivo/fv-003-trama-solar/01-frente.png",
      alt: "Trama solar - frente",
      width: 1254,
      height: 1254,
      aspectRatio: 1
    },
    scenes: [
      {
        id: "fv-003-scene-2",
        src: "/images/fio-vivo/fv-003-trama-solar/02-perfil.png",
        alt: "Trama solar - perfil",
        label: "Perfil",
        width: 1254,
        height: 1254,
        aspectRatio: 1
      },
      {
        id: "fv-003-scene-3",
        src: "/images/fio-vivo/fv-003-trama-solar/03-gesto.png",
        alt: "Trama solar - gesto",
        label: "Gesto",
        width: 1254,
        height: 1254,
        aspectRatio: 1
      },
      {
        id: "fv-003-scene-4",
        src: "/images/fio-vivo/fv-003-trama-solar/04-detalhe.png",
        alt: "Trama solar - detalhe",
        label: "Detalhe",
        width: 1254,
        height: 1254,
        aspectRatio: 1
      }
    ],
    ambientColors: "a informar"
  },
  {
    id: "fv-004",
    code: "fv-004-fio-ancestral",
    handle: "fio-ancestral",
    title: "Fio ancestral",
    contextualName: "a informar",
    description: "a informar",
    artist: "a informar",
    material: "a informar",
    category: "a informar",
    year: "a informar",
    price: "a informar",
    availability: "a informar",
    primaryImage: {
      src: "/images/fio-vivo/fv-004-fio-ancestral/01-frente.png",
      alt: "Fio ancestral - frente",
      width: 1254,
      height: 1254,
      aspectRatio: 1
    },
    scenes: [
      {
        id: "fv-004-scene-2",
        src: "/images/fio-vivo/fv-004-fio-ancestral/02-perfil.png",
        alt: "Fio ancestral - perfil",
        label: "Perfil",
        width: 1254,
        height: 1254,
        aspectRatio: 1
      },
      {
        id: "fv-004-scene-3",
        src: "/images/fio-vivo/fv-004-fio-ancestral/03-gesto.png",
        alt: "Fio ancestral - gesto",
        label: "Gesto",
        width: 1254,
        height: 1254,
        aspectRatio: 1
      },
      {
        id: "fv-004-scene-4",
        src: "/images/fio-vivo/fv-004-fio-ancestral/04-detalhe.png",
        alt: "Fio ancestral - detalhe",
        label: "Detalhe",
        width: 1254,
        height: 1254,
        aspectRatio: 1
      }
    ],
    ambientColors: "a informar"
  },
  {
    id: "fv-005",
    code: "fv-005-tranca-ambar",
    handle: "tranca-ambar",
    title: "Trança âmbar",
    contextualName: "a informar",
    description: "a informar",
    artist: "a informar",
    material: "a informar",
    category: "a informar",
    year: "a informar",
    price: "a informar",
    availability: "a informar",
    primaryImage: {
      src: "/images/fio-vivo/fv-005-tranca-ambar/01-frente.png",
      alt: "Trança âmbar - frente",
      width: 682,
      height: 1024,
      aspectRatio: 0.666015625
    },
    scenes: [
      {
        id: "fv-005-scene-2",
        src: "/images/fio-vivo/fv-005-tranca-ambar/02-perfil.png",
        alt: "Trança âmbar - perfil",
        label: "Perfil",
        width: 682,
        height: 1024,
        aspectRatio: 0.666015625
      },
      {
        id: "fv-005-scene-3",
        src: "/images/fio-vivo/fv-005-tranca-ambar/03-gesto.png",
        alt: "Trança âmbar - gesto",
        label: "Gesto",
        width: 682,
        height: 1024,
        aspectRatio: 0.666015625
      },
      {
        id: "fv-005-scene-4",
        src: "/images/fio-vivo/fv-005-tranca-ambar/04-detalhe.png",
        alt: "Trança âmbar - detalhe",
        label: "Detalhe",
        width: 682,
        height: 1024,
        aspectRatio: 0.666015625
      }
    ],
    ambientColors: "a informar"
  },
  {
    id: "fv-006",
    code: "fv-006-duna-terracota",
    handle: "duna-terracota",
    title: "Duna terracota",
    contextualName: "a informar",
    description: "a informar",
    artist: "a informar",
    material: "a informar",
    category: "a informar",
    year: "a informar",
    price: "a informar",
    availability: "a informar",
    primaryImage: {
      src: "/images/fio-vivo/fv-006-duna-terracota/01-frente.png",
      alt: "Duna terracota - frente",
      width: 682,
      height: 1024,
      aspectRatio: 0.666015625
    },
    scenes: [
      {
        id: "fv-006-scene-2",
        src: "/images/fio-vivo/fv-006-duna-terracota/02-perfil.png",
        alt: "Duna terracota - perfil",
        label: "Perfil",
        width: 682,
        height: 1024,
        aspectRatio: 0.666015625
      },
      {
        id: "fv-006-scene-3",
        src: "/images/fio-vivo/fv-006-duna-terracota/03-gesto.png",
        alt: "Duna terracota - gesto",
        label: "Gesto",
        width: 682,
        height: 1024,
        aspectRatio: 0.666015625
      },
      {
        id: "fv-006-scene-4",
        src: "/images/fio-vivo/fv-006-duna-terracota/04-detalhe.png",
        alt: "Duna terracota - detalhe",
        label: "Detalhe",
        width: 682,
        height: 1024,
        aspectRatio: 0.666015625
      }
    ],
    ambientColors: "a informar"
  }
]
