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
        "references/concept-eval-gates.md",
        "references/contributing.md",
])

eval_suite(
    name = "eval_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_eval_skill_test",
    check_locked_links = True,
)

agent_config(
    name = "eval_agent",
    agent_md = "agent.md",
)

agent_skill(
    name = "eval",
    srcs = [
        "SKILL.md",
        "references/concept-eval-gates.md",
        "references/contributing.md",
    ],
)
