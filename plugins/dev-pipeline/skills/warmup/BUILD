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
        "references/design-eval-rubric.md",
        "references/model-routing.md",
        "references/prompt-protocol.md",
        "references/sub-skills-and-credits.md",
])

eval_suite(
    name = "warmup_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_warmup_skill_test",
    check_locked_links = True,
)

agent_config(
    name = "warmup_agent",
    agent_md = "agent.md",
)

agent_skill(
    name = "warmup",
    srcs = [
        "SKILL.md",
        "references/contributing.md",
        "references/design-eval-rubric.md",
        "references/model-routing.md",
        "references/prompt-protocol.md",
        "references/sub-skills-and-credits.md",
    ],
    scripts = [
        "//experimental/users/jfesta/skills/warmup/scripts:check_models",
        "//experimental/users/jfesta/skills/warmup/scripts:compare_builds",
        "//experimental/users/jfesta/skills/warmup/scripts:eval_warmup",
        "//experimental/users/jfesta/skills/warmup/scripts:prepare_and_extract",
        "//experimental/users/jfesta/skills/warmup/scripts:run_warmup",
    ],
)
