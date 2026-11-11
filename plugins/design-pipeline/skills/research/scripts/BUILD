load("//devtools/python/blaze:pytype.bzl", "pytype_strict_binary")

package(default_visibility = [
    "//experimental/users/jfesta/skills/research:__subpackages__",
])

exports_files([
    "capture_fullpage_devtools.mjs",
])

pytype_strict_binary(
    name = "analyze_inspiration_workflow",
    srcs = ["analyze_inspiration_workflow.py"],
)
