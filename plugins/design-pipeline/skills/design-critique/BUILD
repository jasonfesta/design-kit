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
        "references/critique-lenses-and-inspiration.md",
        "references/hyper-critique-swarm-and-auto-correction.md",
        "references/paired-dev-to-designer-loop.md",
])

eval_suite(
    name = "design_critique_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_design_critique_skill_test",
    check_locked_links = True,
)

agent_config(
    name = "design_critique_agent",
    agent_md = "agent.md",
)

agent_skill(
    name = "design_critique",
    srcs = [
        "SKILL.md",
        "references/contributing.md",
        "references/critique-lenses-and-inspiration.md",
        "references/hyper-critique-swarm-and-auto-correction.md",
        "references/paired-dev-to-designer-loop.md",
    ],
    scripts = [
        "//experimental/users/jfesta/skills/design_critique/scripts:run_critique_swarm",
    ],
)
