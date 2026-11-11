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
        "references/wcag-type-contrast-and-targets.md",
])

eval_suite(
    name = "accessibility_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_accessibility_skill_test",
    check_locked_links = True,
)

agent_config(
    name = "accessibility_agent",
    agent_md = "agent.md",
)

agent_skill(
    name = "accessibility",
    srcs = [
        "SKILL.md",
        "references/contributing.md",
        "references/wcag-type-contrast-and-targets.md",
    ],
    scripts = [
        "//experimental/users/jfesta/skills/accessibility/scripts:eval-accessibility",
    ],
)
