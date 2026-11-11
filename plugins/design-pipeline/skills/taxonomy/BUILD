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
        "references/disambiguation-and-extension.md",
        "references/prompt-template-match-catalog.md",
        "references/taxonomy-catalog.md",
        "assets/prompts_index.json",
        "assets/taxonomy.json",
        "assets/templates_and_gaps.json",
])

eval_suite(
    name = "taxonomy_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_taxonomy_skill_test",
    check_locked_links = True,
)

agent_config(
    name = "taxonomy_agent",
    agent_md = "agent.md",
)

agent_skill(
    name = "taxonomy",
    srcs = [
        "SKILL.md",
        "references/contributing.md",
        "references/disambiguation-and-extension.md",
        "references/prompt-template-match-catalog.md",
        "references/taxonomy-catalog.md",
        "assets/prompts_index.json",
        "assets/taxonomy.json",
        "assets/templates_and_gaps.json",
    ],
    scripts = [
        "//experimental/users/jfesta/skills/taxonomy/scripts:classify_taxonomy",
    ],
)
