load("//learning/gemini/agents/customization_rules:defs.bzl", "agent_skill")
load("//learning/gemini/agents/evaluation/evalin/build_defs:evalin.bzl", "eval_suite")
load("//learning/gemini/agents/skills/skill_creator/scripts:skill_defs.bzl", "validate_skill_test")

package(default_visibility = ["//visibility:public"])

exports_files([
        "SKILL.md",
        "references/contributing.md",
        "references/human-taste-and-antipatterns.md",
        "references/image-to-working-3d-model.md",
])

eval_suite(
    name = "image_to_working_model_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_image_to_working_model_skill_test",
    check_locked_links = True,
)

agent_skill(
    name = "image_to_working_model",
    srcs = [
        "SKILL.md",
        "references/contributing.md",
        "references/human-taste-and-antipatterns.md",
        "references/image-to-working-3d-model.md",
    ],
    scripts = [
        "//experimental/users/jfesta/skills/image_to_working_model/scripts:make_blind_ab",
    ],
)
