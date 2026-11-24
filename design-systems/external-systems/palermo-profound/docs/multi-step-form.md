# Multi-step Form

Source: https://palermo.tryprofound.com/docs/multi-step-form

## Multi-step Form 
A fixed-height form that derives its own pages by measuring its fields. 

Most steppers ask you to declare the steps. This one measures and works them
out, because the thing a layout actually depends on — how tall a field renders
 at this width — is not knowable when the markup is written. A short input and
a four-row textarea are not the same height, and the answer changes with the
container. 
 The contract is that the outer height never changes. Pages are split to fit
that height, not the other way around. 

## Default 
Six fields of unequal height. Nothing here declares a step. 

 Preview Code 

Inputs 

 Brand 

 Target keyword 

 Brief 

 Competitor 

 Tone notes 

 Owner 

 Submit 

## Height drives the split 
The same six fields at three heights. The frame is whatever you asked for and
never moves; the number of pages is whatever fits. 
 height takes a number (pixels) or any CSS length. The default is
 min(28rem, 70vh) — capped against the viewport so a short window can never
push the footer, and therefore the only way to advance, off-screen. 

 Preview Code 

 240 px 
 360 px 
 520 px 

Fixed at 360px 

 Brand 

 Target keyword 

 Brief 

 Competitor 

 Tone notes 

 Owner 

 Submit 

## Page-sizing modes 
 mode decides how many fields go on a page. 

 fill (default) packs each page with as many fields as fit. Fewest
pages, but ragged — a tall field that follows three short ones lands on a
page of its own, so the reader gets three fields, then one, then four. 

 uniform gives every page the same number of fields, chosen so that even
the tallest of them fits, then spreads the fields evenly across the resulting
pages. Seven fields at three-per-page come out 3,2,2 , not 3,3,1 . 

Worked example: if a labelled input tops out at 150px and the content area is
450px tall, uniform puts three per page — and keeps three per page no matter
which fields land where. 
 The trade-off is real and worth knowing. uniform is sized by the worst
case, so a single outlier — one tall textarea among ten inputs — collapses
 every page down to what fits that outlier. fill never wastes space but
never looks even. Reach for uniform when the fields are of similar height,
which is the usual shape of a labelled form. 

 Preview Code 

mode=" fill " 

Inputs 

 Brand 

 Keyword 

 Competitor 

 Market 

 Owner 

 Budget 

 Deadline 

 Submit 

mode=" uniform " 

Inputs 

 Brand 

 Keyword 

 Competitor 

 Market 

 Owner 

 Budget 

 Deadline 

 Submit 

## Gating a page 
 canAdvance receives the page being left and the keys of the fields on it .
Return false to stay put, or a promise to gate on async validation — the
primary action shows a loading state until it settles. 
 Validate the fields in fieldKeys , not the page number. Which fields share
a page is derived from measurement and changes with the container: fields A and
B may be pages 0 and 1 when narrow and both page 0 when wide, so a validator
that maps step 0 to A would pass the page while B went unchecked. The keys are
the caller's own, so keying fields by field id maps them straight back. 
Validate only that page's fields — checking the whole form would report errors
on fields the person has not reached yet. Back is never gated, because a
half-filled page someone is leaving is not an error. 

 Preview Code 

Required on page one 

 Brand 

 Brief 

 Owner 

 Submit 

## Custom chrome 
 useMultiStepForm() exposes the state and actions, so a surface can replace the
footer entirely instead of prop-drilling next and back . 

 Preview Code 

Custom footer 

 Brand 

 Target keyword 

 Brief 

 Competitor 

 Tone notes 

 Owner 

 Page 1 of 1 

 Previous 
 Run agent 

## A form that fits 
No counter, no Back, no page chrome. A form that did not need to split should
not advertise that it could have — so the stepping UI simply is not there. 

 Preview Code 

Fits in one page 

 Brand 

 Owner 

 Submit 

## Anatomy 
 Slot Purpose 
 Root Owns height, page state, and the advance gate. 
 Header / Footer Fixed regions. Subtracted from the usable content height, never paged. 
 Content The paged region. Each direct child is one indivisible block. 
 Item Groups a label with its control so a split cannot fall between them. 
 Actions / Back / Next Default controls. Actions accepts children to replace them. 
 Counter / Progress The 2/5 readout and a hairline fill. Both hide on a single-page form. 

## Root props 
 Prop Type Default 
 height number | string min(28rem, 70vh) 
 gap number 8 
 mode 'fill' | 'uniform' 'fill' 
 step / defaultStep number 0 
 onStepChange (step: number) => void — 
 onSubmit () => void | Promise<void> — 
 canAdvance (step, fieldKeys) => boolean | Promise<boolean> — 

## Notes 

 Every field stays mounted , on or off the visible page. Paging back never
loses what was typed, and form-library registrations survive. Off-page fields
are moved out of flow and made inert . 

 Give dynamic children explicit keys. Wrappers key on the child's own key,
and Children.toArray generates a positional one ( .0 , .1 ) for an
unkeyed child — an index wearing a different name. A list whose fields can be
inserted, removed, or reordered therefore needs real keys from you. A static
list needs nothing. 

 A field taller than the page gets its own page, and that page scrolls.
Dropping it would hide a field and submit without it. 

 This package ships no translations. Default labels are English literals;
pass translated nodes as children and use Counter 's format for the readout. 

 Previous Input 
 Next 
 Pagination
