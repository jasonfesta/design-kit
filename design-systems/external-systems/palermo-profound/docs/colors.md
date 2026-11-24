# Colors

Source: https://palermo.tryprofound.com/docs/colors

## Colors 
The color system provides a comprehensive palette of semantic colors for
text, backgrounds, borders, and feature-specific elements. All colors are
defined as CSS custom properties and can be used with Tailwind CSS classes. 

## Background Colors 

bg-bg-base 

Light 
#ffffff 

Dark 
#1e1e1e 

bg-bg-primary 

Light 
#ffffff 

Dark 
#252525 

bg-bg-secondary 

Light 
#fafafa 

Dark 
#272727 

bg-bg-tertiary 

Light 
#f5f5f5 

Dark 
#343434 

bg-bg-quaternary 

Light 
#e8e8e8 

Dark 
#414141 

bg-bg-blue 

Light 
#376cff1a 

Dark 
#376cff1a 

bg-bg-purple 

Light 
#5d33f310 

Dark 
#5d33f333 

bg-bg-red 

Light 
#ff5f571a 

Dark 
#ff5f571a 

bg-bg-red-hover 

Light 
#ff5f572a 

Dark 
#ff5f572a 

bg-bg-green 

Light 
#15b4621a 

Dark 
#15b4621a 

bg-bg-green-hover 

Light 
#15b4622a 

Dark 
#15b4622a 

bg-bg-orange 

Light 
#f4a4621a 

Dark 
#f4a4621a 

bg-bg-orange-hover 

Light 
#f4a4622a 

Dark 
#f4a4622a 

bg-bg-overlay 

Light 
rgba(0, 0, 0, 0.1) 

Dark 
rgba(0, 0, 0, 0.1) 

bg-bg-header 

Light 
rgba(255, 255, 255, 0.7) 

Dark 
rgba(30, 30, 30, 0.7) 

bg-bg-tooltip 

Light 
rgba(24, 24, 26, 0.9) 

Dark 
rgba(24, 24, 26, 0.9) 

bg-bg-transparent 

Light 
transparent 

Dark 
transparent 

bg-dot-grid 

Light 
#cccccc 

Dark 
#cccccc 

## Fill Colors 

fill-fill-primary 

Light 
#18181a 

Dark 
#ffffff 

fill-fill-primary-hover 

Light 
#2c2c2e 

Dark 
#fafafa 

fill-fill-secondary 

Light 
#969696 

Dark 
#5a5a5a 

fill-fill-tertiary 

Light 
#d4d4d8 

Dark 
#464646 

fill-fill-quaternary 

Light 
#e8e8e8 

Dark 
#323232 

fill-fill-quinary 

Light 
#f0f0f0 

Dark 
#2a2a2a 

fill-fill-inverse 

Light 
#ffffff 

Dark 
#18181a 

fill-fill-green 

Light 
#15b462 

Dark 
#15b462 

fill-fill-green-hover 

Light 
#01a04e 

Dark 
#01a04e 

fill-fill-red 

Light 
#ff5f57 

Dark 
#ff5f57 

fill-fill-red-hover 

Light 
#e14139 

Dark 
#e14139 

fill-fill-blue 

Light 
#376cff 

Dark 
#376cff 

fill-fill-orange 

Light 
#f4a462 

Dark 
#f4a462 

fill-fill-orange-lightest 

Light 
#fcf9f7 

Dark 
#331a01 

fill-fill-orange-dark 

Light 
#db7b2c 

Dark 
#db7b2c 

fill-fill-tooltip 

Light 
rgba(24, 24, 26, 0.9) 

Dark 
rgba(24, 24, 26, 0.9) 

fill-fill-yellow 

Light 
#f9ff57 

Dark 
#5e602b 

## Control Colors 

control-control-bg 

Light 
#ffffff 

Dark 
#292929 

control-control-hover 

Light 
#fafafa 

Dark 
#333333 

control-control-selected 

Light 
#f1f1f1 

Dark 
#393939 

control-control-primary 

Light 
#18181a 

Dark 
#ffffff 

control-control-primary-hover 

Light 
#2c2c2e 

Dark 
#fafafa 

## Text Colors 

text-text-primary 

Light 
#18181a 

Dark 
#ffffff 

text-text-secondary 

Light 
#787878 

Dark 
#787878 

text-text-tertiary 

Light 
#969696 

