"""Install RIYP's nightly backup and hourly freshness check for the current Mac user."""
import os
from pathlib import Path
import plistlib
import shutil
import subprocess

os.umask(0o077)
destination = Path.home() / "Library/Application Support/RIYP Backup"
agents = Path.home() / "Library/LaunchAgents"
for name in ("repository", "recovery-password", "pg_service.conf", "pgpass", "aws-credentials"):
    file = destination / name
    if not file.is_file() or file.stat().st_mode & 0o077:
        raise SystemExit(f"Configure {name} with owner-only permissions before installing.")
agents.mkdir(parents=True, exist_ok=True)
runner = destination / "database.sh"
shutil.copy2(Path(__file__).with_name("database.sh"), runner)
domain = f"gui/{os.getuid()}"
for action, schedule in (("backup", {"Hour": 2, "Minute": 15}), ("check", {"Minute": 45})):
    label = f"com.riyp.database-{action}"
    plist = agents / (label + ".plist")
    job = {
        "Label": label, "ProgramArguments": [str(runner), action],
        "StartCalendarInterval": schedule, "StandardOutPath": str(destination / (action + ".log")),
        "StandardErrorPath": str(destination / (action + ".log")),
    }
    plist.write_bytes(plistlib.dumps(job))
    existing = subprocess.run(["launchctl", "print", domain + "/" + label], capture_output=True)
    if existing.returncode == 0:
        subprocess.run(["launchctl", "bootout", domain + "/" + label], check=True)
    subprocess.run(["launchctl", "bootstrap", domain, str(plist)], check=True)
