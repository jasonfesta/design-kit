load("//learning/gemini/agents/customization_rules:defs.bzl", "agent_skill")
load("//learning/gemini/agents/evaluation/evalin/build_defs:evalin.bzl", "eval_suite")
load("//learning/gemini/agents/skills/skill_creator/scripts:skill_defs.bzl", "validate_skill_test")

package(default_visibility = ["//visibility:public"])

exports_files([
        "SKILL.md",
        "references/01_spatial_solver_and_hybrid_shader_pipeline.md",
        "references/contributing.md",
])

eval_suite(
    name = "declarative_photoreal_threejs_worlds_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_declarative_photoreal_threejs_worlds_skill_test",
    check_locked_links = True,
)

agent_skill(
    name = "declarative_photoreal_threejs_worlds",
    srcs = [
        "SKILL.md",
        "references/01_spatial_solver_and_hybrid_shader_pipeline.md",
        "references/contributing.md",
    ],
)
