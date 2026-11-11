load("//learning/gemini/agents/customization_rules:defs.bzl", "agent_skill")
load("//learning/gemini/agents/evaluation/evalin/build_defs:evalin.bzl", "eval_suite")
load("//learning/gemini/agents/skills/skill_creator/scripts:skill_defs.bzl", "validate_skill_test")

package(default_visibility = ["//visibility:public"])

exports_files([
        "SKILL.md",
        "references/contributing.md",
        "references/memory-and-original-synthesis.md",
        "references/procedural-chair-tectonics.md",
        "references/white-cyclorama-and-camera-lock.md",
])

eval_suite(
    name = "chair_studio_threejs_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_chair_studio_threejs_skill_test",
    check_locked_links = True,
)

agent_skill(
    name = "chair_studio_threejs",
    srcs = [
        "SKILL.md",
        "references/contributing.md",
        "references/memory-and-original-synthesis.md",
        "references/procedural-chair-tectonics.md",
        "references/white-cyclorama-and-camera-lock.md",
    ],
    scripts = [
        "//experimental/users/jfesta/skills/chair_studio_threejs/scripts:harvest_rss_chair",
        "//experimental/users/jfesta/skills/chair_studio_threejs/scripts:probe_white_studio_chair",
    ],
)
