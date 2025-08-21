"""Run external commands with subprocess."""
import subprocess, sys
result = subprocess.run([sys.executable, "-c", "print(2+2)"], capture_output=True, text=True)
print(result.stdout.strip())
