"""Allow running as: python -m swiss_stats"""
import sys
from swiss_stats.run import main

force = "--force" in sys.argv
datasets = [a for a in sys.argv[1:] if not a.startswith("--")]
main(datasets=datasets or None, force=force)
