load("//learning/gemini/agents/customization_rules:defs.bzl", "agent_skill")
load("//learning/gemini/agents/evaluation/evalin/build_defs:evalin.bzl", "eval_suite")
load("//learning/gemini/agents/skills/skill_creator/scripts:skill_defs.bzl", "validate_skill_test")

package(default_visibility = ["//visibility:public"])

exports_files([
        "SKILL.md",
        "references/contributing.md",
])

eval_suite(
    name = "game_concept_and_toy_first_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_game_concept_and_toy_first_skill_test",
    check_locked_links = True,
)

agent_skill(
    name = "game_concept_and_toy_first",
    srcs = [
        "SKILL.md",
        "references/contributing.md",
    ],
)
