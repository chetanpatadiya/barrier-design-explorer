# Multilayer Barrier Design Explorer — Scientific Equation & Dataset Audit

**Audit date:** 2026-10-31  
**Research track:** EVOH moisture coupling; generalized multilayer barrier modeling  
**Status:** Foundational equations implemented and analytically verified; external numerical validation and erratum transcription remain **open**.  
**Important separation:** This document audits scientific evidence. `Barrier_Design_Explorer_v0.1.html` does **not** implement the Jakobsen–Risbo humidity-coupled EVOH model or claim validation against the Vercasson datasets.

## Executive decision

1. **Proceed with V0.1** as a publicly usable *development-stage screening demonstration*. Its only transport engine is steady-state, one-dimensional, constant-permeability resistance addition, plus a public saturation-vapor-pressure correlation. All displayed material permeability inputs are user-supplied or conspicuously **synthetic demonstration numbers**.
2. **Do not implement the Jakobsen–Risbo coupling model yet.** The free 2009 erratum unambiguously identifies the erroneous location, but the corrected formula is embedded as an image in the publisher page, not accessible as verified machine-readable text through this audit. Reproducing it from memory or reverse engineering the meaning would be unsafe.
3. **Do not treat the 2025/2026 coated-cardboard datasets as validation of EVOH humidity predictions.** They test/generalize series-resistance assumptions for structures in which interfacial impregnation and defects matter. They may become useful as an *external stress-test dataset* for a later coating-specific module, after direct access and record-level QA.
4. **Validation claim permitted today:** mathematical self-consistency of the current implementation. **Not permitted today:** proven accuracy for specific real-world films, packaging configurations, medical-device sterile barrier systems, or humidity-coupled EVOH behavior.

## 1. Mathematical foundation implemented in V0.1

For permeant `k` crossing ideal planar layers in series, under isothermal steady-state conditions with constant, condition-appropriate permeabilities:

\[
R_{k,\mathrm{total}}=\sum_{i=1}^{n}\frac{L_i}{P_{k,i}}, \qquad J_k=\frac{\Delta p_k}{R_{k,\mathrm{total}}}.
\]

The oxygen module uses `L` in µm, `P_O2` in cm³(STP)·µm/(m²·day·atm), and Δp_O2 in atm, producing OTR in cm³(STP)/(m²·day). The water-vapor module uses `P_H2O` in g·µm/(m²·day·kPa) and Δp_H2O in kPa, producing signed water-vapor flux in g/(m²·day), with magnitude displayed as WVTR. These **pressure-normalized** coefficients are NOT plain OTR or WVTR values from a measured film; conversion requires original film thickness, test gradient and all relevant conditions.

The water-vapor gradient uses Buck (1996), as documented by NCAR/UCAR, for saturation over liquid water from **0 to 50 °C**:

\[
p_{\mathrm{sat}}(T) = 0.61121\exp\!\left[(18.678-T/234.5)\,T/(257.14+T)\right]\;\mathrm{kPa};
\quad\Delta p_{\mathrm{H2O}}=p_{\mathrm{sat}}(T)(RH_{out}-RH_{in})/100.
\]

**Distinction:** Changing temperature changes `p_sat` and the corresponding water vapor driving force, but **does not change polymer P in V0.1**. In reality, polymer permeability and water sorption may change with temperature and RH. This tool does not yet correct them.

**Key references:**
- Huang, C.-H., Wu, J.-S. & Huang, C.-C. (2004), *Predicting the Permeability and Tensile Properties of Multilayer Films from the Properties of the Individual Component Layers*, Polymer Journal 36, 386–393. https://doi.org/10.1295/polymj.36.386. The abstract reports agreement for PA6/LDPE/adhesive coextruded films.
- Morris, B. A. (2013), *Application of modeling to speed flexible package development*, Journal of Plastic Film & Sheeting. https://doi.org/10.1177/8756087913477857. Reviews layer-resistance calculation in packaging development.
- UCAR/NCAR Water Vapor Pressure Formulations, Buck (1996): https://www.eol.ucar.edu/data-software/conventions-and-standards/water-vapor-pressure-formulations.

### Assumptions and exclusions

