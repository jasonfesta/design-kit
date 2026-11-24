# Segmented Tabs

Source: https://palermo.tryprofound.com/docs/segmented-tabs

## Segmented Tabs 
Pill-styled tabs where the active trigger fills with a control surface
instead of showing an underline. Built on the same Radix primitives as Tabs,
so it works as a full tab set or as a standalone controlled view switcher
when the panel content is rendered elsewhere. 

## Basic 
A full segmented tab set with content panels. 

 Preview Code 

 Matrix Table 

Matrix view content. 

## Controlled (list only) 
Use value + onValueChange and omit Content when the active view's content
is rendered elsewhere, e.g. in a section body separate from the toolbar. 

For a toolbar switcher whose content lives outside the control, prefer
 SegmentedToggleGroup (below). A Radix tablist without matching
 Content panels tells assistive tech to expect tabpanel s that do not
exist; the toggle group keeps button/ aria-pressed semantics instead. 

 Preview Code 

 Visibility Score Share of Voice Avg Position 
Selected: visibility-score 

## Toggle group (button semantics) 
 SegmentedToggleGroup has the same pill look but renders a role="group" of
toggle buttons with aria-pressed instead of a Radix tablist . Use it for
toolbar switchers that swap surrounding content rather than Radix tab panels.
Pass an aria-label on the Root to name the group. 

 Preview Code 

 Matrix Table 
Selected: matrix 

 Previous Section Header 
 Next 
 Separator
