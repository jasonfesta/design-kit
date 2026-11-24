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
        "references/3d-formations-and-jig-prompt.md",
        "references/README.md",
        "references/contributing.md",
        "references/immersive-and-auto-travel-spec.md",
        "references/layering-and-stage-isolation.md",
        "references/parallax-and-jig-prompt.md",
        "references/playback-prompt-open-spec.md",
        "references/stage-and-centering-prompt.md",
])

eval_suite(
    name = "style_jig_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_style_jig_skill_test",
    check_locked_links = True,
)

agent_config(
    name = "style_jig_agent",
    agent_md = "agent.md",
)

agent_skill(
    name = "style_jig",
    srcs = [
        "SKILL.md",
        "references/3d-formations-and-jig-prompt.md",
        "references/README.md",
        "references/contributing.md",
        "references/immersive-and-auto-travel-spec.md",
        "references/layering-and-stage-isolation.md",
        "references/parallax-and-jig-prompt.md",
        "references/playback-prompt-open-spec.md",
        "references/stage-and-centering-prompt.md",
    ],
    scripts = [
        "//experimental/users/jfesta/skills/style_jig/scripts:init_style_jig",
        "//experimental/users/jfesta/skills/style_jig/scripts:launch_jig_artifact",
        "//experimental/users/jfesta/skills/style_jig/scripts:match_and_map_styles",
        "//experimental/users/jfesta/skills/style_jig/scripts:record_and_eval_jig",
    ],
)