- One-dimensional diffusion through continuous, homogeneous, defect-free planar layers at steady state.
- Same isothermal test condition for every layer; inputs are appropriate to **that** condition.
- No modeled layer-specific RH profile, water sorption/swelling, pressure-dependent transport, interfacial resistance, adhesion failure, pinholes, stress cracking, seal failures, package-area change, or thickness thinning from thermoforming.
- Layer order **cannot** affect V0.1 predictions; reversing layers preserves the resistance sum. An asymmetric EVOH finding would require the additional moisture-dependent model.
- Values for aluminum foil, metallized films, AlOx, SiOx, ultra-high barrier coatings, and coated porous substrates must **not** be assigned fictitious near-zero permeabilities. Use separately measured empirical laminate parameters or a validated defect model in a future version.

## 2. Jakobsen & Risbo 2008/2009 correction audit

| Audit item | Finding | Status |
|---|---|---|
| Original work | Jakobsen & Risbo, *A simple model for the interaction between water vapour and oxygen transmission in multilayer barrier materials intended for food packaging applications*, Packaging Technology and Science **21(4)**:207–216 (2008); first online **26 October 2007**. DOI https://doi.org/10.1002/pts.799. | Verified bibliographic and abstract metadata |
| Scientific question | Estimate average EVOH water activity under steady-state conditions and its corresponding oxygen barrier as protective-layer properties and thicknesses change. | Verified from published abstract |
| Published correction | A free-access erratum, Packaging Technology and Science **22(2)**:123 (2009), https://doi.org/10.1002/pts.851; online **20 January 2009**. | Verified |
| Notation correction | Page **208**, right-hand column, line nine: `p_w` should **not** have had a superscript `o`. | Verified from correction text |
| Equation correction | The **first equation on page 208** is incorrect and must be replaced by the equation shown as an image on the publisher's erratum page. | **Correction exists; exact mathematical transcription not yet verified** |
| Independent equation audit | Exact original equation, corrected equation, definition of all variables, unit dimensions, sign convention, and relationship to reported results. | **Blocked pending verified access to formula images/full text** |
| Numerical reproduction | Independently reproduce at least two original reported multilayer examples and compare with source tables/graphs. | Not yet performed |
| Software integration | Implement the moisture–oxygen coupling only after correction and numerical checks. | **Explicitly excluded from V0.1** |

**Do not claim the 2009 equation has been audited or validated numerically.** The publisher page has confirmed the identity and location of both errors, but its corrected equation is an embedded GIF (the browser result exposes an `equation image` instead of the formula), and the original paper's full text has not been retrieved reliably. A symbolic reconstruction from a generic resistance network is not proof of what the authors corrected.

### Required gate to move to V0.2

1. Obtain authoritative legible copies of the **original page 208** and **2009 page 123** from publisher or licensed institutional access.
2. Two independent transcriptions of the corrected equation; resolve superscripts, numerator/denominator, boundary orientation and whether terms are permeability versus permeance.
3. Build a variable dictionary with dimensions and units, including water-vapor pressure vs water activity vs OTR.
4. Confirm physically meaningful limits: identical boundary humidities → no water gradient; equal outer-layer resistance → expected symmetry; equal materials/order inversion consistency; single-layer/small-barrier limiting cases.
5. Reproduce numerical examples/figures from the original manuscript with documented material parameters, then compare against any independent measured multilayer OTR available.
6. Only then implement a moisture profile, humidity-adjusted oxygen coefficients and a visible applicability/uncertainty declaration.

## 3. Subsequent research datasets: provenance and suitability

### Dataset A — Vercasson et al. 2025, public literature-data audit

**Publication:** Vercasson, A., Gaucel, S., Gontard, N., Angellier-Coussy, H. & Guillard, V. (2025), *Applicability of the series resistance model in predicting the permeability of coated papers to oxygen and water vapor: importance of data quality and associated metadata*. Polymer Testing 150, 108907. https://doi.org/10.1016/j.polymertesting.2025.108907.

**Public dataset DOI:** https://doi.org/10.57745/VJEJ1W (Recherche Data Gouv; published **1 July 2025**, version 1.0).

**Verified from publisher abstract and dataset catalogue:**

