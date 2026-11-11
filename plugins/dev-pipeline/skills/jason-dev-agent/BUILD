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
        "references/activation-instructions.md",
        "references/contributing.md",
        "references/definition-of-done-and-handback.md",
        "references/designer-talkbacks-and-loop-b.md",
        "references/dev-eval-receipts-and-loop-a.md",
        "references/five-turn-checkback-loop.md",
        "references/google-engineering-architecture.md",
        "references/session-initialization-and-intake.md",
])

eval_suite(
    name = "jason_dev_agent_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_jason_dev_agent_skill_test",
    check_locked_links = True,
)

agent_config(
    name = "jason_dev_agent_agent",
    agent_md = "agent.md",
)

agent_skill(
    name = "jason_dev_agent",
    srcs = [
        "SKILL.md",
        "references/activation-instructions.md",
        "references/contributing.md",
        "references/definition-of-done-and-handback.md",
        "references/designer-talkbacks-and-loop-b.md",
        "references/dev-eval-receipts-and-loop-a.md",
        "references/five-turn-checkback-loop.md",
        "references/google-engineering-architecture.md",
        "references/session-initialization-and-intake.md",
    ],
    scripts = [
        "//experimental/users/jfesta/skills/jason_dev_agent/scripts:run_checkback_loop",
        "//experimental/users/jfesta/skills/jason_dev_agent/scripts:run_dev_flywheel",
        "//experimental/users/jfesta/skills/jason_dev_agent/scripts:run_dev_loop",
    ],
)
