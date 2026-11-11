load("//learning/gemini/agents/customization_rules:defs.bzl", "agent_skill")
load("//learning/gemini/agents/evaluation/evalin/build_defs:evalin.bzl", "eval_suite")
load("//learning/gemini/agents/skills/skill_creator/scripts:skill_defs.bzl", "validate_skill_test")

package(default_visibility = ["//visibility:public"])

exports_files([
        "SKILL.md",
        "references/contributing.md",
])

eval_suite(
    name = "arch_daylight_and_interior_glow_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_arch_daylight_and_interior_glow_skill_test",
    check_locked_links = True,
)

agent_skill(
    name = "arch_daylight_and_interior_glow",
    srcs = [
        "SKILL.md",
        "references/contributing.md",
    ],
)
