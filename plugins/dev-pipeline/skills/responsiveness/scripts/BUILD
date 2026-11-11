load("//devtools/python/blaze:pytype.bzl", "pytype_strict_binary")

package(default_visibility = [
    "//experimental/users/jfesta/skills/responsiveness:__subpackages__",
])

exports_files([
    "eval-responsive-pair.mjs",
])

pytype_strict_binary(
    name = "crop-and-clean-plate",
    srcs = ["crop-and-clean-plate.py"],
)
