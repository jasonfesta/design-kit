# Commandbar

Source: https://palermo.tryprofound.com/docs/commandbar

## Command Bar 
A command menu interface for quick actions and navigation. 

## Basic Usage 
Command bars provide a quick way to access commands and navigate through your application. 

 Preview Code 

 Open Command Bar 

## Inline Command Bar 
Command bars can also be used inline without a modal overlay. 

 Preview Code 

No results found. 

Suggestions 

Dashboard 
Settings 
Search 

Recent 

Recent Item 1 
Recent Item 2 

## Usage 

## Properties 

Prop 
Type 
Description 

 Command.Root 

 ComponentPropsWithoutRef<typeof CommandPrimitive> & { inDialog?: boolean } 

Root command component that wraps all other command components 

 Command.Input 

 ComponentPropsWithoutRef<typeof CommandPrimitive.Input> 

Input field for searching and filtering commands 

 Command.List 

 ComponentPropsWithoutRef<typeof CommandPrimitive.List> 

Container for command items with scrollable list 

 Command.Item 

 ComponentPropsWithoutRef<typeof CommandPrimitive.Item> 

Individual command item that can be selected 

 Command.Group 

 ComponentPropsWithoutRef<typeof CommandPrimitive.Group> 

Groups related command items with optional heading 

 Command.Empty 

 ComponentPropsWithoutRef<typeof CommandPrimitive.Empty> 

Displayed when no search results are found 

 Command.Separator 

 ComponentPropsWithoutRef<typeof CommandPrimitive.Separator> 

Visual separator between command groups 

 className 

 string 

Additional CSS classes to apply to the component 

 onSelect 

 (value: string) => void 

Callback fired when a command item is selected 

 onValueChange 

 (value: string) => void 

Callback fired when the command value changes 

 value 

 string 

Controlled value of the command or command item 

 defaultValue 

 string 

Default value of the command 

 shouldFilter 

 boolean 

Whether to filter items based on input value 

 heading 

 string 

Heading text for command groups 

 disabled 

 boolean 

Whether the command item is disabled 

 Previous Collapsible 
 Next 
 Composer
