load("//devtools/python/blaze:pytype.bzl", "pytype_strict_binary")

package(default_visibility = [
    "//experimental/users/jfesta/skills/chair_studio_threejs:__subpackages__",
])

exports_files([
    "render_and_compare_chair.mjs",
])

pytype_strict_binary(
    name = "harvest_rss_chair",
    srcs = ["harvest_rss_chair.py"],
)

pytype_strict_binary(
    name = "probe_white_studio_chair",
    srcs = ["probe_white_studio_chair.py"],
)
