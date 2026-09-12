export function conservativeWaterStep({sw,pv,fluxes,producerOutflows,fractionalFlow,swi,maxSw,inletIndices,courant=0.35}) {
  const n=sw.length;
  const before=waterStorage(sw,pv);
  const outgoing=new Float64Array(n);
  for (const [i,,q] of fluxes) if(q>0) outgoing[i]+=q;
  for (const [i,q] of producerOutflows) if(q>0) outgoing[i]+=q;

  let dt=Infinity;
  for(let i=0;i<n;i++) if(outgoing[i]>0) dt=Math.min(dt,courant*pv[i]/outgoing[i]);
  if(!Number.isFinite(dt)) dt=0;

  const next=Float64Array.from(sw);
  let internalWater=0;
  for(const [i,j,q] of fluxes){
    if(q<=0) continue;
    const requested=q*dt*fractionalFlow(sw[i]);
    const available=Math.max(0,(next[i]-swi)*pv[i]);
    const capacity=Math.max(0,(maxSw-next[j])*pv[j]);
    const moved=Math.min(requested,available,capacity);
    if(moved<=0) continue;
    next[i]-=moved/pv[i];
    next[j]+=moved/pv[j];
    internalWater+=moved;
  }

  let producedWater=0;
  for(const [i,q] of producerOutflows){
    if(q<=0) continue;
    const requested=q*dt*fractionalFlow(sw[i]);
    const available=Math.max(0,(next[i]-swi)*pv[i]);
    const removed=Math.min(requested,available);
    next[i]-=removed/pv[i];
    producedWater+=removed;
  }

  let injectedWater=0;
  for(const i of inletIndices){
    const add=Math.max(0,(maxSw-next[i])*pv[i]);
    next[i]+=add/pv[i];
    injectedWater+=add;
  }

  for(let i=0;i<n;i++) next[i]=Math.max(swi,Math.min(maxSw,next[i]));
  const after=waterStorage(next,pv);
  const residual=after-before-injectedWater+producedWater;
  return {sw:next,dt,injectedWater,producedWater,internalWater,residual,before,after};
}

export function waterStorage(sw,pv){
  let total=0;
  for(let i=0;i<sw.length;i++) total+=sw[i]*pv[i];
  return total;
}
