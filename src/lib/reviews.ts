import faceOlivia from "@/assets/face-olivia.jpg";
import faceMarcus from "@/assets/face-marcus.jpg";
import faceGrace from "@/assets/face-grace.jpg";
import faceMarta from "@/assets/face-marta.jpg";
import faceDaniel from "@/assets/face-daniel.jpg";

export type Review = { name: string; face: string; text: string };

export const LANDING_REVIEWS: Review[] = [
  {
    name: "Olivia",
    face: faceOlivia,
    text: "I read the Bible for years and quietly understood almost none of it. Plainly explains the verse and the word behind it — in seven minutes I actually get it.",
  },
  {
    name: "Marcus",
    face: faceMarcus,
    text: "The daily plan is short enough that I never skip. Three weeks in and it's the first habit I've kept since college.",
  },
  {
    name: "Grace",
    face: faceGrace,
    text: "The original-language notes are what sold me. It's like having a study Bible that only says the part I needed.",
  },
];

export const PAYWALL_REVIEWS: Review[] = [
  {
    name: "Marta, 34",
    face: faceMarta,
    text: "I'd started Genesis four times and quit at Leviticus. This is the first plan I've finished.",
  },
  {
    name: "Daniel, 47",
    face: faceDaniel,
    text: "I never asked questions at church because I felt stupid. Here I ask ten a week.",
  },
  {
    name: "Grace, 26",
    face: faceGrace,
    text: "Seven minutes before bed. Thirty days later I actually know what Paul is arguing.",
  },
];
