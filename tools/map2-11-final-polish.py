from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

old="const ahead=105-v.approach*28+strike*50;"
new="const ahead=155-v.approach*35+strike*55;"
if old not in s: raise SystemExit("patrol ahead target missing")
s=s.replace(old,new,1)

old2="""            const step=ui.initial?
                Math.max(0,Math.min(2,Math.floor((now-ui.startedAt)/3))):0;
            if(force||step!==ui.displayedStep||phase!==ui.displayedPhase){
"""
new2="""            let step=ui.initial?
                Math.max(0,Math.min(2,Math.floor((now-ui.startedAt)/3))):0;
            // MAP2-11: first-flight copy follows the actual course context.
            // FAST never tells the player to fly low; TECH does.
            if(ui.initial&&ui.map===MAP_MODES.MAP2){
                const seg=map2Segment(state.routeProgress).kind;
                step=seg==='TECH'?0:seg==='FAST'?2:1;
            }
            if(force||step!==ui.displayedStep||phase!==ui.displayedPhase){
"""
if old2 not in s: raise SystemExit("first-flight step target missing")
s=s.replace(old2,new2,1)

p.write_text(s,encoding="utf-8")
print("MAP2-11 final patrol distance + contextual guidance applied")
