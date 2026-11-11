load("//learning/gemini/agents/customization_rules:defs.bzl", "agent_skill")
load("//learning/gemini/agents/evaluation/evalin/build_defs:evalin.bzl", "eval_suite")
load("//learning/gemini/agents/skills/skill_creator/scripts:skill_defs.bzl", "validate_skill_test")

package(default_visibility = ["//visibility:public"])

exports_files([
        "SKILL.md",
        "references/contributing.md",
])

eval_suite(
    name = "game_text_score_audio_and_juice_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_game_text_score_audio_and_juice_skill_test",
    check_locked_links = True,
)

agent_skill(
    name = "game_text_score_audio_and_juice",
    srcs = [
        "SKILL.md",
        "references/contributing.md",
    ],
    scripts = [
        "//experimental/users/jfesta/skills/game_text_score_audio_and_juice/scripts:audit_game_audio_safety",
    ],
)
