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
        "references/google-engineering-architecture.md",
        "references/moodboard-and-pipeline-spec.md",
        "references/pipeline-contract-and-export.md",
        "references/self-improving-design-flywheel.md",
        "references/session-initialization-and-intake.md",
        "references/simplified-pipeline-spec.md",
        "references/unified-style-direction-and-gen.md",
        "references/web-safe-typography-and-nano-scale.md",
])

eval_suite(
    name = "jason_design_agent_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_jason_design_agent_skill_test",
    check_locked_links = True,
)

agent_config(
    name = "jason_design_agent_agent",
    agent_md = "agent.md",
)

agent_skill(
    name = "jason_design_agent",
    srcs = [
        "SKILL.md",
        "references/activation-instructions.md",
        "references/contributing.md",
        "references/google-engineering-architecture.md",
        "references/moodboard-and-pipeline-spec.md",
        "references/pipeline-contract-and-export.md",
        "references/self-improving-design-flywheel.md",
        "references/session-initialization-and-intake.md",
        "references/simplified-pipeline-spec.md",
        "references/unified-style-direction-and-gen.md",
        "references/web-safe-typography-and-nano-scale.md",
    ],
    scripts = [
        "//experimental/users/jfesta/skills/jason_design_agent/scripts:build_moodboard",
        "//experimental/users/jfesta/skills/jason_design_agent/scripts:font_scale_and_pairing",
        "//experimental/users/jfesta/skills/jason_design_agent/scripts:lock_and_verify_plates",
        "//experimental/users/jfesta/skills/jason_design_agent/scripts:test_harness_smoke",
    ],
)
