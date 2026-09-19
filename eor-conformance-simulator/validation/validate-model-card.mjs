import fs from 'node:fs';
import assert from 'node:assert/strict';

const card=JSON.parse(fs.readFileSync(new URL('../model-card.json', import.meta.url),'utf8'));
assert.equal(card.model_class,'reduced-order research simulator');
assert.equal(card.prediction_status,'not field calibrated');
assert.match(card.active_transport,/finite-volume/i);
assert.equal(card.reproducibility.default_seed,137);
assert.equal(card.reproducibility.same_geology_required_for_scenario_comparison,true);
assert.match(card.reproducibility.scenario_comparison_basis,/injected pore volume/i);
assert.ok(card.not_validated_for.includes('field production forecasting'));
assert.ok(card.missing_field_physics.includes('PVT and formation-volume factors'));
assert.match(card.decision_rule,/Do not claim conformance benefit before breakthrough/i);
console.log('model-card validation passed');
