# Barrier Design Explorer — v0.1 (IN DEVELOPMENT)

An offline-capable, single-file web calculator for **ideal planar, steady-state** O₂ and water vapor transmission through multilayer films using user-supplied normalized permeability coefficients.

## Open or publish

- **Try it locally:** open `index.html` or `Barrier_Design_Explorer_v0.1.html` in Chrome, Safari, Edge, or Firefox. No installation, server, build step, or external library is required.
- **GitHub Pages:** upload `index.html` to a repository root; enable GitHub Pages with the root branch directory. The tool runs entirely in the user's browser.
- **No back-end:** the browser does not send input data to a server.
- **Code:** `core.js` is the independently testable calculation engine; `app.js` contains display and interaction logic. `index.html` embeds both scripts to remain standalone.

## Model

`R_total = Σ(L_i / P_i)` and `J = Δp / R_total` for O₂ and H₂O independently. `Δp_H₂O` is calculated from inside/outside RH and Buck's saturation vapor pressure at one temperature.

### Inputs

- Thickness per layer: µm
- O₂ permeability: cm³(STP)·µm/(m²·day·atm)
- Water-vapor permeability: g·µm/(m²·day·kPa)
- Temperature: 0–50 °C (used for vapor-pressure gradient only)
- RH inside/outside: 0–100%; O₂ partial-pressure difference: 0–1 atm

### Outputs

- OTR: cm³(STP)/(m²·day)
- WVTR magnitude: g/(m²·day), with a separately displayed flux direction
- Layer resistance contributions, total thickness and what-if thickness sensitivity
- Calculation exports to JSON and layer inputs to CSV

**Important:** The default example values are **synthetic** and must not be used as real PE or EVOH permeability data. Use **Start with my data** to enter measured or documented grade-specific coefficients.

## Tests

With Node.js installed, run:

```sh
node test-core.js
```

Tests verify analytical identities, sign conventions, input gating and pressure-to-flux handling. They do **not** establish real-world predictive accuracy. See `Scientific_Model_and_Dataset_Audit_v0.1.md`.

## Scientific boundaries

- No material lookup library, temperature correction to intrinsic P, internal humidity profile, humidity/oxygen coupling, transient behavior, pore/defect model, dimensional change or sterile barrier integrity prediction.
- The 2009 Jakobsen–Risbo corrected EVOH equation is *not* implemented because its exact transcription has not been independently verified.
- Mathematical validity does not substitute for independent test verification of selected materials/structures.

## References

See the source links displayed at the bottom of the calculator and the audit report. Standalone code uses no third-party source libraries.
