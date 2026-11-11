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
        "references/responsive_dual_authority_rules.md",
])

eval_suite(
    name = "responsiveness_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_responsiveness_skill_test",
    check_locked_links = True,
)

agent_config(
    name = "responsiveness_agent",
    agent_md = "agent.md",
)

agent_skill(
    name = "responsiveness",
    srcs = [
        "SKILL.md",
        "references/contributing.md",
        "references/responsive_dual_authority_rules.md",
    ],
    scripts = [
        "//experimental/users/jfesta/skills/responsiveness/scripts:crop-and-clean-plate",
    ],
)
