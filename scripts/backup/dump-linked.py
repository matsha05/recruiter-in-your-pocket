"""Stream one PostgreSQL archive using the linked Supabase CLI's short-lived backup login."""
import os
from pathlib import Path
import re
import shlex
import subprocess
import sys


def main():
    config = Path(sys.argv[1])
    project = (config / "linked-project").read_text().strip()
    if not re.fullmatch(r"[a-z]{20}", project):
        raise ValueError("Invalid linked project")
    schema_flags = sys.argv[2:]
    schemas = [arg.removeprefix("--schema=") for arg in schema_flags]
    if not schemas or not all(re.fullmatch(r"[a-z_]+", name) for name in schemas):
        raise ValueError("Expected schema flags")
    env = os.environ.copy()
    for key in ("PGSERVICE", "PGSERVICEFILE", "PGPASSFILE"):
        env.pop(key, None)
    connection = subprocess.run(
        ["supabase", "db", "dump", "--project-ref", project, "--linked", "--dry-run", "--schema", ",".join(schemas)],
        cwd=config, env=env, capture_output=True, check=True, text=True, timeout=90,
    )
    for key, raw in re.findall(r"^(?:export\s+)?(PG[A-Z]+)=(.+)$", connection.stdout, re.M):
        if key in ("PGHOST", "PGPORT", "PGUSER", "PGPASSWORD", "PGDATABASE"):
            env[key] = shlex.split(raw)[0]
    if not all(env.get(key) for key in ("PGHOST", "PGUSER", "PGPASSWORD", "PGDATABASE")):
        raise ValueError("Incomplete database connection")
    if project not in env["PGHOST"].split(".") and project not in env["PGUSER"].split("."):
        raise ValueError("Supabase supplied a connection for another project")
    if not re.search(r'--role\s+"postgres"', connection.stdout):
        raise ValueError("Unexpected backup role")
    env.update(PGCONNECT_TIMEOUT="15", PGSSLMODE="verify-full", PGSSLROOTCERT=str(config / "supabase-prod-ca.pem"))
    os.execvpe("pg_dump", ["pg_dump", "--format=custom", "--role=postgres", *schema_flags, "--no-password"], env)


if __name__ == "__main__":
    main()
