import sermon from "@/assets/artworks/sermon.jpg";
import galilee from "@/assets/artworks/galilee.jpg";
import well from "@/assets/artworks/well.jpg";
import wilderness from "@/assets/artworks/wilderness.jpg";
import transfiguration from "@/assets/artworks/transfiguration.jpg";
import garden from "@/assets/artworks/garden.jpg";
import prodigal from "@/assets/artworks/prodigal.jpg";
import lazarus from "@/assets/artworks/lazarus.jpg";
import entry from "@/assets/artworks/entry.jpg";
import kiss from "@/assets/artworks/kiss.jpg";
import ascension from "@/assets/artworks/ascension.jpg";
import deluge from "@/assets/artworks/deluge.jpg";

export type Artwork = {
  slug: string;
  src: string;
  title: string;
  artist: string;
  year: number;
  source: string;
};

/** Public-domain engravings. Cropped tight and veiled, they read as texture, not scene. */
export const ARTWORKS: Artwork[] = [
  { slug: "sermon", src: sermon, title: "The Sermon on the Mount", artist: "Gustave Doré", year: 1866, source: "https://commons.wikimedia.org/wiki/File:Dore_Bible_Sermon_on_the_Mount.jpg" },
  { slug: "galilee", src: galilee, title: "Jesus on the Sea of Galilee", artist: "Gustave Doré", year: 1866, source: "https://commons.wikimedia.org/wiki/File:DoreJesusSeaGalilee.jpg" },
  { slug: "well", src: well, title: "The Woman at the Well", artist: "Gustave Doré", year: 1866, source: "https://commons.wikimedia.org/wiki/File:Jesus_asks_the_Samaritan_woman_for_a_draft_from_the_well.jpg" },
  { slug: "wilderness", src: wilderness, title: "John the Baptist Preaching in the Wilderness", artist: "Gustave Doré", year: 1866, source: "https://commons.wikimedia.org/wiki/File:DoreJohntheBaptistPreachingintheWilderness.jpg" },
  { slug: "transfiguration", src: transfiguration, title: "The Transfiguration", artist: "Gustave Doré", year: 1866, source: "https://commons.wikimedia.org/wiki/File:Gustave_Dore_-_The_Transfiguration.jpg" },
  { slug: "garden", src: garden, title: "Jesus Praying in the Garden", artist: "Gustave Doré", year: 1866, source: "https://commons.wikimedia.org/wiki/File:DoreJesusPrayingintheGarden.jpg" },
  { slug: "prodigal", src: prodigal, title: "The Prodigal Son", artist: "Gustave Doré", year: 1866, source: "https://commons.wikimedia.org/wiki/File:Gustave_Dore_-_The_prodigal_son_decides_to_return_to_his_father.jpg" },
  { slug: "lazarus", src: lazarus, title: "Lazarus and the Rich Man", artist: "Gustave Doré", year: 1866, source: "https://commons.wikimedia.org/wiki/File:Gustave_Dore_Lazarus_and_the_Rich_Man.jpg" },
  { slug: "entry", src: entry, title: "Christ's Entry into Jerusalem", artist: "Gustave Doré", year: 1866, source: "https://commons.wikimedia.org/wiki/File:Gustave_Dor%C3%A9_-_Christ%27s_Entry_into_Jerusalem.jpg" },
  { slug: "kiss", src: kiss, title: "The Judas Kiss", artist: "Gustave Doré", year: 1866, source: "https://commons.wikimedia.org/wiki/File:Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_CXLI,_The_Judas_Kiss.jpg" },
  { slug: "ascension", src: ascension, title: "The Ascension", artist: "Gustave Doré", year: 1866, source: "https://commons.wikimedia.org/wiki/File:Gusta_Dore_-_The_Ascension.jpg" },
  { slug: "deluge", src: deluge, title: "The Deluge", artist: "Gustave Doré", year: 1866, source: "https://commons.wikimedia.org/wiki/File:Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I,_The_Deluge.jpg" },
];

export function artworkForDay(day: number): Artwork {
  return ARTWORKS[(day - 1) % ARTWORKS.length]!;
}
