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
        "references/deduplication-and-naming.md",
        "references/google-skill-spec.md",
        "references/x20-and-bundle-packaging.md",
])

eval_suite(
    name = "skill_maker_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_skill_maker_skill_test",
    check_locked_links = True,
)

agent_config(
    name = "skill_maker_agent",
    agent_md = "agent.md",
)

agent_skill(
    name = "skill_maker",
    srcs = [
        "SKILL.md",
        "references/contributing.md",
        "references/deduplication-and-naming.md",
        "references/google-skill-spec.md",
        "references/x20-and-bundle-packaging.md",
    ],
    scripts = [
        "//experimental/users/jfesta/skills/skill_maker/scripts:build_catalog",
        "//experimental/users/jfesta/skills/skill_maker/scripts:sync_x20",
        "//experimental/users/jfesta/skills/skill_maker/scripts:validate_and_wrap",
    ],
)
