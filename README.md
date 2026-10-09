[README.md](https://github.com/user-attachments/files/33249815/README.md)
# Portfolio — Thanashs Papakwstas (filtatos)

Personal portfolio website showcasing digital art, poster design, and visual effects work.

**Live site:** https://filtatos-psd.github.io/portfolio/

## About

I'm Thanashs Papakwstas, a digital artist and graphic designer based in Greece, currently studying Informatics & Telecommunications at the University of Ioannina. This site is a collection of my personal design work.

**Tools:** Adobe Photoshop · Adobe Illustrator · Corel Draw · DaVinci Resolve

**Focus areas:** Color correction · Poster & cover design · Digital art · Photo retouching · Video editing & VFX

## Structure

```
portfolio/
├── index.html        # main page (Home, Work, About, Contact)
├── css/
│   └── style.css      # all styling
├── js/
│   ├── data.js         # site info & project list — edit this to add/update projects
│   └── script.js       # site logic (routing, rendering, lightbox)
└── assets/            # project images
```

## Adding a new project

Open `js/data.js` and add a new object to the `PROJECTS` array:

```js
{
  id: "project_name",
  title: "project_name",
  year: "2026",
  tags: ["poster", "photoshop"],
  cover: "assets/project_name.png",
  images: ["assets/project_name.png"]
}
```

Drop the image file into `assets/`, save, and push — no other changes needed.

## Contact

- Email: thanashspapakwstas@gmail.com
- Instagram: [@filtatos](https://www.instagram.com/filtatos/)

Live pages:

- Home
- Work
- About
- Contact

```
{
  id: "my_piece",
  title: "My piece title",
  year: "2026",
  tags: ["Photoshop", "Poster"],
  cover: "assets/my_piece.png",
  images: ["assets/my_piece.png"]
}
```

- `cover` is the grid thumbnail.
- `images` can list extra files if a project has more than one picture.

## Change colors and fonts

Open `css/style.css` and edit the values at the top, inside `:root`.

Example:

```
--color-pink: #ff00e5;
--color-yellow: #faff00;
--font-heading: "Inter", sans-serif;
```

## File map

```
index.html
filtatos.svg
css/style.css
js/data.js
js/script.js
assets/          project images
```
