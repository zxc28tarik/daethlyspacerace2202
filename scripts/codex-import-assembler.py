#!/usr/bin/env python3
"""Reconstruct the two byte-exact Codex HTML files on GitHub Actions."""
import gzip
import hashlib
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[1]
EXPECTED_TREE = "dae7bb937bb9d6eec03ecd8f02ed8cb0432166c7"
FILES = {
    "index.html": ("index", 4, "6ca35e83d7ba2920f060def2e0263f8ddc3ce853"),
    "dist/Uzay_Yarisi_Guncel_Oynanabilir.html": (
        "offline", 8, "7d03fdbd76a10bbf819a2442eba0c126b812b4a9"
    ),
}

def cmd(*args):
    return subprocess.check_output(args, cwd=ROOT, text=True).strip()

for filename, (prefix, count, expected) in FILES.items():
    paths = [ROOT / ".codex-transfer" / f"{prefix}.part{i:03d}.gz"
             for i in range(count)]
    if any(not path.is_file() for path in paths):
        raise SystemExit(f"Missing transfer part for {filename}")
    compressed = b"".join(path.read_bytes() for path in paths)
    data = gzip.decompress(compressed)
    digest = hashlib.sha1(
        b"blob " + str(len(data)).encode() + b"\0" + data
    ).hexdigest()
    if digest != expected:
        raise SystemExit(f"Content mismatch: {filename}: {digest} != {expected}")
    output = ROOT / filename
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(data)
    print("Verified file:", filename, len(data), digest, flush=True)

cmd("git", "add", "-f", *FILES.keys())
cmd("git", "rm", "-r", "-f", "--ignore-unmatch",
    ".codex-transfer", "scripts/codex-import-assembler.py",
    ".github/workflows/codex-import-assembler.yml")
actual = cmd("git", "write-tree")
print("Expected tree:", EXPECTED_TREE, "Actual tree:", actual, flush=True)
if actual != EXPECTED_TREE:
    raise SystemExit("STOP: snapshot tree differs; branch/main will NOT be updated.")
cmd("git", "config", "user.name", "Starblade GitHub Actions")
cmd("git", "config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com")
cmd("git", "commit", "-m", "Import byte-exact Codex STARBLADE snapshot")
cmd("git", "push", "origin", "HEAD:refs/heads/codex-import-2026-11-26")
print("DONE: exact snapshot assembled on staging branch.", flush=True)
