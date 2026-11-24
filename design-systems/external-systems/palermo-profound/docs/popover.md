# Popover

Source: https://palermo.tryprofound.com/docs/popover

## Popover 
A floating panel that appears on demand, containing supplementary content or
actions. 

## Basic Usage 
A simple popover with content and actions. 

 Preview Code 

 Open Popover 

## Info Popover 
A popover for displaying informational content with an icon. 

 Preview Code 

 Info Popover 

## Form Popover 
A popover containing form elements for quick interactions. 

 Preview Code 

 Form Popover 

## Usage 

## Properties 

Prop 
Type 
Description 

 open 

 boolean 

Whether the popover is open 

 onOpenChange 

 (open: boolean) => void 

Callback when the open state changes 

 defaultOpen 

 boolean 

Default open state 

 modal 

 boolean 

Whether the popover should be modal 

 side 

 'top' 'right' 'bottom' 'left' 

Preferred side of the trigger to render against 

 sideOffset 

 number 

Distance in pixels from the trigger 

 align 

 'start' 'center' 'end' 

Alignment of the popover content 

 alignOffset 

 number 

Additional offset in pixels for the alignment 

 avoidCollisions 

 boolean 

Whether the popover should avoid collisions with viewport edges 

 collisionBoundary 

 Element null Array<Element> 

Elements to use as collision boundaries 

 collisionPadding 

 number Partial<Record<Side, number>> 

Padding to add to collision boundaries 

 arrowPadding 

 number 

Padding between the arrow and the edges of the popover 

 sticky 

 'partial' 'always' 

Whether the popover should stick to the trigger 

 hideWhenDetached 

 boolean 

Whether to hide the popover when the trigger becomes detached 

 withRadixPortal 

 boolean 

Render the content through a Radix Portal 

 className 

 string 

Additional CSS classes to apply to the popover content 

 Previous Pill / Tag 
 Next 
 Progress Bar
