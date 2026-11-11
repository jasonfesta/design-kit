load(
    "//learning/gemini/agents/customization_rules:defs.bzl",
    "agent_config",
    "agent_skill",
)
load("//learning/gemini/agents/evaluation/evalin/build_defs:evalin.bzl", "eval_suite")
load("//learning/gemini/agents/skills/skill_creator/scripts:skill_defs.bzl", "validate_skill_test")

package(default_visibility = ["//visibility:public"])

exports_files([
        "agent.md",
        "SKILL.md",
        "references/avela_pixel_purity_and_token_rules.md",
        "references/contributing.md",
])

eval_suite(
    name = "replicate_mock_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_replicate_mock_skill_test",
    check_locked_links = True,
)

agent_config(
    name = "replicate_mock_agent",
    agent_md = "agent.md",
)

agent_skill(
    name = "replicate_mock",
    srcs = [
        "SKILL.md",
        "references/avela_pixel_purity_and_token_rules.md",
        "references/contributing.md",
    ],
    scripts = [
        "//experimental/users/jfesta/skills/replicate_mock/scripts:crop_regions",
        "//experimental/users/jfesta/skills/replicate_mock/scripts:measure_px",
        "//experimental/users/jfesta/skills/replicate_mock/scripts:prepare-and-extract-image",
    ],
)
