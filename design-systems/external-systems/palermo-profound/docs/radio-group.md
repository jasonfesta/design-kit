# Radio Group

Source: https://palermo.tryprofound.com/docs/radio-group

## Radio Group 
A set of mutually exclusive options where only one can be selected at a time. 

## Default 
Vertical by default. Control it with value and onValueChange , or let it manage itself with defaultValue . 

 Preview Code 

Option 1 
Option 2 
Option 3 

## Horizontal 

 Preview Code 

Default 

Comfortable 
Compact 

## Disabled 

 Preview Code 

Enabled option 
Disabled option 
Another enabled option 

## Read only 
Keeps the selected appearance but ignores clicks and keyboard focus. 

 Preview Code 

Read-only selected 
Read-only unselected 

## RadioGroup Properties 

Prop 
Type 
Description 

 value 

 string 

Controlled selected value. 

 defaultValue 

 string 

Initial selected value when uncontrolled. 

 onValueChange 

 (value: string) => void 

Called when the selected value changes. 

 orientation 

 'horizontal' 'vertical' 

Layout direction of the items. 

 disabled 

 boolean 

Disables every item. 

## RadioGroupItem Properties 

Prop 
Type 
Description 

 value 

 string 

Value submitted when this item is selected. 

 children 

 ReactNode 

Label rendered next to the radio control. 

 disabled 

 boolean 

Disables this item. 

 readOnly 

 boolean 

Prevents interaction while keeping the current appearance. 

 selectedIcon 

 ReactNode 

Replaces the default dot shown in the selected state. 

 disableHover 

 boolean 

Removes the row hover background. 

 disablePadding 

 boolean 

Removes the row padding. 

 Previous Progress Bar 
 Next 
 Scroll Area
