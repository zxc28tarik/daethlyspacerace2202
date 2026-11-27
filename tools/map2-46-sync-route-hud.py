from pathlib import Path
import re, sys

path=Path("dist/Uzay_Yarisi_Guncel_Oynanabilir.html")
src=path.read_text(encoding="utf-8")

cue_re=re.compile(r"        function map2PlayerApertureCue\(gate,progress,laneX,laneY,shipRadius=12\.5\) \{[\s\S]*?\n        \}\n        function updateRaceHudWarning\(\) \{")
cue_new="""        function map2PlayerApertureCue(gate,progress,laneX,laneY,shipRadius=12.5) {
            if(!gate||!gate.openings||!gate.openings.length)return null;
            let best=null;
            gate.openings.forEach((p,openingIndex)=>{
                const marginX=Math.max(0,p.hx-shipRadius-14);
                const marginY=Math.max(0,p.hy-shipRadius-14);
                const dx=p.x-laneX,dy=p.y-laneY;
                const excessX=Math.max(0,Math.abs(dx)-marginX);
                const excessY=Math.max(0,Math.abs(dy)-marginY);
                const score=Math.hypot(excessX,excessY)*2+Math.hypot(dx,dy)*.12;
                if(!best||score<best.score)best={openingIndex,dx,dy,excessX,excessY,score};
            });
            const entry=Math.max(0,Math.round(gate.distance-gate.depth/2-progress));
            const aligned=best.excessX===0&&best.excessY===0;
            const fork=gate===map2TransferFork?.gate?map2TransferFork:map2WorksForks.get(gate);
            const passage=fork?.passages?.[best.openingIndex];
            let side=gate.openings.length>1?
                (gate.openings[0].x===gate.openings[1].x
                    ? (best.openingIndex===0?'ALT YÜKLEME KATI':'ÜST YÜKLEME KATI')
                    : (best.openingIndex===0?'SOL AÇIKLIK':'SAĞ AÇIKLIK')):'SANAYİ GEÇİDİ';
            if(passage?.id==='LOW_PIPE')side='ALT BORU HATTI';
            else if(passage?.id==='OUTER_SERVICE')side='DIŞ SERVİS HATTI';
            const multi=gate.openings.length>1;
            const moves=[];
            if(best.excessX>0)moves.push(best.dx<0?'SOLA':'SAĞA');
            if(best.excessY>0)moves.push(best.dy<0?'ALÇAL':'YÜKSEL');
            return {openingIndex:best.openingIndex,aligned,entry,dx:best.dx,dy:best.dy,
                tone:entry<650&&!aligned?'urgent':'caution',
                title:multi?'ALTERNATİF ROTA · '+side:(aligned?'GEÇİT HİZASI TAMAM':side),
                detail:entry+'m · '+(aligned?(multi?'SEÇİLEN HATTI KORU':'HATTI KORU'):moves.join(' / '))};
        }
        function updateRaceHudWarning() {"""
src,n=cue_re.subn(cue_new,src,count=1)
if n!=1:
    sys.exit("map2PlayerApertureCue block not found exactly once")

bonus_re=re.compile(r"            const bonus = document\.getElementById\('bonus-status'\);[\s\S]*?            document\.getElementById\('rank-text'\)\.textContent = `POS \$\{state\.rank\} / \$\{state\.totalRacers\}`;")
bonus_new="""            const bonus = document.getElementById('bonus-status');
            const gateWarning=upcomingWreckGate(state.routeProgress,2400*raceFlightScale());
            const inDanger = dangerBands.some(([from, to]) => state.routeProgress >= from && state.routeProgress <= to);
            if(map2Active()){
                if(gateWarning && gateWarning.distance >= state.routeProgress - 185){
                    const remaining=Math.max(0,Math.round(gateWarning.distance-state.routeProgress));
                    const multi=Array.isArray(gateWarning.openings)&&gateWarning.openings.length>1;
                    bonus.textContent=multi
                        ? `ALTERNATİF ROTA / ${gateWarning.openings.length} GEÇİT / ${remaining}m`
                        : `SANAYİ GEÇİDİ / ${remaining}m`;
                    bonus.className=multi
                        ? 'ml-2 text-cyan-300 font-black'
                        : 'ml-2 text-orange-300 font-black';
                }else if((state.draftStrength||0)>0.14){
                    bonus.textContent='SLIPSTREAM // ENERGY +';
                    bonus.className='ml-2 text-cyan-300 font-black';
                }else{
                    bonus.textContent='KEEP IT LOW / AÇIK HAT';
                    bonus.className='ml-2 text-emerald-300';
                }
            }else if (gateWarning && gateWarning.distance >= state.routeProgress - 185) {
                const command = gateWarning.mode==='TOP_ONLY' ? 'YUKARIDAN' :
                    gateWarning.mode==='BOTTOM_ONLY' ? 'ASAGIDAN' : 'ORTADAN';
                bonus.textContent = `⚠ ENKAZ GECIDI / ${command} / ${Math.max(0,Math.round(gateWarning.distance-state.routeProgress))}m`;
                bonus.className = 'ml-2 text-orange-300 font-black';
            } else if (inDanger) {
                bonus.textContent = '⚠ DEBRIS ZONE';
                bonus.className = 'ml-2 text-amber-300 font-black';
            } else if ((state.draftStrength||0)>0.14) {
                bonus.textContent = 'SLIPSTREAM // ENERGY +';
                bonus.className = 'ml-2 text-cyan-300 font-black';
            } else {
                bonus.textContent = 'ITEM BOXES / OPEN COURSE';
                bonus.className = 'ml-2 text-emerald-300';
            }
            document.getElementById('rank-text').textContent = `POS ${state.rank} / ${state.totalRacers}`;"""
src,n=bonus_re.subn(lambda m: bonus_new,src,count=1)
if n!=1:
    sys.exit("bonus-status block not found exactly once")

if "ALTERNATİF ROTA · " not in src or "ALTERNATİF ROTA /" not in src:
    sys.exit("post-patch verification failed")
path.write_text(src,encoding="utf-8")
print("MAP2-46 standalone HTML synchronized")
