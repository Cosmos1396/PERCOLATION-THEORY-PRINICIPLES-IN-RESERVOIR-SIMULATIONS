import { conservativeWaterStep, waterStorage } from '../src/transport.js';

const sw=Float64Array.from([0.8,0.2,0.2]);
const pv=Float64Array.from([0.25,0.25,0.25]);
const swi=0.2,maxSw=0.8;
const fluxes=[[0,1,1.0],[1,2,0.8]];
const producerOutflows=[[2,0.8]];
const ff=s=>Math.max(0,Math.min(1,(s-swi)/(maxSw-swi)));
const result=conservativeWaterStep({sw,pv,fluxes,producerOutflows,fractionalFlow:ff,swi,maxSw,inletIndices:[0],courant:0.2});
const mb=result.after-result.before-result.injectedWater+result.producedWater;
const tol=1e-12;
const checks=[
  ['finite positive timestep',result.dt>0&&Number.isFinite(result.dt)],
  ['water saturations remain bounded',[...result.sw].every(v=>v>=swi-tol&&v<=maxSw+tol)],
  ['material balance closes',Math.abs(mb)<tol],
  ['reported residual closes',Math.abs(result.residual)<tol],
  ['internal transfer is nonzero',result.internalWater>0]
];
let failed=0;
for(const [name,pass] of checks){console.log(`${pass?'PASS':'FAIL'}  ${name}`);if(!pass)failed++;}
console.log(`\ndt=${result.dt.toExponential(4)}; injected=${result.injectedWater.toExponential(4)}; produced=${result.producedWater.toExponential(4)}; residual=${result.residual.toExponential(4)}`);
if(failed) process.exit(1);
console.log('\nFinite-volume transport conservation checks passed.');
