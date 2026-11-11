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
        "references/benchmark-capture-and-evidence-rules.md",
        "references/contributing.md",
        "references/design-directory-sources.md",
        "references/url-intake-and-multi-agent-analysis.md",
])

eval_suite(
    name = "research_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_research_skill_test",
    check_locked_links = True,
)

agent_config(
    name = "research_agent",
    agent_md = "agent.md",
)

agent_skill(
    name = "research",
    srcs = [
        "SKILL.md",
        "references/benchmark-capture-and-evidence-rules.md",
        "references/contributing.md",
        "references/design-directory-sources.md",
        "references/url-intake-and-multi-agent-analysis.md",
    ],
    scripts = [
        "//experimental/users/jfesta/skills/research/scripts:analyze_inspiration_workflow",
    ],
)