- More than **250** literature permeation observations drawn from **35** papers on polymer-coated cardboard.
- Roughly **58%** of collected data were judged not reusable, chiefly because necessary metadata were absent.
- The dataset describes two original spreadsheet files: **`Calculations_quality index`** and **`Data collection and applicability`**. The former contains a quality-index assessment; the latter includes collection metadata, oxygen/water-vapor unit conversions, and bilayer model predictions.
- A catalogue-derived preview exposes the first tabular file as **203 observations and 24 variables**. This is **not equivalent** to the paper's >250 total literature observations; the differing aggregation/filtering basis was not reconciled and should not be guessed.
- The article concludes that a bilayer resistance model did **not** consistently predict coated-cardboard permeability. An impregnated region within the cellulose structure was not adequately represented.

**Row-level audit status:** Metadata verified; workbook bytes and row-level contents **not acquired in this execution environment**. Accordingly, no formula-cell checks, independent unit conversions, error metrics, quality-index replication or model-to-measurement residual calculations were performed. The referenced public dataset is an **identified validation candidate**, not yet a verified validation result.

**Applicability:** A **boundary-case / model-failure dataset** for coated or porous multilayer structures. It is **not** direct validation for the water-activity/EVOH coupling of Jakobsen & Risbo. For pure homogeneous coextruded films it is not automatically representative either.

### Dataset B — Vercasson et al. 2026, measured PHBV-laminated structures

**Publication:** Vercasson, A., Angellier-Coussy, H., Gontard, N., Guillard, V. & Gaucel, S. (2026), *From structure to function: predicting mass transfer in cellulose-based multilayer packaging materials*. Materials & Design 261, 115328. https://doi.org/10.1016/j.matdes.2025.115328 (article issue January 2026).

**Public dataset DOI:** https://doi.org/10.57745/YLMKBF (published **12 December 2025**).

**Verified from abstract/catalogue:**

- The study investigated four different PHBV-laminated cardboard model materials with structural heterogeneity and an impregnated region.
- The dataset describes two Excel workbooks: `MODELS_Results` (model calculations) and `OVERVIEW_Raw results` (thickness, oxygen and water-vapor characterization), plus SEM cross-section images.
- Tabular repository preview describes each workbook as **14 observations** (one with 32 variables, another with 44 variables). Workbook internal sheet structures and individual records were not independently inspected.
- The paper states that **none of the evaluated models accurately predicted every sample**, supporting a need for extra structure-specific parameters and caution in extending uniform-layer series models.

**Row-level audit status:** Catalogue and abstract verified; individual files/measurements not obtained; no calculated residuals or independent confirmation of the stated error magnitudes.

**Applicability:** Useful for later 2-layer versus 3-layer *coated-substrate* validation, especially the effect of impregnation and defects. **Not** an EVOH-specific humidity-dependence calibration source.

### Why the datasets must stay separate

| Evidence type | What it can test | What it cannot establish alone |
|---|---|---|
| Huang et al. (2004) | Series model can agree with PA6/LDPE/adhesive experiments | All polymers/conditions/coating geometries |
| Jakobsen & Risbo (2008/2009) | A published EVOH coupling formulation exists; corrected source located | Correct numerical implementation before transcription/replication |
| Vercasson (2025) dataset | Data completeness and limits of bilayer model for coated cardboard | Accuracy of EVOH humidity coefficient |
| Vercasson (2026) dataset | Role of impregnated layer and heterogeneous structure | Transferability to uniform flexible coextrusions |
| V0.1 analytical tests | Implemented algebra, dimensional handling and expected mathematical limits | Prediction accuracy on real material test specimens |

## 4. V0.1 internal verification performed

Executed using `node test-core.js` (original test fixtures written for this calculator; inputs are synthetic):

