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
        "references/google-fonts-taxonomy.md",
])

eval_suite(
    name = "google_font_selection_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_google_font_selection_skill_test",
    check_locked_links = True,
)

agent_config(
    name = "google_font_selection_agent",
    agent_md = "agent.md",
)

agent_skill(
    name = "google_font_selection",
    srcs = [
        "SKILL.md",
        "references/contributing.md",
        "references/google-fonts-taxonomy.md",
    ],
    scripts = [
        "//experimental/users/jfesta/skills/google_font_selection/scripts:build_specimen",
        "//experimental/users/jfesta/skills/google_font_selection/scripts:gf_live",
        "//experimental/users/jfesta/skills/google_font_selection/scripts:jetski_hook_allow",
        "//experimental/users/jfesta/skills/google_font_selection/scripts:recommend_google_fonts",
        "//experimental/users/jfesta/skills/google_font_selection/scripts:test_google_font_skill",
        "//experimental/users/jfesta/skills/google_font_selection/scripts:translate_brief",
    ],
)
