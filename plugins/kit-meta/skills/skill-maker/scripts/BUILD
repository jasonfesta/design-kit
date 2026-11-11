load("//devtools/python/blaze:pytype.bzl", "pytype_strict_binary")

package(default_visibility = [
    "//experimental/users/jfesta/skills/skill_maker:__subpackages__",
])

pytype_strict_binary(
    name = "build_catalog",
    srcs = ["build_catalog.py"],
)

pytype_strict_binary(
    name = "sync_x20",
    srcs = ["sync_x20.py"],
)

pytype_strict_binary(
    name = "validate_and_wrap",
    srcs = ["validate_and_wrap.py"],
)