Dark 
#969696 

text-text-quaternary 

Light 
#b4b4b4 

Dark 
#5a5a5a 

text-text-green 

Light 
#15b462 

Dark 
#15b462 

text-text-red 

Light 
#ff5f57 

Dark 
#ff5f57 

text-text-blue 

Light 
#376cff 

Dark 
#376cff 

text-text-purple 

Light 
#9747ff 

Dark 
#9747ff 

text-text-inverse 

Light 
#ffffff 

Dark 
#18181a 

text-text-orange 

Light 
#f4a462 

Dark 
#f4a462 

text-text-yellow 

Light 
#dcdc43 

Dark 
#ffff00 

text-text-tooltip 

Light 
#ffffff 

Dark 
#ffffff 

## Stroke Colors 

stroke-stroke-sunburst-loading 

Light 
rgba(255, 255, 255, 0.8) 

Dark 
rgba(255, 255, 255, 0.15) 

stroke-stroke-sunburst 

Light 
rgb(255, 255, 255) 

Dark 
rgba(255, 255, 255, 0.4) 

## Shadow appearances 

 Regular Hover Focus Borderless 
shadow-low 
shadow-low-hover 
shadow-low-focus 
shadow-low-borderless 
shadow-medium 
shadow-medium-hover 
shadow-medium-focus 
shadow-medium-borderless 
shadow-high 
No interaction states 
shadow-high-borderless 

Each regular shadow includes its border. Do not add a separate neutral border or ring.
Low and medium support hover and focus: hover adds a solid edge, while focus retains the depth and adds a 3px halo. High has no interaction states. Borderless keeps only the depth.
Apply states explicitly, for example: shadow-low hover:shadow-low-hover focus-visible:shadow-low-focus .
Use shadow-focus for the halo alone. 

## Shadow Colors 

shadow-ring-1 

Light 
rgba(0, 0, 0, 0.02) 

Dark 
rgba(0, 0, 0, 0) 

shadow-ring-2 

Light 
rgba(0, 0, 0, 0.05) 

Dark 
rgba(255, 255, 255, 0.1) 

shadow-shadow-1 

Light 
rgba(0, 0, 0, 0.02) 

Dark 
rgba(0, 0, 0, 0) 

shadow-shadow-2 

Light 
rgba(0, 0, 0, 0.05) 

Dark 
rgba(0, 0, 0, 0.1) 

shadow-stroke 

Light 
#ebebeb 

Dark 
#292929 

## Destructive Shadows 

shadow-shadow-red-1 

Light 
rgba(255, 95, 87, 0.08) 

Dark 
rgba(255, 95, 87, 0.15) 

shadow-shadow-red-2 

Light 
rgba(255, 95, 87, 0.12) 

Dark 
rgba(255, 95, 87, 0.25) 

shadow-shadow-red-3 

Light 
rgba(255, 95, 87, 0.2) 

Dark 
rgba(255, 95, 87, 0.3) 

## Workflow Colors 

workflow-workflow-bg-base 

Light 
rgb(247, 247, 247) 

Dark 
rgb(247, 247, 247) 

workflow-workflow-fill-green 

Light 
rgb(78, 168, 82) 

Dark 
rgb(78, 168, 82) 

workflow-workflow-fill-green-faint 

Light 
#00ae351a 

Dark 
#00ae351a 

workflow-workflow-fill-blue 

Light 
rgb(72, 148, 238) 

Dark 
rgb(72, 148, 238) 

workflow-workflow-fill-blue-faint 

Light 
#4894ee1a 

Dark 
#4894ee1a 

workflow-workflow-fill-purple 

Light 
rgb(141, 88, 247) 

Dark 
rgb(141, 88, 247) 

workflow-workflow-fill-orange 

Light 
rgb(255, 119, 78) 

Dark 
rgb(255, 119, 78) 

workflow-workflow-node-shadow-0 

Light 
rgba(0, 0, 0, 0) 

Dark 
rgba(0, 0, 0, 0) 

workflow-workflow-node-shadow-1 

Light 
rgba(0, 0, 0, 0.05) 

Dark 
rgba(0, 0, 0, 0.05) 

workflow-workflow-node-shadow-2 

Light 
rgba(0, 0, 0, 0.03) 

Dark 
rgba(0, 0, 0, 0.03) 

 Previous Get Started 
 Next 
 Typography
