/* =====================================================================
   SITE FILE  -  shared by every page (menu, logo, project list, search)
   =====================================================================
   This is the only file to edit when you add a project:
   copy one { ... } line in "projects", paste it below, change the values.
   The table on the Work page and the search on the landing page update by themselves.

   Rules:
     - Keep the quotation marks "like this" and the commas at line ends.
     - Links are written relative to the site root and end in the file name,
       e.g. "work/gmr/index.html" (so they also work when you open the files
       straight from your computer).
   ===================================================================== */
const SITE = {

  title: "GLOBAL OVERGROOVE",            // small title next to the logo, top left on every page

  logo: { src: "", alt: "Home", mark: "globe" },

  discogs: "https://www.discogs.com/artist/7284073-Francisco-Ant%C3%A3o",
                                         // Discogs credits page. The Discography page links to it,
                                         // unless a release has its own "discogs" address below
                                         // empty src = the drawn mark: "globe", "registration" or "lens"
                                         // or a small square SVG/PNG with transparent background, e.g. "id/logo.svg"

  /* ---- MENU:  [ "text", "link" ]  ----------------------------------- */
  /* a third part makes a sub-list that folds open under that line:      */
  /*   "projects"          = the project list below                      */
  /*   [ ["text","link"] ] = a list written here                         */
  /* with link "" the line only opens the sub-list; with a link (e.g.    */
  /* "work/index.html") the text opens that page and the small arrow opens the list */
  menu: [
    ["Work",        "work/index.html"],
    ["Discography", "discography/index.html"],
    ["Catalog",     "catalog/index.html"],
    ["Contact",     "contact/index.html"]
  ],

  /* ---- PROJECTS: one block per project page -------------------------- */
  /* Feeds the table on the Work page and the search on the landing page.  */
  /* The table lists them in this order (first here = top row).            */
  /*   title, year, type, role : shown in the table                        */
  /*   link    : the project page, relative to the site root               */
  /*   image   : preview image on the Work page, relative to the site root */
  /*   text    : one or two short lines for the preview                    */
  /*   keywords: extra words for the search only (not shown)               */
  /* A project without a page yet: leave link "" (listed, not clickable).  */
  projects: [
    {
      title: "Gore Metal Redux", year: "2023", type: "Installation", role: "",
      link: "work/gmr/index.html",
      image: "work/gmr/imgs/teeth.JPG",
      text: "Feedback Network",
      keywords: "gmr sculpture feedback oxidation"
    },
    {
      title: "Permafrost", year: "2023", type: "Live AV / Installation", role: "",
      link: "",                          // later: "work/permafrost/index.html"
      image: "work/permafrost/imgs/permafrost1.png",
      text: "",
      keywords: "live audiovisual av"
    },
    {
      title: "C-Pentane", year: "2022", type: "Archive, ongoing", role: "",
      link: "",                          // later: "work/c-pentane/index.html"
      image: "work/permafrost/imgs/permafrost2.JPG",
      text: "",
      keywords: "archive cpentane"
    },
    {
      title: "SWARM OR The Transparency of Evil", year: "2019", type: "Installation", role: "",
      link: "",                          // later: "work/swarm/index.html"
      image: "work/swarm/imgs/k7.png",
      text: "",
      keywords: "swarm"
    }
  ],

  /* ---- RELEASES: one line per record, for the Discography page --------- */
  /* Listed in this order (first here = top row).                          */
  /*   artist, title, role, year : shown in the list                       */
  /*   all of them, plus format and label : the sheet under the cover      */
  /*   cover : square image, relative to the site root, e.g.               */
  /*           "discography/covers/spin.jpg". "" = dotted placeholder      */
  /*   discogs : the release's own Discogs page, e.g.                      */
  /*             "https://www.discogs.com/release/123456-Artist-Title".    */
  /*             "" = the link goes to the Discogs credits page above      */
  releases: [
    { artist: "SPITBENDER",          title: "SPIN",                     role: "AUTHOR, PRODUCER",             format: "VINYL, 12\" LP",  label: "PERF",              year: "2026",    cover: "", discogs: "" },
    { artist: "TRASGO",              title: "TRASGO",                   role: "PRODUCER, RECORDING, MIXING",  format: "CD, LP",          label: "NOT ON LABEL",      year: "2026",    cover: "", discogs: "" },
    { artist: "ANTÓNIO FEITEIRA",    title: "PERFORMING THE HEIMLICH..", role: "CO-PRODUCER, MIXING",         format: "K7, EP",          label: "EASTERN NURSERIES", year: "2025",    cover: "discography/covers/AF.jpg", discogs: "" },
    { artist: "AMULETO APOTROPAICO", title: "AMULETO APOTROPAICO",      role: "CO-PRODUCER, MIXING",          format: "VINYL, 12\" LP",  label: "PERF",              year: "2025",    cover: "discography/covers/Amuleto.jpg", discogs: "" },
    { artist: "RAMRIFE",             title: "DESTERRADO",               role: "MASTERING",                    format: "CD-R, LP",        label: "KHTHON",            year: "2025",    cover: "discography/covers/ramrife_cover.jpg", discogs: "" },
    { artist: "HHY & THE MACUMBAS",  title: "BOM SANGUE MAU",           role: "FT.",                          format: "VINYL, LP",       label: "HORROR VECTOR",     year: "2024",    cover: "discography/covers/Macumbas.jpg", discogs: "" },
    { artist: "VOLSK",               title: "SCORPIO RISING",           role: "AUTHOR, PRODUCER",             format: "CD, EP",          label: "CAPITAL DECAY",     year: "2019",    cover: "discography/covers/ScorpioRising.jpg", discogs: "" },
    { artist: "VSO/VOLSK",           title: "SPIRAL SYSTEM",            role: "CO-AUTHOR, PRODUCER",          format: "DIGITAL, SINGLE", label: "MERA",              year: "2020",    cover: "discography/covers/Spyral.jpg", discogs: "" },
    { artist: "VSO/VOLSK",           title: "SACRED BONFIRE",           role: "CO-AUTHOR, PRODUCER",          format: "DIGITAL, V/A",    label: "ARENA SPA X FTP",   year: "2020",    cover: "discography/covers/STT.jpg", discogs: "" },
    { artist: "VSO/VOLSK",           title: "ACID REIGN",               role: "CO-AUTHOR, PRODUCER",          format: "DIGITAL, EP",     label: "MERA",              year: "2020",    cover: "discography/covers/AcidReign.jpg", discogs: "" },
    { artist: "JULIUS GABRIEL",      title: "AETHERHALLEN",             role: "MIXING",                       format: "DIGITAL, EP",     label: "LOVERS & LOLLIPOPS", year: "2019",   cover: "discography/covers/Julius.jpg", discogs: "" },
    { artist: "UNKNOWN",             title: "",                         role: "DRIVER",                       format: "ARCHIVE",         label: "",                  year: "ONGOING", cover: "", discogs: "" }
  ],

  /* ---- CONTACT: one line per way to reach you, for the Contact page ----- */
  /* Listed in this order (first here = top row).                          */
  /*   channel : what it is (Email, Discogs, Bandcamp, Instagram ...)       */
  /*   value   : what is shown (the address, a name, a handle)              */
  /*   link    : for email the address itself (mailto: is added);           */
  /*             for the rest a web address. "" = shown, not linked         */
  /*   note    : optional short line under the details                      */
  contact: [
    { channel: "Email",   value: "globalovergroove@proton.me", link: "globalovergroove@proton.me", note: "" }
  ],

  /* ---- CATALOG: one block per release, for the Catalog page ----------- */
  /* Listed in this order (first here = top row).                          */
  /*   artist, title, cat, year : shown in the list                        */
  /*   type, format, status     : shown under the cover                    */
  /*   tracks : [ "A. title 05:58", ... ] shown under the cover; [] = none */
  /*   cover  : square image, relative to the site root, e.g.              */
  /*            "catalog/covers/earthbound.jpg". "" = dotted placeholder   */
  /*   link   : optional shop or listening page; the status becomes a      */
  /*            button that opens it in a new tab                          */
  catalog: [
    { artist: "spitbender", type: "Single", title: "earthbound", cat: "GOG-SG-01", year: "2026", format: "Digital", status: "",
      tracks: ["A. earthbound (Original Mix) 05:58", "B. earthbound (Extended Mix) 06:49"], cover: "", link: "" },
    { artist: "spitbender", type: "Live", title: "2k250504: Ácida ATM", cat: "GOG-LV-01", year: "2025", format: "Digital", status: "",
      tracks: [], cover: "", link: "" },
    { artist: "Global Overgroove", type: "Mixtape", title: "Concentric Cirkles", cat: "GOG-MX-02", year: "2025", format: "CS", status: "Pre-Order",
      tracks: [], cover: "", link: "" },
    { artist: "Global Overgroove", type: "Mixtape", title: "A Máquina de Emaranhar Paisagens", cat: "GOG-MX-01", year: "2023", format: "CS", status: "Pre-Order",
      tracks: [], cover: "", link: "" },
    { artist: "spitbender", type: "EP", title: "Touch & Release", cat: "GOG-EP-02", year: "2022", format: "CD / Digital", status: "Coming Soon",
      tracks: [], cover: "", link: "" },
    { artist: "spitbender", type: "EP", title: "Core Syn", cat: "GOG-EP-01", year: "2022", format: "CS / Digital", status: "Coming Soon",
      tracks: [], cover: "", link: "" },
    { artist: "Golden Korae", type: "Archive", title: "Ov Maps Perceived But Not Drawn", cat: "GOG-CS-01", year: "2021", format: "CS / Digital", status: "On Request",
      tracks: [], cover: "", link: "" },
    { artist: "unknown", type: "File-Report", title: "Technical Allucinations: Excursions", cat: "UNK-00-00", year: "Ongoing", format: "Assembly-Program", status: "unavailable",
      tracks: [], cover: "", link: "" }
  ]
};
