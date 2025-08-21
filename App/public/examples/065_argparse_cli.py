"""Command line parsing with argparse (run as script)."""
import argparse
p = argparse.ArgumentParser()
p.add_argument("--name", default="Student")
args = p.parse_args([])  # replace [] with None to use real CLI
print(f"Hello, {args.name}!")
