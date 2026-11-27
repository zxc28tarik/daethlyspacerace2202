#!/usr/bin/env python3
"""Temporary MAP2 player shield durability x15; other maps, rivals and physics unchanged."""
from pathlib import Path
path=Path(__file__).resolve().parents[1]/'index.html'
src=path.read_text(encoding='utf-8')
def only(old,new,label):
    global src
    count=src.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one anchor, saw {count}")
    src=src.replace(old,new,1)
only("        function applyBoundaryFriction(ship, desiredSpeed, dt, isPlayer) {",
"""        // MAP2-TEST15: player-only 15x effective shield; URL opt-out map2TestShield=off.
        const MAP2_TEST_SHIELD_MULTIPLIER =
            new URLSearchParams(window.location.search).get('map2TestShield') === 'off' ? 1 : 15;
        function map2PlayerShieldDamage(amount) {
            return map2Active() ? amount / MAP2_TEST_SHIELD_MULTIPLIER : amount;
        }
        window.starbladeMap2TestShieldMultiplier = MAP2_TEST_SHIELD_MULTIPLIER;

        function applyBoundaryFriction(ship, desiredSpeed, dt, isPlayer) {""","shield helper")
only("""                const damage = f.damagePerSecond * dt;
                ship.shield = Math.max(0, ship.shield - damage);
                ship.boundaryDamageTotal = (ship.boundaryDamageTotal || 0) + damage;""",
"""                const damage = f.damagePerSecond * dt;
                const receivedDamage = isPlayer ? map2PlayerShieldDamage(damage) : damage;
                ship.shield = Math.max(0, ship.shield - receivedDamage);
                ship.boundaryDamageTotal = (ship.boundaryDamageTotal || 0) + receivedDamage;""","boundary damage")
only("            state.shield = Math.max(0, state.shield - amount);",
     "            state.shield = Math.max(0, state.shield - map2PlayerShieldDamage(amount));",
     "direct player damage")
bt=chr(96)
old="            document.getElementById('shield-text').textContent = "+bt+"${shieldPct}%"+bt+";"
new="""            document.getElementById('shield-text').textContent =
                map2Active() && MAP2_TEST_SHIELD_MULTIPLIER > 1
                    ? """+bt+"${shieldPct}% ×15 TEST"+bt+" : "+bt+"${shieldPct}%"+bt+";"
only(old,new,"HUD label")
path.write_text(src,encoding="utf-8")
print("Applied MAP2-TEST15:",path.stat().st_size,"bytes")
