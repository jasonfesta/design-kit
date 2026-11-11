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
        "references/roles-scale-and-pairing-rules.md",
])

eval_suite(
    name = "font_pairing_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_font_pairing_skill_test",
    check_locked_links = True,
)

agent_config(
    name = "font_pairing_agent",
    agent_md = "agent.md",
)

agent_skill(
    name = "font_pairing",
    srcs = [
        "SKILL.md",
        "references/contributing.md",
        "references/roles-scale-and-pairing-rules.md",
    ],
    scripts = [
        "//experimental/users/jfesta/skills/font_pairing/scripts:eval-font-pairing",
    ],
)
