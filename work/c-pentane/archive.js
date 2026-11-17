/* =====================================================================
   C-PENTANE ARCHIVE  -  THIS IS THE ONLY FILE YOU NEED TO EDIT
   =====================================================================
   Each unit is one fridge found and photographed. A unit page shows the
   photo with its details, and a table of up to five tracks.

   To add a unit: copy one { ... } block in "units", paste it at the end
   of the list, and change the values. The inventory sorts units by code
   (CP-001, CP-002 ...), so the order of the blocks does not matter.
     code   : the unit's reference, e.g. "CP-004"
     found  : date found, "YYYY-MM-DD"
     photo  : the photo, relative to this folder, e.g. "imgs/cp-004.jpg"
              (square crops work best; 1000 px is plenty). "" = dotted placeholder
     model  : from the unit's label. "" shows Unknown
     state  : "Offline" (or "Online" when the unit plays)
     tracks : up to five, in order. Each one:
              { title: "Track title", src: "audio/cp-004/01.mp3" }
              A track without a title shows Unknown. Without src it is listed
              but cannot be played. Empty slots up to five show Unknown.
              Track lengths are read from the files, no need to type them.
     example: true marks a placeholder unit (shown as EXAMPLE); CP-001 and
              CP-002 play short test tones. Delete those blocks when real units
              take their place.

   Rules: keep the quotation marks "like this" and the commas at line ends.
   ===================================================================== */
const ARCHIVE = {

  sideTab: "C-PENTANE",          // text in the black box on the right edge
  title: "C-Pentane",            // shown above the inventory
  slots: 5,                      // inventory size: empty slots fill the grid up to this number
  unknown: "Unknown",            // shown for any missing name, model or track
  offlineLabel: "Unit is offline",   // shown in the player when a unit has no audio

  units: [
    {
      code: "CP-001", found: "2026-11-12", photo: "", example: true,
      model: "", state: "Offline",
      tracks: [
        { title: "", src: "audio/cp-001/r-01.mp3" },
        { title: "", src: "audio/cp-001/r-02.mp3" },
        { title: "", src: "audio/cp-001/e-03.mp3" }
      ]
    },
    {
      code: "CP-002", found: "2026-11-15", photo: "", example: true,
      model: "", state: "Offline",
      tracks: [
        { title: "", src: "audio/cp-002/r-05.mp3" },
        { title: "", src: "audio/cp-002/r-06.mp3" },
        { title: "", src: "audio/cp-002/e-02.mp3" }
      ]
    },
    {
      code: "CP-003", found: "2021-02-15", photo: "imgs/cp-003.jpg",
      model: "", state: "Offline",
      tracks: []
    }
  ]
};
