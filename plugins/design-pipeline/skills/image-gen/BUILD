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
        "references/anchor-prompt-and-12-slot-matrix.md",
        "references/anchor-prompt-and-27-slot-matrix.md",
        "references/contributing.md",
])

eval_suite(
    name = "image_gen_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_image_gen_skill_test",
    check_locked_links = True,
)

agent_config(
    name = "image_gen_agent",
    agent_md = "agent.md",
)

agent_skill(
    name = "image_gen",
    srcs = [
        "SKILL.md",
        "references/anchor-prompt-and-12-slot-matrix.md",
        "references/anchor-prompt-and-27-slot-matrix.md",
        "references/contributing.md",
    ],
)
