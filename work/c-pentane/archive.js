/* =====================================================================
   C-PENTANE ARCHIVE  -  THIS IS THE ONLY FILE YOU NEED TO EDIT
   =====================================================================
   Each unit is one fridge found and photographed. A unit page shows the
   photo with its details, and a table of up to five tracks.

   To add a unit: copy one { ... } block in "units", paste it at the end
   of the list, and change the values. Codes follow the date found: the
   oldest unit is CP-001, the next CP-002 ... The inventory shows the newest
   first. A unit with any audio shows as Online, without as Offline.
     code   : the unit's reference, e.g. "CP-005"
     found  : date found, "YYYY-MM-DD"
     photo  : the photo, relative to this folder, e.g. "imgs/cp-004.jpg"
              (square crops work best; 1000 px is plenty). "" = dotted placeholder
     model  : from the unit's label. "" shows Unknown
     tracks : up to five, in order. Each one:
              { title: "Track title", src: "audio/cp-004/01.mp3" }
              A track without a title is named by the unit code: CP-004-01,
              CP-004-02 ... Without src it is listed but cannot be played.
              Empty slots up to five are listed the same way.
              Track lengths are read from the files, no need to type them.
     (CP-003 and CP-004 hold short test tones for now; replace or delete them.)

   Rules: keep the quotation marks "like this" and the commas at line ends.
   ===================================================================== */
const ARCHIVE = {

  sideTab: "C-PENTANE",          // text in the black box on the right edge
  title: "C-Pentane",            // shown above the inventory
  slots: 5,                      // inventory size: empty slots fill the grid up to this number
  unknown: "Unknown",            // shown for a missing model
  offlineLabel: "Unit is offline",   // shown in the player when a unit has no audio

  units: [
    {
      code: "CP-001", found: "2021-02-15", photo: "imgs/cp-001.jpg",
      model: "",
      tracks: []
    },
    {
      code: "CP-002", found: "2023-12-11", photo: "imgs/cp-002.jpg",
      model: "Euro-Line",
      tracks: []
    },
    {
      code: "CP-003", found: "2026-11-12", photo: "",
      model: "",
      tracks: [
        { title: "", src: "audio/cp-003/r-01.mp3" },
        { title: "", src: "audio/cp-003/r-02.mp3" },
        { title: "", src: "audio/cp-003/e-03.mp3" }
      ]
    },
    {
      code: "CP-004", found: "2026-11-15", photo: "",
      model: "",
      tracks: [
        { title: "", src: "audio/cp-004/r-05.mp3" },
        { title: "", src: "audio/cp-004/r-06.mp3" },
        { title: "", src: "audio/cp-004/e-02.mp3" }
      ]
    }
  ]
};
