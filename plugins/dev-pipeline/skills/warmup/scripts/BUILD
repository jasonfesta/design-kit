load("//devtools/python/blaze:pytype.bzl", "pytype_strict_binary")

package(default_visibility = [
    "//experimental/users/jfesta/skills/warmup:__subpackages__",
])

pytype_strict_binary(
    name = "check_models",
    srcs = ["check_models.py"],
)

pytype_strict_binary(
    name = "compare_builds",
    srcs = ["compare_builds.py"],
)

pytype_strict_binary(
    name = "eval_warmup",
    srcs = ["eval_warmup.py"],
)

pytype_strict_binary(
    name = "prepare_and_extract",
    srcs = ["prepare_and_extract.py"],
)

pytype_strict_binary(
    name = "run_warmup",
    srcs = ["run_warmup.py"],
)
