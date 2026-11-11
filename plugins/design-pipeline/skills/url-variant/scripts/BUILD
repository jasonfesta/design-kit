load("//devtools/python/blaze:pytype.bzl", "pytype_strict_binary")

package(default_visibility = [
    "//experimental/users/jfesta/skills/url_variant:__subpackages__",
])

exports_files([
    "capture_url_devtools_and_dom.mjs",
])

pytype_strict_binary(
    name = "eval_url_variant",
    srcs = ["eval_url_variant.py"],
)

pytype_strict_binary(
    name = "plan_and_run_variant",
    srcs = ["plan_and_run_variant.py"],
)
