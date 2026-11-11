load("//devtools/python/blaze:pytype.bzl", "pytype_strict_binary")

package(default_visibility = [
    "//experimental/users/jfesta/skills/arch_turing_test_loop:__subpackages__",
])

exports_files([
    "build_and_render_plate.mjs",
    "compare_arch_core.mjs",
])

pytype_strict_binary(
    name = "compare_arch_render",
    srcs = ["compare_arch_render.py"],
)