1. Single-layer oxygen calculation: `P=100`, `L=10`, `Δp=0.21` ⇒ **OTR = 2.1** cm³(STP)/(m²·day).
2. Water-vapor calculation against the Buck 25 °C saturation-pressure reference (approximately 3.17 kPa).
3. Single-layer water-vapor flux equality to the derived driving pressure for `P=L=10` and 100%-to-0% RH.
4. Three identical layers produce one-third of the single-layer flux.
5. Layer oxygen resistance shares sum to 100%.
6–7. Layer permutation invariance for oxygen and water vapor.
8–9. Doubling thickness halves oxygen and water-vapor flux in a single layer.
10–11. Zero O₂ and zero water gradients generate zero flux.
12. Water flux reverses sign under reversed humidity gradient.
13–14. Missing oxygen inputs block OTR but not complete WVTR.
15. Zero-thickness input blocks the calculation.
16. Out-of-domain temperature is rejected by the saturation routine.

**Outcome:** All assertions passed when the code was executed. These are **analytical software checks**, not independent experimental validation. The test script contains 16 assertions and prints a one-line success message; it can be rerun with Node.js.

## 5. External validation acceptance criteria (proposed, not yet achieved)

| Test family | Minimum external evidence | Proposed result documentation |
|---|---|---|
| A. Homogeneous multilayers | Independent experimental PA6/LDPE or PE/PET structures with layer thicknesses and normalized P values | Predicted vs observed OTR/WVTR, % error and conditions |
| B. RH-sensitive EVOH | Verified corrected model and at least 2 EVOH grade/architecture combinations across 3 humidity states | OTR curves, measured/predicted ratios, error direction |
| C. Coated/porous substrates | Complete 2025/2026 public data tables after metadata QA | Grouped error by coating type, impregnation and defect evidence |
| D. Repeatability | Duplicate calculation from identical inputs, source DOI, units and version | Reproducible JSON report and test log |

**Proposed quantitative acceptance gates** must be set **before** viewing final validation results and should reflect measurement uncertainty and intended decisions; none are claimed as achieved here. A sensible initial evaluation is to report median absolute percentage error (with caution near zero), log-ratio residuals, coverage by material family, and worst-case error, not merely overall mean correlation.

## 6. Legal and reuse notes

The V0.1 implementation is original code of general mathematical principles; it contains no reproduced copyrighted article figures, proprietary material database, or ASTM standard text. Citation to a publication does not itself grant reproduction rights to embedded figures or third-party numerical tables. The repository catalogue reports the 2025/2026 dataset under a permissive French Etalab Open License 2.0, but reuse conditions and third-party provenance should be reviewed for individual tables before bundling or redistribution. Copyright conclusions do not establish patent freedom to operate.

## 7. Next concrete audit actions

- **Gate 1 — Corrected equation:** obtain and independently transcribe original 2008 page 208 and the replacement equation image on 2009 page 123, then document its dimensional consistency and variables.
- **Gate 2 — Raw dataset ingestion:** obtain the two spreadsheets for https://doi.org/10.57745/VJEJ1W and the raw/model sheets for https://doi.org/10.57745/YLMKBF. Record file hashes, data licenses, sheet names, row counts and actual units.
- **Gate 3 — Reproduction:** recalculate sample rows and unit conversions without using spreadsheet's original formula values as a shortcut; measure residual errors to reported experiments and distinguish coating-related model failures from software bugs.
- **Gate 4 — Scientific decision:** retain constant-P ideal-layer calculation for a clearly delimited material scope; introduce an EVOH-humidity model only after the corrected equation, calibration inputs and external experimental data pass review.

## Source register

1. **Huang et al. (2004)** https://doi.org/10.1295/polymj.36.386
2. **Morris (2013)** https://doi.org/10.1177/8756087913477857
3. **UCAR/NCAR (Buck vapor pressure)** https://www.eol.ucar.edu/data-software/conventions-and-standards/water-vapor-pressure-formulations
4. **Jakobsen & Risbo (2008)** https://doi.org/10.1002/pts.799
5. **Jakobsen & Risbo (2009) erratum** https://doi.org/10.1002/pts.851
6. **Vercasson et al. (2025)** https://doi.org/10.1016/j.polymertesting.2025.108907
7. **Vercasson (2025) data** https://doi.org/10.57745/VJEJ1W
8. **Vercasson et al. (2026)** https://doi.org/10.1016/j.matdes.2025.115328
9. **Vercasson (2025/2026) data** https://doi.org/10.57745/YLMKBF

**End of audit.**
