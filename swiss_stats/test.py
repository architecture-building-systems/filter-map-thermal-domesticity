import sys
from pathlib import Path

# Ensure swiss_stats is importable
module_parent = Path(".").resolve().parent  # 03_data/statistics/
if str(module_parent) not in sys.path:
    sys.path.insert(0, str(module_parent))

from swiss_stats.loaders import load_dataset

print("Testing dataset load from BDS")
try: 
    test_cols = ["GB01", "GB02"]
    ldf = load_dataset("bds", columns=test_cols)
    print(f"    BDS loaded with {len(ldf)} rows and {len(ldf.columns)} columns")
except Exception as e:
    print(f"    Error loading BDS: {e}")

print("Testing dataset load from STATPOP")
try:
    test_cols = ["BBTOT", "BBMTOT", "BBWTOT", "HPTOT"]
    ldf = load_dataset("statpop", columns=test_cols)
    print(f"    STATPOP loaded with {len(ldf)} rows and {len(ldf.columns)} columns")
except Exception as e:
    print(f"    Error loading STATPOP: {e}")

print("Testing dataset load from SLS")
try:
    test_cols = ["AS25_17", "LU25_10"]
    ldf = load_dataset("sls", columns=test_cols)
    print(f"    SLS loaded with {len(ldf)} rows and {len(ldf.columns)} columns")
except Exception as e:
    print(f"    Error loading SLS: {e}")

print("Testing dataset load from STATENT")
try:
    # Load a small subset for quick testing
    test_cols = ["B0802EMP","B0803VZA"]
    ldf = load_dataset("statent", columns=test_cols)
    print(f"    STATENT loaded with {len(ldf)} rows and {len(ldf.columns)} columns")
except Exception as e:
    print(f"    Error loading STATENT: {e}")