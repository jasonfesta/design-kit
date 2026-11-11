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
        "references/contributing.md",
        "references/deep-transfer-prompt-architecture.md",
        "references/flutter-and-artifact-remediation.md",
        "references/style-stances-and-variation-dial.md",
        "references/uniqueness-and-quality-metrics.md",
])

eval_suite(
    name = "url_variant_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_url_variant_skill_test",
    check_locked_links = True,
)

agent_config(
    name = "url_variant_agent",
    agent_md = "agent.md",
)

agent_skill(
    name = "url_variant",
    srcs = [
        "SKILL.md",
        "references/contributing.md",
        "references/deep-transfer-prompt-architecture.md",
        "references/flutter-and-artifact-remediation.md",
        "references/style-stances-and-variation-dial.md",
        "references/uniqueness-and-quality-metrics.md",
    ],
    scripts = [
        "//experimental/users/jfesta/skills/url_variant/scripts:eval_url_variant",
        "//experimental/users/jfesta/skills/url_variant/scripts:plan_and_run_variant",
    ],
)
