/*
 * Barrier Design Explorer v0.1 — independent resistance-in-series implementation.
 * Pressure-normalized units:
 * O2 P: cm^3(STP) * um / (m^2 * day * atm)
 * WV P: g * um / (m^2 * day * kPa)
 * thickness: um
 * Outputs: cm^3(STP)/(m^2*day), g/(m^2*day)
 * NO corrections for humidity-dependent polymer permeability or temperature-dependent P.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.BarrierCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const isPositive = (v) => typeof v === 'number' && Number.isFinite(v) && v > 0;
  const num = v => (v === '' || v === null || v === undefined ? NaN : Number(v));
  // Buck (1996) saturation pressure above liquid water, kPa, 0 to 50 deg C only.
  function saturationKpa(tC) {
    const t = num(tC);
    if (!Number.isFinite(t) || t < 0 || t > 50) return NaN;
    return 0.61121 * Math.exp((18.678 - t / 234.5) * t / (257.14 + t));
  }
  function evaluate(layers, conditions) {
    const t = num(conditions.temperatureC), outRH = num(conditions.outsideRH), inRH = num(conditions.insideRH);
    const oxygenDpAtm = num(conditions.oxygenDpAtm);
    const warnings = [];
    const validLayers = Array.isArray(layers) && layers.length > 0;
    const thicknessValid = validLayers && layers.every(l => isPositive(num(l.thicknessUm)));
    const totalThicknessUm = thicknessValid ? layers.reduce((s,l)=>s+num(l.thicknessUm),0) : null;
    const waterConditionsValid = Number.isFinite(t) && t>=0 && t<=50 && Number.isFinite(outRH) && outRH>=0 && outRH<=100 && Number.isFinite(inRH) && inRH>=0 && inRH<=100;
    const oxygenConditionsValid = Number.isFinite(oxygenDpAtm) && oxygenDpAtm>=0 && oxygenDpAtm<=1;
    if (!validLayers) warnings.push('Add at least one layer.');
    if (!thicknessValid) warnings.push('Every layer requires a thickness greater than zero.');
    if (!oxygenConditionsValid) warnings.push('Oxygen partial-pressure difference must be 0–1 atm.');
    if (!waterConditionsValid) warnings.push('Enter temperature 0–50 °C and RH values 0–100%.');
    function calculateSpecies(key, boundaryValid, dp, label) {
      if (!validLayers || !thicknessValid || !boundaryValid) return {value:null, missing:[], resistances:[], totalResistance:null};
      const missing = layers.map((l,i) => isPositive(num(l[key])) ? null : i+1).filter(v => v!==null);
      if (missing.length) {
        warnings.push(`${label}: enter positive, condition-appropriate permeability for layer${missing.length > 1 ? 's' : ''} ${missing.join(', ')}.`);
        return {value:null, missing, resistances:[], totalResistance:null};
      }
      const resistances = layers.map(l => num(l.thicknessUm)/num(l[key]));
      const totalResistance = resistances.reduce((s,r)=>s+r,0);
      const value = dp/totalResistance;
      return {value,missing:[],resistances,totalResistance,shares:resistances.map(r=>100*r/totalResistance)};
    }
    const oxygen = calculateSpecies('pOxygen', oxygenConditionsValid, oxygenDpAtm, 'OTR');
    const vaporPressureKpa = waterConditionsValid ? saturationKpa(t) : null;
    const outsidePartialKpa = waterConditionsValid ? vaporPressureKpa * outRH / 100 : null;
    const insidePartialKpa = waterConditionsValid ? vaporPressureKpa * inRH / 100 : null;
    const deltaWaterKpa = waterConditionsValid ? outsidePartialKpa - insidePartialKpa : null;
    const water = calculateSpecies('pWater', waterConditionsValid, deltaWaterKpa, 'WVTR');
    const noSource = validLayers && layers.some(l => !String(l.source||'').trim());
    if (noSource) warnings.push('One or more input permeability values have no provenance reference.');
    warnings.push('Constant-permeability, steady-state, planar and isothermal ideal-layer model only. No RH/temperature adjustment to polymer P.');
    return {oxygen,water,totalThicknessUm,vaporPressureKpa,outsidePartialKpa,insidePartialKpa,deltaWaterKpa,warnings};
  }
  return {evaluate,saturationKpa};
});
