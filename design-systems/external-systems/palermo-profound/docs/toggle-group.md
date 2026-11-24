# Toggle Group

Source: https://palermo.tryprofound.com/docs/toggle-group

## Toggle Group 
A set of two-state buttons that can be toggled on or off, typically used for
filtering or switching between different views or options. 

## Basic 
Basic toggle group with single selection mode. 

 Preview Code 

 Option 1 Option 2 Option 3 

## Multiple Selection 
Toggle group with multiple selection mode allowing multiple items to be selected. 

 Preview Code 

 Option 1 Option 2 Option 3 

## Sizes 
Different sizes for toggle group components. 

 Preview Code 

Small 

 Small Medium 

Default 

 Default Large 

## With Icons 
Use iconStart or iconEnd for icons. Keep children reserved for the item label; icon-only items must provide an accessible label. 

 Preview Code 

## Controlled 
Toggle group with controlled state management. 

 Preview Code 

 Option 1 Option 2 Option 3 
Selected: option1 

## Disabled 
Toggle group with disabled items. 

 Preview Code 

 Option 1 Option 2 (Disabled) Option 3 

## Usage 

## ToggleGroup.Root 

Prop 
Type 
Description 

 type 

 'single' 'multiple' 

The type of toggle group - single or multiple selection 

 value 

 string string[] 

The current value(s) of the toggle group (controlled) 

 defaultValue 

 string string[] 

The default value(s) of the toggle group (uncontrolled) 

 onValueChange 

 (value: string string[]) => void 

Callback fired when the value changes 

 disabled 

 boolean 

Whether the toggle group is disabled 

 aria-label 

 string 

Accessible label for the toggle group 

 className 

 string 

Additional CSS classes to apply to the toggle group 

## ToggleGroup.Item 

Prop 
Type 
Description 

 value 

 string 

The value of the toggle item 

 children 

 ReactNode 

Label displayed by the toggle item 

 iconStart 

 ToggleGroupIcon 

Icon displayed before the label 

 iconEnd 

 ToggleGroupIcon 

Icon displayed after the label 

 disabled 

 boolean 

Whether the toggle item is disabled 

 aria-label 

 string 

Accessible label for the toggle item 

 className 

 string 

Additional CSS classes to apply to the toggle item 

 Previous Toast 
 Next 
 Tooltip
