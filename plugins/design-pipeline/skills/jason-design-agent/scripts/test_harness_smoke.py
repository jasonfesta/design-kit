import os
import sys

def test_smoke():
    print("═══════════════════════════════════════════════════════════════════════════════")
    print("  JASON-DESIGN-AGENT & JASON-DEV-AGENT — ONBOARD SMOKE TEST HARNESS           ")
    print("═══════════════════════════════════════════════════════════════════════════════")

    skills_root = "/usr/local/google/home/jfesta/skills"
    
    # 1. Verify key files exist
    required_files = [
        f"{skills_root}/jason-design-agent/agent.md",
        f"{skills_root}/jason-design-agent/references/session-initialization-and-intake.md",
        f"{skills_root}/jason-design-agent/references/simplified-pipeline-spec.md",
        f"{skills_root}/jason-design-agent/references/unified-style-direction-and-gen.md",
        f"{skills_root}/design-flywheel/SKILL.md",
        f"{skills_root}/google-font-selection/scripts/recommend_google_fonts.py",
        f"{skills_root}/jason-design-agent/scripts/font_scale_and_pairing.py"
    ]
    
    for f in required_files:
        if not os.path.exists(f):
            print(f"[FAIL] Missing required file: {f}")
            sys.exit(1)
        else:
            print(f"[PASS] Found: {os.path.basename(f)}")

    # 2. Test font recommendations CLI
    print("\n[TEST] Running font recommendation CLI...")
    ret = os.system("python3 /usr/local/google/home/jfesta/skills/google-font-selection/scripts/recommend_google_fonts.py --brief='brutalist espresso bar'")
    if ret != 0:
        print("[FAIL] Font recommendation CLI failed.")
        sys.exit(1)
    else:
        print("[PASS] Font recommendation CLI executed successfully.")

    # 3. Test font scale & pairing CLI
    print("\n[TEST] Running font scale & pairing CLI...")
    ret = os.system("python3 /usr/local/google/home/jfesta/skills/jason-design-agent/scripts/font_scale_and_pairing.py pair --primary='Fraunces'")
    if ret != 0:
        print("[FAIL] Font pairing CLI failed.")
        sys.exit(1)
    else:
        print("[PASS] Font pairing CLI executed successfully.")

    print("\n───────────────────────────────────────────────────────────────────────────────")
    print("ALL ONBOARD SMOKE TESTS PASSED CLEANLY.")
    print("You are ready to activate jason-design-agent in chat or run a test study.")
    print("═══════════════════════════════════════════════════════════════════════════════")

if __name__ == "__main__":
    test_smoke()
