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
        "references/avela_dual_authority_and_60fps_media_stack.md",
        "references/button_padding_and_grid_equality.md",
        "references/contributing.md",
        "references/dating_golden_template_architecture.md",
        "references/four_k_upgrade_and_competitor_benchmarks.md",
        "references/google3_image_to_react_lineage.md",
        "references/iteration-loop-and-definition-of-done.md",
        "references/nano_banana_multi_screen_protocol.md",
        "references/paired_dev_and_design_eval_pipeline.md",
        "references/skill_lineage_and_tooling_bridge.md",
        "references/subagent_parallel_execution_runbook.md",
        "references/visual_rubric_and_eval_loop.md",
])

eval_suite(
    name = "image_to_react_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_image_to_react_skill_test",
    check_locked_links = True,
)

agent_config(
    name = "image_to_react_agent",
    agent_md = "agent.md",
)

agent_skill(
    name = "image_to_react",
    srcs = [
        "SKILL.md",
        "references/avela_dual_authority_and_60fps_media_stack.md",
        "references/button_padding_and_grid_equality.md",
        "references/contributing.md",
        "references/dating_golden_template_architecture.md",
        "references/four_k_upgrade_and_competitor_benchmarks.md",
        "references/google3_image_to_react_lineage.md",
        "references/iteration-loop-and-definition-of-done.md",
        "references/nano_banana_multi_screen_protocol.md",
        "references/paired_dev_and_design_eval_pipeline.md",
        "references/skill_lineage_and_tooling_bridge.md",
        "references/subagent_parallel_execution_runbook.md",
        "references/visual_rubric_and_eval_loop.md",
    ],
    scripts = [
        "//experimental/users/jfesta/skills/image_to_react/scripts:ingest-nano-banana",
    ],
)
