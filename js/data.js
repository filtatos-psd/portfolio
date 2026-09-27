/* ===== SITE INFO =====
   Change your name, title, about text, email, and Instagram here.
   These values are used across the whole site.
*/
const SITE = {
  fullName: "Thanashs Papakwstas",
  handle: "filtatos",
  title: "Digital Artist & Graphic Designer",
  location: "Greece",
  email: "thanashspapakwstas@gmail.com",
  instagramUrl: "https://www.instagram.com/filtatos/",
  instagramHandle: "@filtatos",
  tagline: "Visual systems for posters, covers, and digital art.",
  status: "Open for commissions",
  about: "I'm Thanashs Papakwstas, a 21-year-old digital artist and graphic designer based in Greece. I'm currently studying Informatics & Telecommunications at the University of Ioannina, specializing in Intelligent Systems & Applications and Computer Systems. Alongside my studies, I've built hands-on experience in Adobe Photoshop and Illustrator, with working knowledge of Corel Draw and DaVinci Resolve — focusing on color correction, poster and cover art, digital art, photo retouching, and video editing with special effects. I enjoy combining technical thinking with creative execution, and I'm always open to new commissions and collaborations.",
  skills: [
    "Photoshop",
    "Illustrator",
    "Corel Draw",
    "DaVinci Resolve",
    "Color Correction",
    "Poster Design",
    "Digital Art",
    "Photo Retouching",
    "Video Editing",
    "VFX"
  ]
};

/* ===== PROJECTS =====
   Each project is one object in this list.
   How to add a new project:
   1. Put your image file(s) in the assets folder.
   2. Copy one of the objects below.
   3. Change id, title, year, tags, cover, and images.

   cover  = the thumbnail shown in the grid (always the FIRST/main image)
   images = gallery photos shown when you click a project
            (list more than one image if the project has several — the
            lightbox already lets you click through them with </>)

   Tip: if a project has multiple images (like detailed_effect below),
   it still only shows as ONE card in the Work grid. Clicking it opens
   the full gallery.
*/
const PROJECTS = [
  {
    id: "blasphemy",
    title: "blasphemy",
    year: "2026",
    tags: ["poster", "photoshop"],
    cover: "assets/blasphemy.png",
    images: ["assets/blasphemy.png"]
  },
  {
    id: "chrome_teeth",
    title: "chrome_teeth",
    year: "2026",
    tags: ["design", "poster", "photoshop"],
    cover: "assets/chrome_teeth.png",
    images: ["assets/chrome_teeth.png"]
  },
  {
    id: "incarnate_devotion",
    title: "incarnate_devotion",
    year: "2026",
    tags: ["design", "poster", "illustrator", "photoshop"],
    cover: "assets/incarnate_devotion.jpg",
    images: ["assets/incarnate_devotion.jpg"]
  },
  {
    id: "rising_sins",
    title: "rising_sins",
    year: "2025",
    tags: ["poster", "photoshop"],
    cover: "assets/rising_sins.png",
    images: ["assets/rising_sins.png"]
  },
  {
    id: "stale_rage",
    title: "stale_rage",
    year: "2024",
    tags: ["poster", "photoshop"],
    cover: "assets/stale_rage.png",
    images: ["assets/stale_rage.png"]
  },
  {
    id: "scrim",
    title: "scrim",
    year: "2025",
    tags: ["profile", "photoshop"],
    cover: "assets/scrim.png",
    images: ["assets/scrim.png"]
  },
  {
    id: "detailed_effect",
    title: "detailed_effect",
    year: "2024",
    tags: ["effect", "profile", "photoshop"],
    cover: "assets/detailed_effect.jpg",
    images: [
      "assets/detailed_effect.jpg",
      "assets/detailed_effect2.jpg",
      "assets/detailed_effect3.jpg",
      "assets/detailed_effect4.jpg",
      "assets/detailed_effect5.jpg",
      "assets/detailed_effect6.jpg"
    ]
  }
];
