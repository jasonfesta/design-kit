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
        "references/dating-blueprint-and-research-linking.md",
        "references/image-to-react-pipeline.md",
        "references/nano_banana_multi_screen_protocol.md",
        "references/nomenclature-and-polish-rules.md",
        "references/subagent_parallel_execution_runbook.md",
        "references/website-to-react-pipeline.md",
])

eval_suite(
    name = "golden_template_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_golden_template_skill_test",
    check_locked_links = True,
)

agent_config(
    name = "golden_template_agent",
    agent_md = "agent.md",
)

agent_skill(
    name = "golden_template",
    srcs = [
        "SKILL.md",
        "references/contributing.md",
        "references/dating-blueprint-and-research-linking.md",
        "references/image-to-react-pipeline.md",
        "references/nano_banana_multi_screen_protocol.md",
        "references/nomenclature-and-polish-rules.md",
        "references/subagent_parallel_execution_runbook.md",
        "references/website-to-react-pipeline.md",
    ],
)
