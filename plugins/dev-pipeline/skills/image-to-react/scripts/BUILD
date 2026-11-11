load("//devtools/python/blaze:pytype.bzl", "pytype_strict_binary")

package(default_visibility = [
    "//experimental/users/jfesta/skills/image_to_react:__subpackages__",
])

exports_files([
    "eval-image-to-react.mjs",
    "eval-multi-screen-project.mjs",
    "scaffold-golden-from-image.mjs",
])

pytype_strict_binary(
    name = "ingest-nano-banana",
    srcs = ["ingest-nano-banana.py"],
)
