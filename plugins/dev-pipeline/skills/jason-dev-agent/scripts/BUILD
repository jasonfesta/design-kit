load("//devtools/python/blaze:pytype.bzl", "pytype_strict_binary")

package(default_visibility = [
    "//experimental/users/jfesta/skills/jason_dev_agent:__subpackages__",
])

exports_files([
    "verify_html_bundle.mjs",
])

pytype_strict_binary(
    name = "run_checkback_loop",
    srcs = ["run_checkback_loop.py"],
)

pytype_strict_binary(
    name = "run_dev_flywheel",
    srcs = ["run_dev_flywheel.py"],
)

pytype_strict_binary(
    name = "run_dev_loop",
    srcs = ["run_dev_loop.py"],
)
