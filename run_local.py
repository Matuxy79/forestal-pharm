"""Start Chainlit locally without leaking conflicting host environment variables."""

import os
import subprocess
import sys


def main() -> int:
    env = os.environ.copy()
    # Chainlit/Click treats the generic DEBUG variable as its boolean --debug
    # option. VS Code commonly sets DEBUG=release, which makes startup fail.
    env.pop("DEBUG", None)

    command = [
        sys.executable,
        "-m",
        "chainlit",
        "run",
        "app.py",
        "--host",
        "127.0.0.1",
        "--port",
        os.environ.get("PORT", "8000"),
        *sys.argv[1:],
    ]
    return subprocess.call(command, env=env)


if __name__ == "__main__":
    raise SystemExit(main())
