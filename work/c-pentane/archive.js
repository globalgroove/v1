/* =====================================================================
   C-PENTANE ARCHIVE  -  THIS IS THE ONLY FILE YOU NEED TO EDIT
   =====================================================================
   Each unit is one fridge found and photographed. Each of its components
   can hold one track; the drawing shows which components hold one.

   To add a unit: copy one { ... } block in "units", paste it at the top
   of the list (newest first), and change the values.
     code   : the unit's reference, e.g. "CP-003"
     found  : date found, "YYYY-MM-DD"
     photo  : the photo, relative to this folder, e.g. "imgs/cp-003.jpg"
              (square crops work best; 1000 px is plenty). "" = dotted placeholder
     brand, model, refrigerant, condition : read from the unit's label; "" hides the line
     tracks : one line per component that holds a track:
              "R-01": { title: "Track title", src: "audio/cp-003/r-01.mp3" },
              Component references:
                R-01 Compressor     R-02 Condenser      R-03 Filter-drier
                R-04 Capillary tube R-05 Evaporator     R-06 Suction line
                E-01 Power cord     E-02 Thermostat     E-03 Start relay
                E-04 Overload       E-05 Door switch    E-06 Lamp
              Track lengths are read from the files, no need to type them.
     example: true marks a placeholder unit (shown as EXAMPLE). Delete those
              two blocks when the first real units are in.

   Rules: keep the quotation marks "like this" and the commas at line ends.
   ===================================================================== */
const ARCHIVE = {

  sideTab: "C-PENTANE",          // text in the black box on the right edge
  title: "C-Pentane",            // shown above the inventory
  slots: 24,                     // inventory size: empty slots fill the grid up to this number

  units: [
    {
      code: "CP-002", found: "2026-11-15", photo: "", example: true,
      brand: "", model: "", refrigerant: "R600a", condition: "",
      tracks: {
        "R-05": { title: "Test signal, evaporator",  src: "audio/cp-002/r-05.mp3" },
        "R-06": { title: "Test signal, suction line", src: "audio/cp-002/r-06.mp3" },
        "E-02": { title: "Test signal, thermostat",   src: "audio/cp-002/e-02.mp3" }
      }
    },
    {
      code: "CP-001", found: "2026-11-12", photo: "", example: true,
      brand: "", model: "", refrigerant: "R134a", condition: "",
      tracks: {
        "R-01": { title: "Test signal, compressor",     src: "audio/cp-001/r-01.mp3" },
        "R-02": { title: "Test signal, condenser",      src: "audio/cp-001/r-02.mp3" },
        "R-04": { title: "Test signal, capillary tube", src: "audio/cp-001/r-04.mp3" },
        "E-03": { title: "Test signal, start relay",    src: "audio/cp-001/e-03.mp3" },
        "E-06": { title: "Test signal, lamp",           src: "audio/cp-001/e-06.mp3" }
      }
    }
  ]
};
